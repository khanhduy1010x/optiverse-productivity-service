import { TaskEventService } from './task-event.service';
import { ApiResponse } from 'src/common/api-response';
import { TaskEventResponse } from './dto/response/TaskEventResponse.dto';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';
import { TaskEvent } from './task-event.schema';
export declare class TaskEventController {
    private readonly taskEventService;
    constructor(taskEventService: TaskEventService);
    getTaskEventsByTaskID(taskId: string): Promise<ApiResponse<TaskEvent[]>>;
    getTaskEventsByUser(req: any): Promise<ApiResponse<TaskEventResponse[]>>;
    createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<ApiResponse<TaskEventResponse>>;
    updateTaskEvent(taskEventId: string, updateTaskEventDto: UpdateTaskEventRequest): Promise<ApiResponse<TaskEventResponse>>;
    deleteTaskEvent(taskEventId: string): Promise<ApiResponse<void>>;
}
