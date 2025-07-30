
import mongoose, { Schema, Document, models, Model } from 'mongoose';

const CommentSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export interface ICommunityPost extends Document {
  content: string;
  authorId: mongoose.Schema.Types.ObjectId;
  category: 'discussion' | 'event' | 'poll' | 'announcement';
  mediaUrl?: string;
  likes: mongoose.Schema.Types.ObjectId[];
  comments: Array<{
    _id: mongoose.Schema.Types.ObjectId;
    authorId: mongoose.Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  hashtags?: string[];
  createdAt: Date;
  siteId?: string;
  
  // Event specific
  eventType?: 'workshop' | 'meetup' | 'volunteer' | 'celebration';
  eventDate?: Date;
  eventTime?: string;
  eventLocation?: string;
  rsvps?: mongoose.Schema.Types.ObjectId[];

  // Poll specific
  pollOptions?: {
    text: string;
    voters: mongoose.Schema.Types.ObjectId[];
  }[];
}

const CommunityPostSchema = new Schema<ICommunityPost>({
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['discussion', 'event', 'poll', 'announcement'], default: 'discussion' },
  mediaUrl: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  hashtags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  siteId: { type: String },

  // Event specific
  eventType: { type: String, enum: ['workshop', 'meetup', 'volunteer', 'celebration'] },
  eventDate: { type: Date },
  eventTime: { type: String },
  eventLocation: { type: String },
  rsvps: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Poll specific
  pollOptions: [{
    text: String,
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }],
});

export const CommunityPostModel = (models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema)) as Model<ICommunityPost>;
