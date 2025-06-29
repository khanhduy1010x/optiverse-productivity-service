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
        const task = await this.taskRepository.createTask(userId, createTaskDto);
        return new TaskReponse_dto_1.TaskResponse(task);
    }
    async updateTask(taskId, updateTaskDto) {
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