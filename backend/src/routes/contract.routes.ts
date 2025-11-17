import express, { Response } from 'express';
import multer from 'multer';
import { Contract } from '../models/Contract.js';
import { User } from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { checkPlanLimits } from '../middleware/planLimits.middleware.js';
import { extractTextFromFile } from '../services/fileParser.service.js';
import { uploadToLocal, deleteFromLocal } from '../services/localStorage.service.js';
import { analyzeContract } from '../services/openai.service.js';
import { sendAnalysisCompleteEmail } from '../services/email.service.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// Upload and analyze contract
router.post(
  '/upload',
  authenticate,
  checkPlanLimits,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = req.file;
      const fileType = file.mimetype === 'application/pdf' ? 'pdf' :
                      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' :
                      'txt';

      let contract: InstanceType<typeof Contract> | null = null;

      try {
        // Upload to local storage first (for development)
        const fileUrl = await uploadToLocal(file.buffer, file.originalname);

        // Create contract record after successful local upload
        contract = new Contract({
          userId: req.user!._id,
          fileName: file.originalname,
          fileType,
          fileUrl,
          fileSize: file.size,
          status: 'processing',
        });

        await contract.save();

        // Extract text from file
        const { text } = await extractTextFromFile(file.buffer, fileType);

        // Analyze with AI
        const analysis = await analyzeContract(text);

        // Save analysis
        contract.analysis = analysis;
        contract.status = 'completed';
        await contract.save();

        // Update user's contract count
        const user = await User.findById(req.user!._id);
        if (user) {
          user.contractsUsedThisMonth += 1;
          await user.save();
        }

        // Send email notification
        try {
          await sendAnalysisCompleteEmail(
            user?.email ?? '',
            typeof contract._id === 'string' ? contract._id : contract._id?.toString?.() ?? '',
            contract.fileName
          );
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the request if email fails
        }

        res.json({
          id: contract._id,
          fileName: contract.fileName,
          status: contract.status,
          analysis: contract.analysis,
        });
      } catch (error) {
        // If contract was created, update its status
        if (contract?._id) {
          try {
            contract.status = 'failed';
            contract.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await contract.save();

            // Delete from local storage if uploaded
            if (contract.fileUrl) {
              try {
                await deleteFromLocal(contract.fileUrl);
              } catch (deleteError) {
                console.error('Failed to delete file from local storage:', deleteError);
              }
            }
          } catch (saveError) {
            console.error('Failed to update contract status:', saveError);
          }
        }

        console.error('Upload error:', error);
        res.status(500).json({
          error: 'Failed to process contract',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// Get user's contracts
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contracts = await Contract.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .select('-analysis'); // Don't send full analysis in list

    res.json(contracts.map(contract => ({
      id: contract._id,
      fileName: contract.fileName,
      fileType: contract.fileType,
      status: contract.status,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    })));
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get contract details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    res.json({
      id: contract._id,
      fileName: contract.fileName,
      fileType: contract.fileType,
      fileUrl: contract.fileUrl,
      status: contract.status,
      analysis: contract.analysis,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update contract
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    // Update fileName if provided
    if (req.body.fileName && typeof req.body.fileName === 'string') {
      contract.fileName = req.body.fileName.trim();
      await contract.save();
    }

    res.json({
      id: contract._id,
      fileName: contract.fileName,
      fileType: contract.fileType,
      fileUrl: contract.fileUrl,
      status: contract.status,
      analysis: contract.analysis,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    // Delete from local storage
    if (contract.fileUrl) {
      try {
        await deleteFromLocal(contract.fileUrl);
      } catch (error) {
        console.error('Failed to delete file from local storage:', error);
      }
    }

    await Contract.deleteOne({ _id: contract._id });

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

export default router;

