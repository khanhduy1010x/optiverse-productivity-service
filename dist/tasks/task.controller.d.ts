import { TaskService } from './task.service';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    getAllTaskUser(req: any): Promise<ApiResponseWrapper<GetAllTaskReponse>>;
    getTaskById(taskId: string): Promise<ApiResponseWrapper<TaskResponse>>;
    createTask(req: any, createTaskDto: CreateTaskRequest): Promise<ApiResponseWrapper<TaskResponse>>;
    updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<ApiResponseWrapper<TaskResponse>>;
    deleteTask(taskId: string): Promise<ApiResponseWrapper<void>>;
}
