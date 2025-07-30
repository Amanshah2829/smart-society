
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Complaint as ComplaintType } from '@/backend/lib/types';

const ComplaintSchema = new Schema<ComplaintType>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['plumbing', 'electrical', 'cleaning', 'security', 'maintenance', 'other'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  residentId: { type: String, required: true },
  flatNumber: { type: String, required: true },
  assignedTo: { type: String },
  images: [{ type: String }],
  siteId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ComplaintModel = (models.Complaint || mongoose.model('Complaint', ComplaintSchema)) as Model<ComplaintType>;
