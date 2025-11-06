import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type FlashcardDeckDocument = FlashcardDeck & Document;

@Schema({ timestamps: true })
export class FlashcardDeck {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace' })
  workspace_id?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId })
  ref_id?: Types.ObjectId;
}

export const FlashcardDeckSchema = SchemaFactory.createForClass(FlashcardDeck);
