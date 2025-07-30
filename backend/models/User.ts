
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface User extends Document {
  email: string;
  password: { type: String, required: true };
  name: string;
  role: "admin" | "resident" | "security" | "receptionist" | "accountant" | "superadmin";
  flatNumber?: string;
  phone: string;
  residencyType?: "owner" | "tenant";
  dateOfBirth?: Date;
  siteId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident', 'security', 'receptionist', 'accountant', 'superadmin'], required: true },
  flatNumber: { type: String },
  phone: { type: String },
  residencyType: { type: String, enum: ['owner', 'tenant'] },
  dateOfBirth: { type: Date },
  siteId: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = (models.User || mongoose.model('User', UserSchema)) as Model<User>;
