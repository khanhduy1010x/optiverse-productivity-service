import { Document } from 'mongoose';
import mongoose, { Types } from 'mongoose';
export type AchievementDocument = Achievement & Document;
export declare enum RuleCategory {
    TASK = "TASK",
    FRIEND = "FRIEND",
    STREAK = "STREAK"
}
export declare enum ValueType {
    STRING = "STRING",
    ENUM = "ENUM",
    DATE = "DATE",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN"
}
export declare enum Operator {
    GT = "GT",
    GTE = "GTE",
    LT = "LT",
    LTE = "LTE",
    EQ = "EQ",
    NE = "NE"
}
export declare enum LogicOperator {
    AND = "AND",
    OR = "OR"
}
export declare class Rule {
    category: RuleCategory;
    field: string;
    value_type: ValueType;
    threshold?: number;
    operator: Operator;
    value: string;
}
export declare class Achievement {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    icon_url?: string;
    rules: Rule[];
    logic_operator: LogicOperator;
    reward?: string;
}
export declare const AchievementSchema: mongoose.Schema<Achievement, mongoose.Model<Achievement, any, any, any, Document<unknown, any, Achievement, any> & Achievement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Achievement, Document<unknown, {}, mongoose.FlatRecord<Achievement>, {}> & mongoose.FlatRecord<Achievement> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
