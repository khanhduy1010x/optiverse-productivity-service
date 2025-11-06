import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type LeaderboardCacheDocument = LeaderboardCache & Document;

@Schema({ timestamps: true })
export class LeaderboardCache {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['weekly', 'monthly'] })
  timePeriod: string;

  @Prop({ required: true, type: String, enum: ['total_products', 'total_spending'] })
  metric: string;

  @Prop({ required: true, type: Array })
  data: any[];

  @Prop({ type: Date, default: Date.now })
  cachedAt: Date;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LeaderboardCacheSchema = SchemaFactory.createForClass(LeaderboardCache);

// Create index for better query performance
LeaderboardCacheSchema.index({ timePeriod: 1, metric: 1 });
LeaderboardCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
