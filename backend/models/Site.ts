
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ISite extends Document {
    name: string;
    address: string;
    totalBlocks: number;
    floorsPerBlock: number;
    unitsPerFloor: number;
    adminName: string;
    adminEmail: string;
    subscription: {
        tier: 'trial' | 'active' | 'expired';
        startDate: Date;
        endDate: Date;
        fee: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SiteSchema = new Schema<ISite>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    totalBlocks: { type: Number, required: true },
    floorsPerBlock: { type: Number, required: true },
    unitsPerFloor: { type: Number, required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, unique: true },
    subscription: {
        tier: { type: String, enum: ['trial', 'active', 'expired'], required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        fee: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const SiteModel = (models.Site || mongoose.model<ISite>('Site', SiteSchema)) as Model<ISite>;
