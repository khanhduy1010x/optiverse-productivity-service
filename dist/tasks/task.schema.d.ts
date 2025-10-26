import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TaskDocument = Task & Document;
export declare class Task {
    _id: mongoose.Types.ObjectId;
    user_id: Types.ObjectId;
    title: string;
    description?: string;
    status: string;
    priority: string;
    start_time: Date;
    end_time?: Date;
}
export declare const TaskSchema: mongoose.Schema<Task, mongoose.Model<Task, any, any, any, Document<unknown, any, Task, any> & Task & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Task, Document<unknown, {}, mongoose.FlatRecord<Task>, {}> & mongoose.FlatRecord<Task> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
