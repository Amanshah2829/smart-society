
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ILedgerEntry extends Document {
  date: Date;
  description: string;
  category: string;
  type: "credit" | "debit";
  amount: number;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
});

export const LedgerEntryModel = (models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema)) as Model<ILedgerEntry>;
