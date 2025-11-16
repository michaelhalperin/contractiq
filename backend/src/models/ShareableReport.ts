import mongoose, { Schema, Document } from 'mongoose';

export interface IShareableReport extends Document {
  contractId: mongoose.Types.ObjectId;
  token: string;
  password?: string; // hashed
  expiresAt?: Date;
  createdAt: Date;
}

const ShareableReportSchema = new Schema<IShareableReport>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Token already has unique index from the schema definition above

export const ShareableReport = mongoose.model<IShareableReport>('ShareableReport', ShareableReportSchema);

