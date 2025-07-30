
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { TalentProfile as TalentProfileType } from '@/lib/community-types';

const ReviewSchema = new Schema({
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const TalentProfileSchema = new Schema<TalentProfileType>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, required: true },
    bio: { type: String, required: true },
    skills: [String],
    portfolio: [String],
    rating: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    rate: { type: String }
});

export const TalentProfileModel = (models.TalentProfile || mongoose.model<TalentProfileType>('TalentProfile', TalentProfileSchema)) as Model<TalentProfileType>;
