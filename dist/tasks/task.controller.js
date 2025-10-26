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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const TaskReponse_dto_1 = require("./dto/response/TaskReponse.dto");
const CreateTaskRequest_dto_1 = require("./dto/request/CreateTaskRequest.dto");
const UpdateTaskRequest_dto_1 = require("./dto/request/UpdateTaskRequest.dto");
const api_response_1 = require("../common/api-response");
const swagger_1 = require("@nestjs/swagger");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    async getAllTaskUser(req) {
        const user = req.userInfo;
        const result = await this.taskService.getAllTaskByID(user.userId);
        return new api_response_1.ApiResponse(result);
    }
    async getTaskById(taskId) {
        const task = await this.taskService.getTaskByID(taskId);
        return new api_response_1.ApiResponse(task);
    }
    async createTask(req, createTaskDto) {
        const user = req.userInfo;
        const task = await this.taskService.createTask(user.userId, createTaskDto);
        return new api_response_1.ApiResponse(task);
    }
    async updateTask(taskId, updateTaskDto) {
        const task = await this.taskService.updateTask(taskId, updateTaskDto);
        return new api_response_1.ApiResponse(task);
    }
    async deleteTask(taskId) {
        await this.taskService.deleteTask(taskId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getAllTaskUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskById", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateTaskRequest_dto_1.CreateTaskRequest }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Create task successfully',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(TaskReponse_dto_1.TaskResponse) },
                    },
                },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Created failed' }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateTaskRequest_dto_1.CreateTaskRequest]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "createTask", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateTaskRequest_dto_1.UpdateTaskRequest }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update task successfully',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(TaskReponse_dto_1.TaskResponse) },
                    },
                },
            ],
        },
    }),
    (0, common_1.Put)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTaskRequest_dto_1.UpdateTaskRequest]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "updateTask", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('Task'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiExtraModels)(api_response_1.ApiResponse, TaskReponse_dto_1.TaskResponse),
    (0, common_1.Controller)('/task'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map