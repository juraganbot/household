import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProtectedEmail extends Document {
  email: string;
  accessKey: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  accessCount: number;
}

const ProtectedEmailSchema = new Schema<IProtectedEmail>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    accessKey: {
      type: String,
      required: true,
      trim: true,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    lastAccessedAt: {
      type: Date,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'protected_emails',
  }
);

ProtectedEmailSchema.index({ email: 1 });
ProtectedEmailSchema.index({ isLocked: 1 });
ProtectedEmailSchema.index({ createdAt: -1 });

const ProtectedEmail: Model<IProtectedEmail> =
  mongoose.models.ProtectedEmail || mongoose.model<IProtectedEmail>('ProtectedEmail', ProtectedEmailSchema);

export default ProtectedEmail;
