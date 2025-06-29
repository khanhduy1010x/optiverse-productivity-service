import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TaskEventDocument = TaskEvent & Document;
export declare class TaskEvent {
    _id: mongoose.Types.ObjectId;
    task_id: Types.ObjectId;
    start_time: Date;
    end_time?: Date;
    repeat_type: string;
    repeat_interval?: number;
    repeat_end_date?: Date;
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
