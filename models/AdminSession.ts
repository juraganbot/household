import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminSession extends Document {
  token: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

const AdminSessionSchema = new Schema<IAdminSession>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      default: 'admin',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'admin_sessions',
  }
);

AdminSessionSchema.index({ token: 1, isActive: 1 });
AdminSessionSchema.index({ expiresAt: 1 });

const AdminSession: Model<IAdminSession> =
  mongoose.models.AdminSession || mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);

export default AdminSession;
