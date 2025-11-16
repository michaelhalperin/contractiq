import mongoose, { Schema, Document } from 'mongoose';
import type { SubscriptionPlan } from '../../../shared/types.js';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      required: true,
    },
    paddleSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    paddleCustomerId: {
      type: String,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

