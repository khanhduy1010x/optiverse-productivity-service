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
exports.TagRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tag_schema_1 = require("./tag.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let TagRepository = class TagRepository {
    constructor(tagModel) {
        this.tagModel = tagModel;
    }
    async getAllTagsByUserID(userId) {
        return await this.tagModel
            .find({ user_id: new mongoose_2.Types.ObjectId(userId) })
            .populate({ path: 'tasks', populate: { path: 'task' } })
            .exec();
    }
    async getTagByID(tagId) {
        return await this.tagModel
            .findById(new mongoose_2.Types.ObjectId(tagId))
            .populate({ path: 'tasks', populate: { path: 'task' } })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async createTag(userId, createTagDto) {
        const newTag = new this.tagModel({
            ...createTagDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
            created_at: new Date(),
            updated_at: new Date(),
        });
        return await newTag.save();
    }
    async updateTag(tagId, updateTagDto) {
        return await this.tagModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(tagId), updateTagDto, { new: true })
            .populate({ path: 'tasks', populate: { path: 'task' } })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteTag(tagId) {
        const tag = await this.tagModel.findByIdAndDelete(tagId).exec();
        if (!tag) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
        return tag;
    }
};
exports.TagRepository = TagRepository;
exports.TagRepository = TagRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TagRepository);
//# sourceMappingURL=tag.repository.js.map