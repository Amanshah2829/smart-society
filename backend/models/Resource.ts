
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Resource as ResourceType } from '@/lib/community-types';

const ResourceSchema = new Schema<ResourceType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['item', 'service', 'skill', 'information'], required: true },
    availability: { type: String, enum: ['available', 'in-use', 'unavailable'], default: 'available' },
    condition: { type: String, enum: ['new', 'used', 'fair'] },
    cost: { type: String, enum: ['free', 'barter', 'paid'], default: 'free' },
    price: { type: Number }
});

export const ResourceModel = (models.Resource || mongoose.model<ResourceType>('Resource', ResourceSchema)) as Model<ResourceType>;
