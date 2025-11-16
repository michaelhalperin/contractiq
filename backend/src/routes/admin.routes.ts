import express, { Response } from 'express';
import { User } from '../models/User.js';
import { Contract } from '../models/Contract.js';
import { Subscription } from '../models/Subscription.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').limit(100);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get metrics
router.get('/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
    const totalContracts = await Contract.countDocuments();
    const completedContracts = await Contract.countDocuments({ status: 'completed' });

    // Plan breakdown
    const planBreakdown = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 },
        },
      },
    ]);

    // Contracts by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const contractsByMonth = await Contract.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      contracts: {
        total: totalContracts,
        completed: completedContracts,
      },
      planBreakdown,
      contractsByMonth,
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get revenue stats (from subscriptions)
router.get('/revenue', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activeSubscriptions = await Subscription.find({ status: 'active' });
    
    const revenueByPlan: Record<string, number> = {
      pro: 0,
      business: 0,
      enterprise: 0,
    };

    activeSubscriptions.forEach((sub) => {
      const plan = sub.plan;
      if (plan === 'pro') revenueByPlan.pro += 29;
      else if (plan === 'business') revenueByPlan.business += 79;
      else if (plan === 'enterprise') revenueByPlan.enterprise += 499;
    });

    const mrr = revenueByPlan.pro + revenueByPlan.business + revenueByPlan.enterprise;

    res.json({
      mrr,
      revenueByPlan,
      activeSubscriptions: activeSubscriptions.length,
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
});

export default router;

