
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Project as ProjectType } from '@/lib/community-types';

const TaskSchema = new Schema({
    title: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Date }
});

const ProjectUpdateSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new Schema<ProjectType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    lead: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    category: { type: String, enum: ['environment', 'education', 'health', 'social', 'infrastructure'], required: true },
    status: { type: String, enum: ['planning', 'active', 'completed', 'on-hold'], default: 'planning' },
    progress: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    tasks: [TaskSchema],
    updates: [ProjectUpdateSchema]
});

export const ProjectModel = (models.Project || mongoose.model<ProjectType>('Project', ProjectSchema)) as Model<ProjectType>;
