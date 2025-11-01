import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'NoteFolder' })
  folder_id?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content?: string;

  @Prop({ type: Types.ObjectId })
  create_by?: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'LiveRoom' })
  live_room_id?: Types.ObjectId;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
