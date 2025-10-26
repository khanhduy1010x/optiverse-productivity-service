import { TaskEventRepository } from './task-event.repository';
import { TaskEvent } from './task-event.schema';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';
export declare class TaskEventService {
    private readonly taskEventRepository;
    constructor(taskEventRepository: TaskEventRepository);
    getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]>;
    createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEventResponse>;
    updateTaskEvent(taskEventId: string, updateTaskEventDto: UpdateTaskEventRequest): Promise<TaskEventResponse>;
    deleteTaskEvent(taskEventId: string): Promise<void>;
    getTaskEventsByUserID(userId: string): Promise<TaskEventResponse[]>;
}
