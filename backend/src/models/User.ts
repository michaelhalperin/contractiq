import mongoose, { Schema, Document } from 'mongoose';
import type { SubscriptionPlan } from '../../../shared/types.js';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing';
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  contractsUsedThisMonth: number;
  lastResetDate: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      default: 'active',
    },
    paddleCustomerId: {
      type: String,
    },
    paddleSubscriptionId: {
      type: String,
    },
    contractsUsedThisMonth: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Reset contract count monthly
UserSchema.methods.resetMonthlyCount = function () {
  const now = new Date();
  const lastReset = this.lastResetDate || this.createdAt;
  const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceReset >= 30) {
    this.contractsUsedThisMonth = 0;
    this.lastResetDate = now;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema);
