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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEventController = void 0;
const common_1 = require("@nestjs/common");
const task_event_service_1 = require("./task-event.service");
const api_response_1 = require("../common/api-response");
const CreateTaskEventRequest_dto_1 = require("./dto/request/CreateTaskEventRequest.dto");
const UpdateTaskEventRequest_dto_1 = require("./dto/request/UpdateTaskEventRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let TaskEventController = class TaskEventController {
    constructor(taskEventService) {
        this.taskEventService = taskEventService;
    }
    async getTaskEventsByTaskID(taskId) {
        const taskEvents = await this.taskEventService.getTaskEventsByTaskID(taskId);
        return new api_response_1.ApiResponse(taskEvents);
    }
    async createTaskEvent(createTaskEventDto) {
        const taskEvent = await this.taskEventService.createTaskEvent(createTaskEventDto);
        return new api_response_1.ApiResponse(taskEvent);
    }
    async updateTaskEvent(taskEventId, updateTaskEventDto) {
        const taskEvent = await this.taskEventService.updateTaskEvent(taskEventId, updateTaskEventDto);
        return new api_response_1.ApiResponse(taskEvent);
    }
    async deleteTaskEvent(taskEventId) {
        await this.taskEventService.deleteTaskEvent(taskEventId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.TaskEventController = TaskEventController;
__decorate([
    (0, common_1.Get)('task/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskEventController.prototype, "getTaskEventsByTaskID", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTaskEventRequest_dto_1.CreateTaskEventRequest]),
    __metadata("design:returntype", Promise)
], TaskEventController.prototype, "createTaskEvent", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTaskEventRequest_dto_1.UpdateTaskEventRequest]),
    __metadata("design:returntype", Promise)
], TaskEventController.prototype, "updateTaskEvent", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskEventController.prototype, "deleteTaskEvent", null);
exports.TaskEventController = TaskEventController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/task-event'),
    __metadata("design:paramtypes", [task_event_service_1.TaskEventService])
], TaskEventController);
//# sourceMappingURL=task-event.controller.js.map