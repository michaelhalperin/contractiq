import crypto from 'crypto';
import type { SubscriptionPlan } from '../../../shared/types.js';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY || '';
const PADDLE_ENVIRONMENT = (process.env.PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
const PADDLE_BASE_URL = PADDLE_ENVIRONMENT === 'production' 
  ? 'https://api.paddle.com' 
  : 'https://sandbox-api.paddle.com';

export interface PaddlePrice {
  productId: string;
  priceId: string;
  amount: string;
  currency: string;
}

// Map subscription plans to Paddle price IDs
// These should be configured in your Paddle dashboard
export const PLAN_PRICE_IDS: Record<SubscriptionPlan, string> = {
  free: '', // Free plan doesn't use Paddle
  pro: PADDLE_ENVIRONMENT === 'sandbox' 
    ? (process.env.PADDLE_SANDBOX_PRICE_ID_PRO || process.env.PADDLE_PRICE_ID_PRO || '')
    : (process.env.PADDLE_PRICE_ID_PRO || ''),
  business: PADDLE_ENVIRONMENT === 'sandbox'
    ? (process.env.PADDLE_SANDBOX_PRICE_ID_BUSINESS || process.env.PADDLE_PRICE_ID_BUSINESS || '')
    : (process.env.PADDLE_PRICE_ID_BUSINESS || ''),
  enterprise: PADDLE_ENVIRONMENT === 'sandbox'
    ? (process.env.PADDLE_SANDBOX_PRICE_ID_ENTERPRISE || process.env.PADDLE_PRICE_ID_ENTERPRISE || '')
    : (process.env.PADDLE_PRICE_ID_ENTERPRISE || ''),
};

export const createCheckout = async (
  customerId: string,
  plan: SubscriptionPlan,
  email: string
): Promise<string> => {
  try {
    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      throw new Error(`No price ID configured for plan: ${plan}`);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/subscription/webhook`;

    // Use Paddle API directly via HTTP
    const response = await fetch(`${PADDLE_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer_id: customerId,
        custom_data: {
          plan,
          email,
        },
        return_url: `${frontendUrl}/dashboard?checkout=success`,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(error.message || 'Failed to create checkout');
    }

    const transaction = await response.json() as { data?: { checkout?: { url?: string } } };
    return transaction.data?.checkout?.url || '';
  } catch (error) {
    console.error('Paddle checkout error:', error instanceof Error ? error.message : error);
    throw new Error('Failed to create checkout');
  }
};

export const verifyWebhook = (signature: string, body: string | Buffer): boolean => {
  try {
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      console.warn('PADDLE_WEBHOOK_SECRET not configured, skipping verification');
      return true; // Allow in development if secret not set
    }

    if (!signature) {
      return false;
    }

    // Paddle Billing uses HMAC SHA256 for webhook verification
    // The signature format is: ts=timestamp;h1=hash
    const parts = signature.split(';');
    const signatureParts: Record<string, string> = {};
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key] = value;
      }
    });

    const timestamp = signatureParts.ts;
    const receivedHash = signatureParts.h1;

    if (!timestamp || !receivedHash) {
      return false;
    }

    // Create the signed payload: timestamp + body
    const bodyString = typeof body === 'string' ? body : body.toString();
    const signedPayload = timestamp + ':' + bodyString;

    // Calculate the expected hash
    const expectedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Compare hashes using constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
};

export const getSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch(`${PADDLE_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get subscription');
    }

    const data = await response.json() as { data?: unknown };
    return data.data;
  } catch (error) {
    console.error('Get subscription error:', error instanceof Error ? error.message : error);
    throw error;
  }
};

