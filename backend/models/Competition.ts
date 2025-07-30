
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Competition as CompetitionType } from '@/lib/community-types';

const PrizeSchema = new Schema({
    position: { type: Number, required: true },
    reward: { type: String, required: true },
    value: { type: Number }
});

const SubmissionSchema = new Schema({
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const CompetitionSchema = new Schema<CompetitionType>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['hackathon', 'ideathon', 'design', 'quiz'], required: true },
    category: { type: String, enum: ['tech', 'social', 'arts', 'sports'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rules: [String],
    prizes: [PrizeSchema],
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
    votingEnabled: { type: Boolean, default: false },
    submissions: [SubmissionSchema]
});

export const CompetitionModel = (models.Competition || mongoose.model<CompetitionType>('Competition', CompetitionSchema)) as Model<CompetitionType>;
