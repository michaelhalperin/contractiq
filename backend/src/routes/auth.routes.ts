import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../utils/validation.js';
import { sendWelcomeEmail, sendPasswordChangedEmail, sendEmailChangedEmail } from '../services/email.service.js';

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

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      contractsUsedThisMonth: 0,
      lastResetDate: new Date(),
    });

    await user.save();

    // Generate token
    const jwtSecret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { userId: String(user._id) };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    // Send welcome email (don't fail registration if email fails)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
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

export default router;

