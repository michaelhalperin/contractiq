import mongoose, { Schema, Document } from 'mongoose';
import type { SubscriptionPlan } from '../../../shared/types.js';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'business', 'enterprise'],
      default: 'free',
    },
    members: [WorkspaceMemberSchema],
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

