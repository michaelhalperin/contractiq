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
import { getMaxFileSize, getContractHistoryDays, canExportFormat, hasFeature } from '../utils/planLimits.js';
import { exportContract } from '../services/export.service.js';

const router = express.Router();

// Dynamic multer configuration based on user plan
const createUploadMiddleware = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // Max 100MB (will be checked per plan in route)
    },
    fileFilter: (req, file, cb) => {
      // Get user plan to determine allowed file types
      const allowedTypesFree = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      const allowedTypesPro = [
        ...allowedTypesFree,
        'application/rtf',
        'text/rtf',
        'application/vnd.oasis.opendocument.text'
      ];
      
      // Default to free plan if user not authenticated yet (will be checked in route)
      const allowedTypes = allowedTypesPro; // Allow all types, check in route based on plan
      
      if (allowedTypes.includes(file.mimetype) || 
          file.originalname.toLowerCase().endsWith('.rtf') ||
          file.originalname.toLowerCase().endsWith('.odt')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Allowed types depend on your subscription plan.'));
      }
    },
  });
};

const upload = createUploadMiddleware();

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

      // Check file size based on user's plan
      const user = await User.findById(req.user!._id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const maxFileSizeMB = getMaxFileSize(user.subscriptionPlan);
      const maxFileSizeBytes = maxFileSizeMB === -1 ? Infinity : maxFileSizeMB * 1024 * 1024;

      if (req.file.size > maxFileSizeBytes) {
        res.status(400).json({
          error: `File size exceeds plan limit`,
          maxSizeMB: maxFileSizeMB,
          fileSizeMB: Math.round((req.file.size / (1024 * 1024)) * 100) / 100,
          plan: user.subscriptionPlan,
        });
        return;
      }

      const file = req.file;
      
      // Determine file type from mimetype or extension
      let fileType: 'pdf' | 'docx' | 'txt' | 'rtf' | 'odt';
      const fileName = file.originalname.toLowerCase();
      
      if (file.mimetype === 'application/pdf' || fileName.endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        fileType = 'docx';
      } else if (file.mimetype === 'application/rtf' || file.mimetype === 'text/rtf' || fileName.endsWith('.rtf')) {
        fileType = 'rtf';
      } else if (file.mimetype === 'application/vnd.oasis.opendocument.text' || fileName.endsWith('.odt')) {
        fileType = 'odt';
      } else if (file.mimetype === 'text/plain' || fileName.endsWith('.txt')) {
        fileType = 'txt';
      } else {
        res.status(400).json({ error: 'Unsupported file type' });
        return;
      }

      // Check if file type is allowed for user's plan
      const allowedTypesFree: Array<'pdf' | 'docx' | 'txt'> = ['pdf', 'docx', 'txt'];
      const allowedTypesPro: Array<'pdf' | 'docx' | 'txt' | 'rtf' | 'odt'> = ['pdf', 'docx', 'txt', 'rtf', 'odt'];
      
      const isProOrHigher = user.subscriptionPlan === 'pro' || 
                            user.subscriptionPlan === 'business' || 
                            user.subscriptionPlan === 'enterprise';
      
      const allowedTypes = isProOrHigher ? allowedTypesPro : allowedTypesFree;
      
      if (!allowedTypes.includes(fileType)) {
        res.status(403).json({
          error: `File type ${fileType.toUpperCase()} is not available for your plan. Upgrade to Pro or higher to use RTF and ODT files.`,
          plan: user.subscriptionPlan,
          allowedTypes: allowedTypesFree,
        });
        return;
      }

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

        // Analyze with AI (with plan-based depth)
        const analysis = await analyzeContract(text, user.subscriptionPlan);

        // Save analysis
        contract.analysis = analysis;
        contract.status = 'completed';
        await contract.save();

        // Update user's contract count (already fetched above)
        user.contractsUsedThisMonth += 1;
        await user.save();

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

// Get user's contracts (with plan-based history filtering)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Build query with history limit based on plan
    const query: any = { userId: req.user!._id };
    const historyDays = getContractHistoryDays(user.subscriptionPlan);
    
    if (historyDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - historyDays);
      query.createdAt = { $gte: cutoffDate };
    }

    const contracts = await Contract.find(query)
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

// Export contract (Pro+ plans)
router.get('/:id/export/:format', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const format = req.params.format.toLowerCase() as 'pdf' | 'word' | 'excel' | 'csv' | 'json';
    
    // Check if user's plan supports this export format
    if (!canExportFormat(user.subscriptionPlan, format)) {
      res.status(403).json({
        error: 'Export format not available for your plan',
        plan: user.subscriptionPlan,
        availableFormats: ['pdf'], // Free plan only has PDF
      });
      return;
    }

    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!contract || !contract.analysis) {
      res.status(404).json({ error: 'Contract not found or not analyzed' });
      return;
    }

    const branded = hasFeature(user.subscriptionPlan, 'hasBrandedReports');
    const exportBuffer = await exportContract({
      format,
      contractName: contract.fileName,
      analysis: contract.analysis,
      branded,
    });

    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json',
    };

    const extensionMap: Record<string, string> = {
      pdf: 'pdf',
      word: 'docx',
      excel: 'xlsx',
      csv: 'csv',
      json: 'json',
    };

    res.setHeader('Content-Type', contentTypeMap[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${contract.fileName.replace(/\.[^/.]+$/, '')}.${extensionMap[format]}"`);
    res.send(exportBuffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export contract' });
  }
});

// Compare contracts (Pro+ plans)
router.post('/compare', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!hasFeature(user.subscriptionPlan, 'hasComparison')) {
      res.status(403).json({
        error: 'Contract comparison is not available for your plan',
        plan: user.subscriptionPlan,
      });
      return;
    }

    const { contractIds } = req.body;
    if (!Array.isArray(contractIds) || contractIds.length < 2) {
      res.status(400).json({ error: 'Please provide at least 2 contract IDs to compare' });
      return;
    }

    const contracts = await Contract.find({
      _id: { $in: contractIds },
      userId: req.user!._id,
    }).select('fileName analysis');

    if (contracts.length !== contractIds.length) {
      res.status(404).json({ error: 'One or more contracts not found' });
      return;
    }

    // Enhanced comparison with detailed data
    const comparison = {
      contracts: contracts.map(c => ({
        id: c._id,
        fileName: c.fileName,
        summary: c.analysis?.summary,
        riskCount: c.analysis?.riskFlags.length || 0,
        keyParties: c.analysis?.keyParties,
        duration: c.analysis?.duration,
        paymentTerms: c.analysis?.paymentTerms,
        obligations: c.analysis?.obligations || [],
        dates: c.analysis?.dates,
        financialDetails: c.analysis?.financialDetails,
        legalInfo: c.analysis?.legalInfo,
        contractMetadata: c.analysis?.contractMetadata,
        structuredTerms: c.analysis?.structuredTerms,
        performanceMetrics: c.analysis?.performanceMetrics,
        riskFlags: c.analysis?.riskFlags || [],
      })),
      differences: {
        riskLevels: contracts.map(c => ({
          contractId: c._id,
          fileName: c.fileName,
          highRisks: c.analysis?.riskFlags.filter(r => r.severity === 'high').length || 0,
          mediumRisks: c.analysis?.riskFlags.filter(r => r.severity === 'medium').length || 0,
          lowRisks: c.analysis?.riskFlags.filter(r => r.severity === 'low').length || 0,
        })),
      },
      // Comparison insights
      insights: {
        financialComparison: contracts.map(c => ({
          contractId: c._id,
          fileName: c.fileName,
          totalValue: c.analysis?.financialDetails?.totalValue,
          currency: c.analysis?.financialDetails?.currency,
          paymentAmounts: c.analysis?.financialDetails?.paymentAmounts || [],
        })),
        dateComparison: contracts.map(c => ({
          contractId: c._id,
          fileName: c.fileName,
          startDate: c.analysis?.dates?.startDate,
          endDate: c.analysis?.dates?.endDate,
          duration: c.analysis?.duration,
        })),
        legalComparison: contracts.map(c => ({
          contractId: c._id,
          fileName: c.fileName,
          governingLaw: c.analysis?.legalInfo?.governingLaw,
          jurisdiction: c.analysis?.legalInfo?.jurisdiction,
          disputeResolution: c.analysis?.legalInfo?.disputeResolution,
        })),
        termsComparison: contracts.map(c => ({
          contractId: c._id,
          fileName: c.fileName,
          renewal: c.analysis?.structuredTerms?.renewal,
          termination: c.analysis?.structuredTerms?.termination,
          intellectualProperty: c.analysis?.structuredTerms?.intellectualProperty,
          confidentiality: c.analysis?.structuredTerms?.confidentiality,
        })),
      },
    };

    res.json(comparison);
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Failed to compare contracts' });
  }
});

// Bulk upload contracts (Business+ plans)
router.post('/bulk-upload', authenticate, checkPlanLimits, upload.array('files', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!hasFeature(user.subscriptionPlan, 'hasBulkProcessing')) {
      res.status(403).json({
        error: 'Bulk processing is not available for your plan',
        plan: user.subscriptionPlan,
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const maxFileSizeMB = getMaxFileSize(user.subscriptionPlan);
    const maxFileSizeBytes = maxFileSizeMB === -1 ? Infinity : maxFileSizeMB * 1024 * 1024;

    const results = [];
    for (const file of files) {
      if (file.size > maxFileSizeBytes) {
        results.push({
          fileName: file.originalname,
          status: 'failed',
          error: 'File size exceeds plan limit',
        });
        continue;
      }

      try {
        // Determine file type from mimetype or extension
        let fileType: 'pdf' | 'docx' | 'txt' | 'rtf' | 'odt';
        const fileName = file.originalname.toLowerCase();
        
        if (file.mimetype === 'application/pdf' || fileName.endsWith('.pdf')) {
          fileType = 'pdf';
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
          fileType = 'docx';
        } else if (file.mimetype === 'application/rtf' || file.mimetype === 'text/rtf' || fileName.endsWith('.rtf')) {
          fileType = 'rtf';
        } else if (file.mimetype === 'application/vnd.oasis.opendocument.text' || fileName.endsWith('.odt')) {
          fileType = 'odt';
        } else if (file.mimetype === 'text/plain' || fileName.endsWith('.txt')) {
          fileType = 'txt';
        } else {
          results.push({
            fileName: file.originalname,
            status: 'failed',
            error: 'Unsupported file type',
          });
          continue;
        }

        // Check if file type is allowed for user's plan
        const allowedTypesFree: Array<'pdf' | 'docx' | 'txt'> = ['pdf', 'docx', 'txt'];
        const allowedTypesPro: Array<'pdf' | 'docx' | 'txt' | 'rtf' | 'odt'> = ['pdf', 'docx', 'txt', 'rtf', 'odt'];
        
        const isProOrHigher = user.subscriptionPlan === 'pro' || 
                              user.subscriptionPlan === 'business' || 
                              user.subscriptionPlan === 'enterprise';
        
        const allowedTypes = isProOrHigher ? allowedTypesPro : allowedTypesFree;
        
        if (!allowedTypes.includes(fileType)) {
          results.push({
            fileName: file.originalname,
            status: 'failed',
            error: `File type ${fileType.toUpperCase()} not available for your plan`,
          });
          continue;
        }

        const fileUrl = await uploadToLocal(file.buffer, file.originalname);
        const contract = new Contract({
          userId: req.user!._id,
          fileName: file.originalname,
          fileType,
          fileUrl,
          fileSize: file.size,
          status: 'processing',
        });
        await contract.save();

        // Process asynchronously
        extractTextFromFile(file.buffer, fileType)
          .then(({ text }) => analyzeContract(text, user.subscriptionPlan))
          .then(analysis => {
            contract.analysis = analysis;
            contract.status = 'completed';
            return contract.save();
          })
          .then(() => {
            user.contractsUsedThisMonth += 1;
            return user.save();
          })
          .catch(error => {
            console.error(`Error processing ${file.originalname}:`, error);
            contract.status = 'failed';
            contract.errorMessage = error.message;
            return contract.save();
          });

        results.push({
          fileName: file.originalname,
          status: 'processing',
          contractId: contract._id,
        });
      } catch (error) {
        results.push({
          fileName: file.originalname,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.json({ results, total: files.length });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// Analytics dashboard (Business+ plans)
router.get('/analytics/overview', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!hasFeature(user.subscriptionPlan, 'hasAnalytics')) {
      res.status(403).json({
        error: 'Analytics dashboard is not available for your plan',
        plan: user.subscriptionPlan,
      });
      return;
    }

    const contracts = await Contract.find({ userId: req.user!._id });

    const analytics = {
      totalContracts: contracts.length,
      completedContracts: contracts.filter(c => c.status === 'completed').length,
      totalRiskFlags: contracts.reduce((sum, c) => sum + (c.analysis?.riskFlags.length || 0), 0),
      highRiskContracts: contracts.filter(c => 
        (c.analysis?.riskFlags.filter(r => r.severity === 'high').length || 0) > 0
      ).length,
      riskDistribution: {
        high: contracts.reduce((sum, c) => 
          sum + (c.analysis?.riskFlags.filter(r => r.severity === 'high').length || 0), 0
        ),
        medium: contracts.reduce((sum, c) => 
          sum + (c.analysis?.riskFlags.filter(r => r.severity === 'medium').length || 0), 0
        ),
        low: contracts.reduce((sum, c) => 
          sum + (c.analysis?.riskFlags.filter(r => r.severity === 'low').length || 0), 0
        ),
      },
      contractsByMonth: contracts.reduce((acc, c) => {
        const month = new Date(c.createdAt).toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

