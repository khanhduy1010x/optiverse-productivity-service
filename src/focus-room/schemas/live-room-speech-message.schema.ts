import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SpeechMessageDocument = SpeechMessage & Document;

@Schema({ timestamps: true })
export class SpeechMessage {
  @Prop({ type: Types.ObjectId, ref: 'FocusRoom', required: false })
  room_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: Types.ObjectId;

  @Prop({ required: true })
  speaker_name: string;

  @Prop({ required: true })
  text: string;
}

export const SpeechMessageSchema = SchemaFactory.createForClass(SpeechMessage);
