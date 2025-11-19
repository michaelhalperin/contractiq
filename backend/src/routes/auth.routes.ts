import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../utils/validation.js';
import { sendWelcomeEmail, sendPasswordChangedEmail, sendEmailChangedEmail, sendPasswordResetEmail, sendVerificationEmail } from '../services/email.service.js';
import crypto from 'crypto';

const router = express.Router();

// Helper function to get and validate JWT secret
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('JWT_SECRET is not configured. Please set it in your .env file.');
  }
  return secret;
};

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      contractsUsedThisMonth: 0,
      lastResetDate: new Date(),
      emailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await user.save();

    // Generate token
    const jwtSecret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { userId: String(user._id) };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    // Send verification email (don't fail registration if email fails)
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (emailError) {
      console.error('Verification email error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const jwtSecret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { userId: String(user._id) };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        contractsUsedThisMonth: user.contractsUsedThisMonth,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      contractsUsedThisMonth: user.contractsUsedThisMonth,
      role: user.role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update profile
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user!._id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update name if provided
    if (validatedData.name !== undefined) {
      user.name = validatedData.name;
    }

    // Update email if provided
    const oldEmail = user.email;
    if (validatedData.email !== undefined && validatedData.email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser && existingUser._id && user._id && existingUser._id.toString() !== user._id.toString()) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
      user.email = validatedData.email;
    }

    // Update password if provided
    const passwordChanged = validatedData.password && validatedData.currentPassword;
    if (passwordChanged && validatedData.password && validatedData.currentPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Send email notifications (don't fail the request if emails fail)
    try {
      if (passwordChanged) {
        await sendPasswordChangedEmail(user.email, user.name);
      }
      if (validatedData.email !== undefined && validatedData.email !== oldEmail) {
        await sendEmailChangedEmail(oldEmail, user.email, user.name);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      contractsUsedThisMonth: user.contractsUsedThisMonth,
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error });
      return;
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify Email
router.post('/verify-email/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    // Mark email as verified and clear token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email after verification
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend Verification Email
router.post('/resend-verification', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Update token and expiry
    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (emailError) {
      console.error('Verification email error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Delete Account
router.delete('/account', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify password if provided
    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    }

    // Delete user's contracts (if Contract model exists and has user reference)
    // Note: This assumes contracts are stored with a userId field
    // You may need to adjust this based on your Contract model structure
    try {
      const { Contract } = await import('../models/Contract.js');
      await Contract.deleteMany({ userId: userId });
    } catch (contractError) {
      console.error('Error deleting contracts:', contractError);
      // Continue with account deletion even if contract deletion fails
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Send account deletion confirmation email
    try {
      const { sendAccountDeletionEmail } = await import('../services/email.service.js');
      await sendAccountDeletionEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Account deletion email error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get notification settings (Business+ plans)
router.get('/notifications', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user has access to custom notifications
    const { hasFeature } = await import('../utils/planLimits.js');
    if (!hasFeature(user.subscriptionPlan, 'hasCustomNotifications')) {
      res.status(403).json({
        error: 'Custom notification settings are not available for your plan',
        plan: user.subscriptionPlan,
      });
      return;
    }

    res.json({
      notificationSettings: user.notificationSettings || {
        emailOnAnalysisComplete: true,
        emailOnRiskDetected: true,
        emailOnMonthlyReport: false,
        emailOnLimitReached: true,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings (Business+ plans)
router.patch('/notifications', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user has access to custom notifications
    const { hasFeature } = await import('../utils/planLimits.js');
    if (!hasFeature(user.subscriptionPlan, 'hasCustomNotifications')) {
      res.status(403).json({
        error: 'Custom notification settings are not available for your plan',
        plan: user.subscriptionPlan,
      });
      return;
    }

    const { emailOnAnalysisComplete, emailOnRiskDetected, emailOnMonthlyReport, emailOnLimitReached } = req.body;

    if (user.notificationSettings) {
      if (typeof emailOnAnalysisComplete === 'boolean') {
        user.notificationSettings.emailOnAnalysisComplete = emailOnAnalysisComplete;
      }
      if (typeof emailOnRiskDetected === 'boolean') {
        user.notificationSettings.emailOnRiskDetected = emailOnRiskDetected;
      }
      if (typeof emailOnMonthlyReport === 'boolean') {
        user.notificationSettings.emailOnMonthlyReport = emailOnMonthlyReport;
      }
      if (typeof emailOnLimitReached === 'boolean') {
        user.notificationSettings.emailOnLimitReached = emailOnLimitReached;
      }
    } else {
      user.notificationSettings = {
        emailOnAnalysisComplete: typeof emailOnAnalysisComplete === 'boolean' ? emailOnAnalysisComplete : true,
        emailOnRiskDetected: typeof emailOnRiskDetected === 'boolean' ? emailOnRiskDetected : true,
        emailOnMonthlyReport: typeof emailOnMonthlyReport === 'boolean' ? emailOnMonthlyReport : false,
        emailOnLimitReached: typeof emailOnLimitReached === 'boolean' ? emailOnLimitReached : true,
      };
    }

    await user.save();

    res.json({
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

export default router;

