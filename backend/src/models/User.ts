import mongoose, { Schema, Document } from 'mongoose';
import type { SubscriptionPlan, Language } from '../../../shared/types.js';

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
  language?: Language;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  notificationSettings?: {
    emailOnAnalysisComplete: boolean;
    emailOnRiskDetected: boolean;
    emailOnMonthlyReport: boolean;
    emailOnLimitReached: boolean;
  };
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
    language: {
      type: String,
      enum: ['en', 'he'],
      default: 'en',
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    notificationSettings: {
      emailOnAnalysisComplete: {
        type: Boolean,
        default: true,
      },
      emailOnRiskDetected: {
        type: Boolean,
        default: true,
      },
      emailOnMonthlyReport: {
        type: Boolean,
        default: false,
      },
      emailOnLimitReached: {
        type: Boolean,
        default: true,
      },
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
