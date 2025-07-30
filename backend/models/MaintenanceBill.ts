
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IMaintenanceBill extends Document {
  flatNumber: string;
  residentId: string;
  amount: number;
  month: string;
  year: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'pending_confirmation';
  paymentDate?: Date;
  paymentId?: string;
  paymentMethod?: 'card' | 'upi' | 'cash';
  createdAt: Date;
  siteId?: string;
}

const MaintenanceBillSchema = new Schema<IMaintenanceBill>({
  flatNumber: { type: String, required: true },
  residentId: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'pending_confirmation'], default: 'pending' },
  paymentDate: { type: Date },
  paymentId: { type: String },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cash'] },
  siteId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const MaintenanceBillModel = (models.MaintenanceBill || mongoose.model<IMaintenanceBill>('MaintenanceBill', MaintenanceBillSchema)) as Model<IMaintenanceBill>;

    