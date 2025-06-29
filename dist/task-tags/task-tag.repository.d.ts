import { Model, Types } from 'mongoose';
import { TaskTag } from './task-tag.schema';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
export declare class TaskTagRepository {
    private readonly taskTagModel;
    constructor(taskTagModel: Model<TaskTag>);
    createTaskTag(createTaskTagDto: CreateTaskTagRequest): Promise<TaskTag>;
    deleteTaskTag(taskTagId: string): Promise<void>;
    deleteMany({ task_id, tag_id, }: {
        task_id?: Types.ObjectId;
        tag_id?: Types.ObjectId;
    }): Promise<void>;
}
