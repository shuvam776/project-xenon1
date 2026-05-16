import mongoose, { Schema, Document, Model } from 'mongoose';
import { RAW_KYC_STATUSES, RawKycStatus } from '@/lib/kycStatus';

export type UserRole = 'buyer' | 'vendor' | 'admin';
export type KYCStatus = RawKycStatus;
export type AuthProvider = 'local' | 'google';

export interface IKYCDetails {
  companyName?: string;
  gstin?: string;
  pan?: string;
  aadhaar?: string;
  address?: string;
  documents: string[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  authProvider: AuthProvider;
  emailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: KYCStatus;
  kycDetails?: IKYCDetails;
  image?: string;
  googleId?: string;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  totalTimeOnSite: number;
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema = new Schema<IKYCDetails>({
  companyName: { type: String },
  gstin: { type: String },
  pan: { type: String },
  aadhaar: { type: String },
  address: { type: String },
  documents: [{ type: String }],
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  googleId: { type: String },
  phone: { type: String },
  role: {
    type: String,
    enum: ['buyer', 'vendor', 'admin'],
    default: 'buyer',
    required: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
    required: true
  },
  emailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  kycStatus: {
    type: String,
    enum: RAW_KYC_STATUSES,
    default: 'not_submitted'
  },
  kycDetails: { type: KYCSchema },
  image: { type: String },
  totalTimeOnSite: { type: Number, default: 0 },
  refreshToken: { type: String, select: false },
  refreshTokenExpiry: { type: Date, select: false },
}, { timestamps: true });

// Check if model exists before compiling to avoid OverwriteModelError
// In development, we might want to ensure the latest schema is used
if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
