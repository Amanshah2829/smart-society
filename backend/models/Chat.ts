
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IMessage extends Document {
    _id: string;
    senderId: mongoose.Schema.Types.ObjectId;
    content: string; // Used for text content or file name
    type: 'text' | 'image' | 'video' | 'file' | 'link';
    mediaUrl?: string; // URL for image, video, or file
    fileSize?: number; // Size in bytes
    timestamp: Date;
    readBy: mongoose.Schema.Types.ObjectId[];
}

const MessageSchema = new Schema<IMessage>({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'video', 'file', 'link'], default: 'text' },
    mediaUrl: { type: String },
    fileSize: { type: Number },
    timestamp: { type: Date, default: Date.now },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export interface IChat extends Document {
    name?: string;
    isGroup: boolean;
    members: mongoose.Schema.Types.ObjectId[];
    messages: IMessage[];
    lastMessageAt: Date;
    siteId?: string;
}

const ChatSchema = new Schema<IChat>({
    name: { type: String },
    isGroup: { type: Boolean, default: false },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    siteId: { type: String },
}, { timestamps: true });

export const ChatModel = (models.Chat || mongoose.model<IChat>('Chat', ChatSchema)) as Model<IChat>;
