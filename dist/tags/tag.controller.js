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
exports.TagController = void 0;
const common_1 = require("@nestjs/common");
const tag_service_1 = require("./tag.service");
const TagResponse_dto_1 = require("./dto/response/TagResponse.dto");
const CreateTagRequest_dto_1 = require("./dto/request/CreateTagRequest.dto");
const UpdateTagRequest_dto_1 = require("./dto/request/UpdateTagRequest.dto");
const api_response_1 = require("../common/api-response");
const swagger_1 = require("@nestjs/swagger");
let TagController = class TagController {
    constructor(tagService) {
        this.tagService = tagService;
    }
    async getAllTagsUser(req) {
        const user = req.userInfo;
        const tags = await this.tagService.getAllTagsByUserID(user.userId);
        return new api_response_1.ApiResponse(tags);
    }
    async getTagById(tagId) {
        const tag = await this.tagService.getTagByID(tagId);
        return new api_response_1.ApiResponse(tag);
    }
    async createTag(req, createTagDto) {
        const user = req.userInfo;
        const tag = await this.tagService.createTag(user.userId, createTagDto);
        return new api_response_1.ApiResponse(tag);
    }
    async updateTag(tagId, updateTagDto) {
        const tag = await this.tagService.updateTag(tagId, updateTagDto);
        return new api_response_1.ApiResponse(tag);
    }
    async deleteTag(tagId) {
        await this.tagService.deleteTag(tagId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.TagController = TagController;
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "getAllTagsUser", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "getTagById", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateTagRequest_dto_1.CreateTagRequest }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateTagRequest_dto_1.CreateTagRequest]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "createTag", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateTagRequest_dto_1.UpdateTagRequest }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTagRequest_dto_1.UpdateTagRequest]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "updateTag", null);
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
], TagController.prototype, "deleteTag", null);
exports.TagController = TagController = __decorate([
    (0, swagger_1.ApiTags)('Tag'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiExtraModels)(api_response_1.ApiResponse, TagResponse_dto_1.TagResponse),
    (0, common_1.Controller)('/tag'),
    __metadata("design:paramtypes", [tag_service_1.TagService])
], TagController);
//# sourceMappingURL=tag.controller.js.map