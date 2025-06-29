import { TaskTagService } from './task-tag.service';
import { TaskTagResponse } from './dto/response/TaskTagResponse.dto';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
export declare class TaskTagController {
    private readonly taskTagService;
    constructor(taskTagService: TaskTagService);
    createTaskTag(createTaskTagDto: CreateTaskTagRequest): Promise<ApiResponseWrapper<TaskTagResponse>>;
    deleteTaskTag(taskTagId: string): Promise<ApiResponseWrapper<void>>;
}
