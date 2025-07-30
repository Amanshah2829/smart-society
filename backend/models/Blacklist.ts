
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IBlacklist extends Document {
    name: string;
    phone: string;
    reason: string;
    blacklistedBy: mongoose.Schema.Types.ObjectId; // User ID of admin who blacklisted
    siteId: string;
}

const BlacklistSchema = new Schema<IBlacklist>({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    blacklistedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    siteId: { type: String, required: true },
}, { timestamps: true });

export const BlacklistModel = (models.Blacklist || mongoose.model<IBlacklist>('Blacklist', BlacklistSchema)) as Model<IBlacklist>;
