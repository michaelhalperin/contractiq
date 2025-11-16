import mongoose, { Schema, Document } from 'mongoose';
import type { ContractAnalysis } from '../../../shared/types.js';

export interface IContract extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileUrl: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  analysis?: ContractAnalysis;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'uploading',
    },
    analysis: {
      type: Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ContractSchema.index({ userId: 1, createdAt: -1 });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
