import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose, { Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

export enum RuleCategory {
  TASK = 'TASK',
  FRIEND = 'FRIEND',
  STREAK = 'STREAK',
}

export enum ValueType {
  STRING = 'STRING',
  ENUM = 'ENUM',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export enum Operator {
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  EQ = 'EQ',
  NE = 'NE',
}

export enum LogicOperator {
  AND = 'AND',
  OR = 'OR',
}

@Schema({ _id: false })
export class Rule {
  @Prop({ required: true, enum: Object.values(RuleCategory) })
  category: RuleCategory;

  @Prop({ required: true })
  field: string;

  @Prop({ required: true, enum: Object.values(ValueType) })
  value_type: ValueType;

  @Prop({ required: false })
  threshold?: number;

  @Prop({ required: true, enum: Object.values(Operator) })
  operator: Operator;

  // Lưu dưới dạng string, service sẽ parse theo value_type
  @Prop({ required: false })
  value: string;
}

@Schema({ timestamps: true })
export class Achievement {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  icon_url?: string;

  @Prop({ type: [Rule], default: [] })
  rules: Rule[];

  @Prop({ enum: Object.values(LogicOperator), default: LogicOperator.AND })
  logic_operator: LogicOperator;

  @Prop()
  reward?: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);