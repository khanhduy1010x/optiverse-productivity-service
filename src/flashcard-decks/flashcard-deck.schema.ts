import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FlashcardDeckDocument = FlashcardDeck & Document;

@Schema({ timestamps: true })
export class FlashcardDeck {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;
}

export const FlashcardDeckSchema = SchemaFactory.createForClass(FlashcardDeck);
