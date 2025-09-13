import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro'
}

export interface ITenant extends Document {
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  maxNotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  plan: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    default: SubscriptionPlan.FREE
  },
  maxNotes: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

export default mongoose.model<ITenant>('Tenant', tenantSchema);