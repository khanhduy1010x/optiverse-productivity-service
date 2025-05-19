import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FlashcardDocument = Flashcard & Document;

@Schema({ timestamps: true })
export class Flashcard {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'FlashcardDeck' })
  deck_id: Types.ObjectId;

  @Prop({ required: true })
  front: string;

  @Prop({ required: true })
  back: string;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

FlashcardSchema.virtual('reviewSession', {
  ref: 'ReviewSession',
  localField: '_id',
  foreignField: 'flashcard_id',
  justOne: true,
});

FlashcardSchema.set('toObject', { virtuals: true });
FlashcardSchema.set('toJSON', { virtuals: true });
