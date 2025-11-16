import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { PLAN_LIMITS } from '../utils/planLimits.js';

export const checkPlanLimits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = req.user;
    
    // Special users with unlimited uploads
    const unlimitedUsers = ['69145efd8303997b6260b2e7'];
    const userId = user._id?.toString() || String(user._id);
    if (unlimitedUsers.includes(userId)) {
      next();
      return;
    }

    const planLimits = PLAN_LIMITS[user.subscriptionPlan];

    // Check if user has reached monthly limit
    if (planLimits.contractsPerMonth > 0 && user.contractsUsedThisMonth >= planLimits.contractsPerMonth) {
      res.status(403).json({
        error: 'Monthly contract limit reached',
        plan: user.subscriptionPlan,
        limit: planLimits.contractsPerMonth,
        used: user.contractsUsedThisMonth,
      });
      return;
    }

    // Reset monthly count if needed
    const now = new Date();
    const lastReset = user.lastResetDate || user.createdAt;
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 30) {
      user.contractsUsedThisMonth = 0;
      user.lastResetDate = now;
      await user.save();
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking plan limits' });
  }
};

