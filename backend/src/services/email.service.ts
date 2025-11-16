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

