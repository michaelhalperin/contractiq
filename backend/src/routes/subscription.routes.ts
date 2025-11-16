import express, { Response } from 'express';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { createCheckout, verifyWebhook, getSubscription } from '../services/paddle.service.js';
import { sendSubscriptionEmail } from '../services/email.service.js';
import type { SubscriptionPlan } from '../../../shared/types.js';

const router = express.Router();

// Create checkout session
router.post(
  '/create-checkout',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { plan } = req.body as { plan: SubscriptionPlan };

      if (!plan || !['pro', 'business', 'enterprise'].includes(plan)) {
        res.status(400).json({ error: 'Invalid plan' });
        return;
      }

      const user = req.user!;
      const customerId = user.paddleCustomerId || `customer-${user._id}`;

      // Create or update customer ID
      if (!user.paddleCustomerId) {
        user.paddleCustomerId = customerId;
        await user.save();
      }

      const checkoutUrl = await createCheckout(customerId, plan, user.email);

      res.json({ checkoutUrl });
    } catch (error) {
      console.error('Create checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout' });
    }
  }
);

// Get subscription status
router.get('/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const subscription = await Subscription.findOne({ userId: user._id });

    res.json({
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      contractsUsed: user.contractsUsedThisMonth,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Paddle webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['paddle-signature'] as string;
    // Body should be a Buffer from express.raw middleware
    const body = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    const bodyString = body.toString('utf8');

    // Verify webhook signature
    if (!verifyWebhook(signature, body)) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const event = JSON.parse(bodyString);

    console.log('Received Paddle webhook event:', event.event_type);

    // Helper function to determine plan from price ID
    const getPlanFromPriceId = (priceId: string): SubscriptionPlan => {
      const priceIds = {
        pro: process.env.PADDLE_PRICE_ID_PRO || process.env.PADDLE_SANDBOX_PRICE_ID_PRO || '',
        business: process.env.PADDLE_PRICE_ID_BUSINESS || process.env.PADDLE_SANDBOX_PRICE_ID_BUSINESS || '',
        enterprise: process.env.PADDLE_PRICE_ID_ENTERPRISE || process.env.PADDLE_SANDBOX_PRICE_ID_ENTERPRISE || '',
      };

      if (priceId === priceIds.pro) return 'pro';
      if (priceId === priceIds.business) return 'business';
      if (priceId === priceIds.enterprise) return 'enterprise';
      return 'pro'; // default
    };

    // Handle different Paddle events
    switch (event.event_type) {
      case 'transaction.completed': {
        // When a transaction is completed, we might get customer info
        const transaction = event.data;
        const customerId = transaction.customer_id;
        const customerEmail = transaction.customer?.email;

        if (customerId || customerEmail) {
          // Try to find user by customer ID or email
          let user = customerId ? await User.findOne({ paddleCustomerId: customerId }) : null;
          if (!user && customerEmail) {
            user = await User.findOne({ email: customerEmail.toLowerCase() });
            if (user && customerId) {
              // Update user with customer ID if not set
              user.paddleCustomerId = customerId;
              await user.save();
            }
          }

          if (user) {
            // Check if this transaction created a subscription
            const subscriptionId = transaction.subscription_id;
            if (subscriptionId) {
              // Subscription will be handled by subscription.created event
              console.log('Transaction completed for subscription:', subscriptionId);
            }
          }
        }
        break;
      }

      case 'subscription.created':
      case 'subscription.updated': {
        const subscriptionData = event.data;
        const subscriptionId = subscriptionData.id;
        const customerId = subscriptionData.customer_id;
        const customerEmail = subscriptionData.customer?.email;

        // Get plan from the first item's price ID
        const priceId = subscriptionData.items?.[0]?.price_id;
        const plan = priceId ? getPlanFromPriceId(priceId) : 'pro';

        // Find user by customer ID or email
        let user = customerId ? await User.findOne({ paddleCustomerId: customerId }) : null;
        if (!user && customerEmail) {
          user = await User.findOne({ email: customerEmail.toLowerCase() });
          if (user && customerId) {
            user.paddleCustomerId = customerId;
            await user.save();
          }
        }

        if (!user) {
          console.error('User not found for customer:', customerId || customerEmail);
          // Don't return error - just log it, as webhook might arrive before user completes checkout
          res.json({ received: true, message: 'User not found, will retry later' });
          return;
        }

        // Update or create subscription
        let subscription = await Subscription.findOne({ userId: user._id });
        const status = subscriptionData.status;
        const billingPeriod = subscriptionData.current_billing_period;
        const scheduledChange = subscriptionData.scheduled_change;

        if (!subscription) {
          subscription = new Subscription({
            userId: user._id,
            plan: plan as SubscriptionPlan,
            status: status === 'active' ? 'active' : status === 'trialing' ? 'trialing' : 'active',
            paddleSubscriptionId: subscriptionId,
            paddleCustomerId: customerId,
            currentPeriodStart: billingPeriod?.starts_at ? new Date(billingPeriod.starts_at) : new Date(),
            currentPeriodEnd: billingPeriod?.ends_at ? new Date(billingPeriod.ends_at) : new Date(),
            cancelAtPeriodEnd: scheduledChange?.action === 'cancel',
          });
        } else {
          subscription.plan = plan as SubscriptionPlan;
          subscription.status = status === 'active' ? 'active' : status === 'trialing' ? 'trialing' : 'active';
          subscription.paddleSubscriptionId = subscriptionId;
          subscription.paddleCustomerId = customerId;
          if (billingPeriod?.starts_at) {
            subscription.currentPeriodStart = new Date(billingPeriod.starts_at);
          }
          if (billingPeriod?.ends_at) {
            subscription.currentPeriodEnd = new Date(billingPeriod.ends_at);
          }
          subscription.cancelAtPeriodEnd = scheduledChange?.action === 'cancel';
        }

        await subscription.save();

        // Update user
        user.subscriptionPlan = plan as SubscriptionPlan;
        user.subscriptionStatus = status === 'active' ? 'active' : status === 'trialing' ? 'trialing' : 'active';
        user.paddleSubscriptionId = subscriptionId;
        if (customerId) {
          user.paddleCustomerId = customerId;
        }
        await user.save();

        // Send email notification
        try {
          await sendSubscriptionEmail(user.email, plan, user.subscriptionStatus);
        } catch (emailError) {
          console.error('Email notification error:', emailError);
        }

        break;
      }

      case 'subscription.canceled': {
        const subscriptionData = event.data;
        const subscriptionId = subscriptionData.id;
        const subscription = await Subscription.findOne({ paddleSubscriptionId: subscriptionId });
        
        if (subscription) {
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date();
          subscription.cancelAtPeriodEnd = false;
          await subscription.save();

          const user = await User.findById(subscription.userId);
          if (user) {
            user.subscriptionStatus = 'cancelled';
            await user.save();
          }
        }
        break;
      }

      default:
        console.log('Unhandled webhook event type:', event.event_type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

