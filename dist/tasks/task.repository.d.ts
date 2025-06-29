import { Model } from 'mongoose';
import { Task } from './task.schema';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
export declare class TaskRepository {
    private readonly taskModel;
    constructor(taskModel: Model<Task>);
    getAllTaskByID(id: string): Promise<GetAllTaskReponse>;
    getTaskByID(taskId: string): Promise<Task>;
    createTask(userId: string, createTaskDto: CreateTaskRequest): Promise<Task>;
    updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<Task>;
    deleteTask(taskId: string): Promise<Task>;
}
