import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TaskEventDocument = TaskEvent & Document;
export declare class TaskEvent {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    title: string;
    description?: string;
    start_time: Date;
    end_time?: Date;
    all_day?: boolean;
    repeat_type: string;
    repeat_interval?: number;
    repeat_days?: number[];
    repeat_end_type?: string;
    repeat_end_date?: Date;
    repeat_occurrences?: number;
    repeat_frequency?: number;
    repeat_unit?: string;
    exclusion_dates?: Date[];
    location?: string;
    guests?: string[];
    color?: string;
    parent_event_id?: Types.ObjectId;
}
export declare const TaskEventSchema: mongoose.Schema<TaskEvent, mongoose.Model<TaskEvent, any, any, any, Document<unknown, any, TaskEvent, any> & TaskEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TaskEvent, Document<unknown, {}, mongoose.FlatRecord<TaskEvent>, {}> & mongoose.FlatRecord<TaskEvent> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
