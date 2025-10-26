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
exports.TaskTagService = void 0;
const common_1 = require("@nestjs/common");
const task_tag_repository_1 = require("./task-tag.repository");
const TaskTagResponse_dto_1 = require("./dto/response/TaskTagResponse.dto");
let TaskTagService = class TaskTagService {
    constructor(taskTagRepository) {
        this.taskTagRepository = taskTagRepository;
    }
    async createTaskTag(createTaskTagDto) {
        const taskTag = await this.taskTagRepository.createTaskTag(createTaskTagDto);
        return new TaskTagResponse_dto_1.TaskTagResponse(taskTag);
    }
    async deleteTaskTag(taskTagId) {
        return await this.taskTagRepository.deleteTaskTag(taskTagId);
    }
    async deleteMany({ task_id, tag_id, }) {
        await this.taskTagRepository.deleteMany({ task_id, tag_id });
    }
};
exports.TaskTagService = TaskTagService;
exports.TaskTagService = TaskTagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_tag_repository_1.TaskTagRepository])
], TaskTagService);
//# sourceMappingURL=task-tag.service.js.map