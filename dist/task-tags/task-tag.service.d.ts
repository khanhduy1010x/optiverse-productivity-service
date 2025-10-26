import { TaskTagRepository } from './task-tag.repository';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
import { TaskTagResponse } from './dto/response/TaskTagResponse.dto';
import { Types } from 'mongoose';
export declare class TaskTagService {
    private readonly taskTagRepository;
    constructor(taskTagRepository: TaskTagRepository);
    createTaskTag(createTaskTagDto: CreateTaskTagRequest): Promise<TaskTagResponse>;
    deleteTaskTag(taskTagId: string): Promise<void>;
    deleteMany({ task_id, tag_id, }: {
        task_id?: Types.ObjectId;
        tag_id?: Types.ObjectId;
    }): Promise<void>;
}
