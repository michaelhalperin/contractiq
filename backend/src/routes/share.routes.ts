import express, { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { ShareableReport } from '../models/ShareableReport.js';
import { Contract } from '../models/Contract.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create shareable link
router.post(
  '/create',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { contractId, password, expiresInDays } = req.body;

      const contract = await Contract.findOne({
        _id: contractId,
        userId: req.user!._id,
      });

      if (!contract) {
        res.status(404).json({ error: 'Contract not found' });
        return;
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Calculate expiration
      let expiresAt: Date | undefined;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      const shareableReport = new ShareableReport({
        contractId: contract._id,
        token,
        password: hashedPassword,
        expiresAt,
      });

      await shareableReport.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const shareUrl = `${frontendUrl}/share/${token}`;

      res.json({ shareUrl, token });
    } catch (error) {
      console.error('Create share error:', error);
      res.status(500).json({ error: 'Failed to create shareable link' });
    }
  }
);

// Get shared contract (public, no auth required)
router.get('/:token', async (req: express.Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.query;

    const shareableReport = await ShareableReport.findOne({ token });

    if (!shareableReport) {
      res.status(404).json({ error: 'Share link not found' });
      return;
    }

    // Check expiration
    if (shareableReport.expiresAt && shareableReport.expiresAt < new Date()) {
      res.status(410).json({ error: 'Share link has expired' });
      return;
    }

    // Check password if required
    if (shareableReport.password) {
      if (!password || typeof password !== 'string') {
        res.status(401).json({ error: 'Password required' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, shareableReport.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    }

    // Get contract
    const contract = await Contract.findById(shareableReport.contractId);

    if (!contract || contract.status !== 'completed' || !contract.analysis) {
      res.status(404).json({ error: 'Contract not available' });
      return;
    }

    res.json({
      contract: {
        id: contract._id,
        fileName: contract.fileName,
        analysis: contract.analysis,
      },
    });
  } catch (error) {
    console.error('Get share error:', error);
    res.status(500).json({ error: 'Failed to fetch shared contract' });
  }
});

export default router;

