import { Model } from 'mongoose';
import { TaskEvent } from './task-event.schema';
import { Task } from '../tasks/task.schema';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
export declare class TaskEventRepository {
    private readonly taskEventModel;
    private readonly taskModel;
    constructor(taskEventModel: Model<TaskEvent>, taskModel: Model<Task>);
    getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]>;
    createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEvent>;
    updateTaskEvent(taskEventId: string, updateTaskEventDto: UpdateTaskEventRequest): Promise<TaskEvent>;
    deleteTaskEvent(taskEventId: string): Promise<void>;
    getTaskEventsByUserID(userId: string): Promise<TaskEvent[]>;
}
