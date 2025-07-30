
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface Visitor extends Document {
  name: string;
  phone: string;
  purpose: string;
  flatNumber: string;
  checkInTime: Date;
  checkOutTime?: Date;
  photo?: string;
  vehicleNumber?: string;
  securityId: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out' | 'pre-approved';
  approvedBy?: string; // residentId who approved/rejected
  notes?: string;
  siteId?: string;
}

const VisitorSchema = new Schema<Visitor>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: { type: String, required: true },
  flatNumber: { type: String, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
  photo: { type: String },
  vehicleNumber: { type: String },
  securityId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out', 'pre-approved'], required: true },
  approvedBy: { type: String },
  notes: { type: String },
  siteId: { type: String },
});

export const VisitorModel = (models.Visitor || mongoose.model('Visitor', VisitorSchema)) as Model<Visitor>;
