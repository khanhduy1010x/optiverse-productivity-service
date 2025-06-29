import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
export type TaskTagDocument = TaskTag & Document;
export declare class TaskTag {
    _id: mongoose.Types.ObjectId;
    task: Types.ObjectId;
    tag: Types.ObjectId;
}
export declare const TaskTagSchema: mongoose.Schema<TaskTag, mongoose.Model<TaskTag, any, any, any, Document<unknown, any, TaskTag, any> & TaskTag & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TaskTag, Document<unknown, {}, mongoose.FlatRecord<TaskTag>, {}> & mongoose.FlatRecord<TaskTag> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
