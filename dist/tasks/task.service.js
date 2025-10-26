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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const task_repository_1 = require("./task.repository");
const TaskReponse_dto_1 = require("./dto/response/TaskReponse.dto");
const task_tag_service_1 = require("../task-tags/task-tag.service");
const common_2 = require("@nestjs/common");
let TaskService = class TaskService {
    constructor(taskRepository, taskTagService) {
        this.taskRepository = taskRepository;
        this.taskTagService = taskTagService;
    }
    async getAllTaskByID(id) {
        return await this.taskRepository.getAllTaskByID(id);
    }
    async getTaskByID(taskId) {
        const task = await this.taskRepository.getTaskByID(taskId);
        return new TaskReponse_dto_1.TaskResponse(task);
    }
    async createTask(userId, createTaskDto) {
        const start = createTaskDto.start_time ? new Date(createTaskDto.start_time) : undefined;
        const end = createTaskDto.end_time ? new Date(createTaskDto.end_time) : undefined;
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
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Deadline must be after start time' });
            }
        }
        const task = await this.taskRepository.createTask(userId, createTaskDto);
        return new TaskReponse_dto_1.TaskResponse(task);
    }
    async updateTask(taskId, updateTaskDto) {
        const start = updateTaskDto.start_time ? new Date(updateTaskDto.start_time) : undefined;
        const end = updateTaskDto.end_time ? new Date(updateTaskDto.end_time) : undefined;
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
                throw new common_2.BadRequestException({ statusCode: 400, message: 'Deadline must be after start time' });
            }
        }
        const task = await this.taskRepository.updateTask(taskId, updateTaskDto);
        return new TaskReponse_dto_1.TaskResponse(task);
    }
    async deleteTask(taskId) {
        const task = await this.taskRepository.deleteTask(taskId);
        await this.taskTagService.deleteMany({ task_id: task._id });
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_repository_1.TaskRepository,
        task_tag_service_1.TaskTagService])
], TaskService);
//# sourceMappingURL=task.service.js.map