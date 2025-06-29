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
exports.TaskTagController = void 0;
const common_1 = require("@nestjs/common");
const task_tag_service_1 = require("./task-tag.service");
const TaskTagResponse_dto_1 = require("./dto/response/TaskTagResponse.dto");
const CreateTaskTagRequest_dto_1 = require("./dto/request/CreateTaskTagRequest.dto");
const api_response_1 = require("../common/api-response");
const swagger_1 = require("@nestjs/swagger");
let TaskTagController = class TaskTagController {
    constructor(taskTagService) {
        this.taskTagService = taskTagService;
    }
    async createTaskTag(createTaskTagDto) {
        const taskTag = await this.taskTagService.createTaskTag(createTaskTagDto);
        return new api_response_1.ApiResponse(taskTag);
    }
    async deleteTaskTag(taskTagId) {
        await this.taskTagService.deleteTaskTag(taskTagId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.TaskTagController = TaskTagController;
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateTaskTagRequest_dto_1.CreateTaskTagRequest }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Create task successfully',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(TaskTagResponse_dto_1.TaskTagResponse) },
                    },
                },
            ],
        },
    }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTaskTagRequest_dto_1.CreateTaskTagRequest]),
    __metadata("design:returntype", Promise)
], TaskTagController.prototype, "createTaskTag", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskTagController.prototype, "deleteTaskTag", null);
exports.TaskTagController = TaskTagController = __decorate([
    (0, swagger_1.ApiTags)('Task Tag'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiExtraModels)(api_response_1.ApiResponse, TaskTagResponse_dto_1.TaskTagResponse),
    (0, common_1.Controller)('/task-tag'),
    __metadata("design:paramtypes", [task_tag_service_1.TaskTagService])
], TaskTagController);
//# sourceMappingURL=task-tag.controller.js.map