import { Resend } from 'resend';

// Lazy initialization of Resend client
let resend: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY environment variable is not set - emails will not be sent');
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
};

// Get the from email address - use Resend's testing domain if no custom domain is set
const getFromEmail = (): string => {
  const customDomain = process.env.RESEND_FROM_EMAIL;
  if (customDomain) {
    return customDomain;
  }
  // Use Resend's default testing domain for development
  return 'onboarding@resend.dev';
};

export const sendAnalysisCompleteEmail = async (
  email: string,
  contractId: string,
  fileName: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const contractUrl = `${frontendUrl}/contracts/${contractId}`;
    const fromEmail = getFromEmail();

    console.log(`Sending analysis complete email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: `Your contract analysis is ready: ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Your contract analysis is ready!</h2>
                <p>We've completed analyzing your contract: <strong>${fileName}</strong></p>
                <p>View your analysis results, risk flags, and clause explanations in your dashboard.</p>
                <a href="${contractUrl}" class="button">View Analysis</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ. If you didn't request this analysis, please ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Analysis complete email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendSubscriptionEmail = async (
  email: string,
  plan: string,
  status: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const dashboardUrl = `${frontendUrl}/dashboard`;
    const fromEmail = getFromEmail();

    console.log(`Sending subscription email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: `Subscription ${status}: ${plan} plan`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Subscription Update</h2>
                <p>Your subscription has been <strong>${status}</strong>.</p>
                <p>Plan: <strong>${plan}</strong></p>
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Subscription email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name?: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const dashboardUrl = `${frontendUrl}/dashboard`;
    const fromEmail = getFromEmail();

    console.log(`Sending welcome email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'Welcome to ContractIQ! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 32px; }
              .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
              .features { margin: 30px 0; }
              .feature { margin: 15px 0; padding-left: 25px; position: relative; }
              .feature:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ContractIQ! 🎉</h1>
              </div>
              <div class="content">
                <h2>Hi${name ? ` ${name}` : ''}!</h2>
                <p>Thank you for signing up for ContractIQ. We're excited to help you understand your contracts better with AI-powered analysis.</p>
                
                <div class="features">
                  <h3>Get started with:</h3>
                  <div class="feature">Upload contracts and get instant AI analysis</div>
                  <div class="feature">Identify risk flags and red flags automatically</div>
                  <div class="feature">Understand complex legal clauses in plain English</div>
                  <div class="feature">Share analysis reports with your team</div>
                </div>
                
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  If you have any questions, feel free to reach out to our support team.
                </p>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Welcome email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async (
  email: string,
  name?: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const dashboardUrl = `${frontendUrl}/dashboard`;
    const fromEmail = getFromEmail();

    console.log(`Sending password changed email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'Your password has been changed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Password Changed</h2>
                <p>Hi${name ? ` ${name}` : ''},</p>
                <p>Your password has been successfully changed.</p>
                
                <div class="warning">
                  <strong>Security Notice:</strong> If you didn't make this change, please contact us immediately and secure your account.
                </div>
                
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ for security purposes.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Password changed email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  name?: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    const fromEmail = getFromEmail();

    console.log(`Sending verification email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'Verify Your ContractIQ Email Address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello${name ? ` ${name}` : ''},</p>
                <p>Thank you for signing up for ContractIQ! Please verify your email address to complete your registration.</p>
                <p>Click the button below to verify your email. This link will expire in 24 hours.</p>
                <a href="${verificationUrl}" class="button">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ. If you didn't create an account, please ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Verification email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name?: string
): Promise<void> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const fromEmail = getFromEmail();

    console.log(`Sending password reset email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'Reset Your ContractIQ Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello${name ? ` ${name}` : ''},</p>
                <p>We received a request to reset your password for your ContractIQ account.</p>
                <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
                <div class="warning">
                  <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ. This link expires in 1 hour.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Password reset email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendEmailChangedEmail = async (
  oldEmail: string,
  newEmail: string,
  name?: string
): Promise<void> => {
  try {
    const fromEmail = getFromEmail();

    console.log(`Sending email changed notification to ${oldEmail} and ${newEmail} from ${fromEmail}`);

    // Send to old email
    const oldEmailResult = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: oldEmail,
      subject: 'Your email address has been changed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Email Address Changed</h2>
                <p>Hi${name ? ` ${name}` : ''},</p>
                <p>Your email address has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
                
                <div class="warning">
                  <strong>Security Notice:</strong> If you didn't make this change, please contact us immediately.
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ for security purposes.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send to new email
    const newEmailResult = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: newEmail,
      subject: 'Welcome to your new email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Email Address Updated</h2>
                <p>Hi${name ? ` ${name}` : ''},</p>
                <p>Your email address has been successfully updated to <strong>${newEmail}</strong>.</p>
                <p>You'll now receive all ContractIQ notifications at this address.</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (oldEmailResult.error) {
      console.error('Resend API error (old email):', oldEmailResult.error);
    }
    if (newEmailResult.error) {
      console.error('Resend API error (new email):', newEmailResult.error);
      throw new Error(`Failed to send email: ${JSON.stringify(newEmailResult.error)}`);
    }

    console.log('Email changed notifications sent successfully');
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendAccountDeletionEmail = async (
  email: string,
  name?: string
): Promise<void> => {
  try {
    const fromEmail = getFromEmail();

    console.log(`Sending account deletion email to ${email} from ${fromEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'Your ContractIQ Account Has Been Deleted',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Account Deletion Confirmation</h2>
                <p>Hello${name ? ` ${name}` : ''},</p>
                <p>This email confirms that your ContractIQ account has been successfully deleted.</p>
                <p>All your data, including contracts and analysis results, have been permanently removed from our systems.</p>
                <p>If you didn't request this deletion, please contact us immediately at support@contractiq.com.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This email was sent by ContractIQ. This is an automated confirmation email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Account deletion email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendContactFormEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  try {
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromEmail = getFromEmail();

    console.log(`Sending contact form email from ${email} to ${supportEmail}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ Contact Form <${fromEmail}>`,
      to: supportEmail,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin: 15px 0; }
              .label { font-weight: bold; color: #6366f1; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #6366f1; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Contact form email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendContactConfirmationEmail = async (
  name: string,
  email: string
): Promise<void> => {
  try {
    const fromEmail = getFromEmail();

    console.log(`Sending contact confirmation email to ${email}`);

    const result = await getResendClient().emails.send({
      from: `ContractIQ <${fromEmail}>`,
      to: email,
      subject: 'We received your message',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ContractIQ</h1>
              </div>
              <div class="content">
                <h2>Thank you for contacting us!</h2>
                <p>Hi${name ? ` ${name}` : ''},</p>
                <p>We've received your message and our team will get back to you as soon as possible, typically within 24-48 hours.</p>
                <p>If your inquiry is urgent, please feel free to reach out directly at support@contractiq.com.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This is an automated confirmation email from ContractIQ.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
    }

    console.log('Contact confirmation email sent successfully:', result.data);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

