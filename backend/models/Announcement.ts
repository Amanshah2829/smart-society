
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Announcement as AnnouncementType } from '@/backend/lib/types';

const AnnouncementSchema = new Schema<AnnouncementType>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'maintenance', 'event', 'emergency'], required: true },
  targetRoles: [{ type: String }],
  authorId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  siteId: { type: String },
});

export const AnnouncementModel = (models.Announcement || mongoose.model('Announcement', AnnouncementSchema)) as Model<AnnouncementType>;
