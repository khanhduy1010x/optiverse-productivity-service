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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const tag_repository_1 = require("./tag.repository");
const TagResponse_dto_1 = require("./dto/response/TagResponse.dto");
const task_tag_service_1 = require("../task-tags/task-tag.service");
let TagService = class TagService {
    constructor(tagRepository, taskTagService) {
        this.tagRepository = tagRepository;
        this.taskTagService = taskTagService;
    }
    async getAllTagsByUserID(userId) {
        return await this.tagRepository.getAllTagsByUserID(userId);
    }
    async getTagByID(tagId) {
        const tag = await this.tagRepository.getTagByID(tagId);
        return new TagResponse_dto_1.TagResponse(tag);
    }
    async createTag(userId, createTagDto) {
        const tag = await this.tagRepository.createTag(userId, createTagDto);
        return new TagResponse_dto_1.TagResponse(tag);
    }
    async updateTag(tagId, updateTagDto) {
        const tag = await this.tagRepository.updateTag(tagId, updateTagDto);
        return new TagResponse_dto_1.TagResponse(tag);
    }
    async deleteTag(tagId) {
        const tag = await this.tagRepository.deleteTag(tagId);
        await this.taskTagService.deleteMany({ tag_id: tag._id });
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tag_repository_1.TagRepository,
        task_tag_service_1.TaskTagService])
], TagService);
//# sourceMappingURL=tag.service.js.map