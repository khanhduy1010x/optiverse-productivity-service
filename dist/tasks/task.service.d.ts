import { TaskRepository } from './task.repository';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { TaskTagService } from '../task-tags/task-tag.service';
export declare class TaskService {
    private readonly taskRepository;
    private readonly taskTagService;
    constructor(taskRepository: TaskRepository, taskTagService: TaskTagService);
    getAllTaskByID(id: string): Promise<GetAllTaskReponse>;
    getTaskByID(taskId: string): Promise<TaskResponse>;
    createTask(userId: string, createTaskDto: CreateTaskRequest): Promise<TaskResponse>;
    updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<TaskResponse>;
    deleteTask(taskId: string): Promise<void>;
}
