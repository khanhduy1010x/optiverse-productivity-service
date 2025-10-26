"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEventService = void 0;
const common_1 = require("@nestjs/common");
const task_event_repository_1 = require("./task-event.repository");
const TaskEventResponse_dto_1 = require("./dto/response/TaskEventResponse.dto");
const common_2 = require("@nestjs/common");
let TaskEventService = class TaskEventService {
    constructor(taskEventRepository) {
        this.taskEventRepository = taskEventRepository;
    }
    async getTaskEventsByTaskID(taskId) {
        return await this.taskEventRepository.getTaskEventsByTaskID(taskId);
    }
    async createTaskEvent(createTaskEventDto) {
        const start = createTaskEventDto.start_time ? new Date(createTaskEventDto.start_time) : undefined;
        const end = createTaskEventDto.end_time ? new Date(createTaskEventDto.end_time) : undefined;
        if (!start || isNaN(start.getTime())) {
            throw new common_2.BadRequestException({ statusCode: 400, message: 'Invalid start time' });
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        if (startDateOnly < today) {
            throw new common_2.BadRequestException({ statusCode: 400, message: 'Start date cannot be in the past' });
        }
        if (end) {
            if (isNaN(end.getTime())) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Invalid end time' });
            }
            const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            if (endDateOnly < today) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'End date cannot be in the past' });
            }
            if (end <= start) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'End time must be after start time' });
            }
        }
        const taskEvent = await this.taskEventRepository.createTaskEvent(createTaskEventDto);
        return new TaskEventResponse_dto_1.TaskEventResponse(taskEvent);
    }
    async updateTaskEvent(taskEventId, updateTaskEventDto) {
        const start = updateTaskEventDto.start_time ? new Date(updateTaskEventDto.start_time) : undefined;
        const end = updateTaskEventDto.end_time ? new Date(updateTaskEventDto.end_time) : undefined;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (start) {
            if (isNaN(start.getTime())) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Invalid start time' });
            }
            const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            if (startDateOnly < today) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Start date cannot be in the past' });
            }
        }
        if (end) {
            if (isNaN(end.getTime())) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Invalid end time' });
            }
            const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            if (endDateOnly < today) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'End date cannot be in the past' });
            }
            if (start && end <= start) {
                throw new common_2.BadRequestException({ statusCode: 400, message: 'End time must be after start time' });
            }
        }
        const taskEvent = await this.taskEventRepository.updateTaskEvent(taskEventId, updateTaskEventDto);
        return new TaskEventResponse_dto_1.TaskEventResponse(taskEvent);
    }
    async deleteTaskEvent(taskEventId) {
        return await this.taskEventRepository.deleteTaskEvent(taskEventId);
    }
    async getTaskEventsByUserID(userId) {
        const events = await this.taskEventRepository.getTaskEventsByUserID(userId);
        return events.map(ev => new TaskEventResponse_dto_1.TaskEventResponse(ev));
    }
};
exports.TaskEventService = TaskEventService;
exports.TaskEventService = TaskEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_event_repository_1.TaskEventRepository])
], TaskEventService);
//# sourceMappingURL=task-event.service.js.map