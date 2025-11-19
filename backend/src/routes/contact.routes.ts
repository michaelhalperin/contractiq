import express, { Request, Response } from 'express';
import { z } from 'zod';
import { sendContactFormEmail, sendContactConfirmationEmail } from '../services/email.service.js';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Contact Form Submission
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const { name, email, subject, message } = validatedData;

    // Send email to support/admin
    try {
      await sendContactFormEmail(name, email, subject, message);
    } catch (emailError) {
      console.error('Contact form email error:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendContactConfirmationEmail(name, email);
    } catch (emailError) {
      console.error('Contact confirmation email error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Thank you for contacting us! We\'ll get back to you soon.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

export default router;

