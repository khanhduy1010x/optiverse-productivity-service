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
exports.TaskTagRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_tag_schema_1 = require("./task-tag.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let TaskTagRepository = class TaskTagRepository {
    constructor(taskTagModel) {
        this.taskTagModel = taskTagModel;
    }
    async createTaskTag(createTaskTagDto) {
        const newTaskTag = new this.taskTagModel({
            task: new mongoose_2.Types.ObjectId(createTaskTagDto.task_id),
            tag: new mongoose_2.Types.ObjectId(createTaskTagDto.tag_id),
            created_at: new Date(),
            updated_at: new Date(),
        });
        const taskTag = await newTaskTag.save();
        return (await taskTag.populate('task')).populate('tag');
    }
    async deleteTaskTag(taskTagId) {
        const result = await this.taskTagModel.deleteOne({ _id: new mongoose_2.Types.ObjectId(taskTagId) }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async deleteMany({ task_id, tag_id, }) {
        if (task_id) {
            await this.taskTagModel.deleteMany({ task: task_id });
            return;
        }
        if (tag_id) {
            await this.taskTagModel.deleteMany({ tag: tag_id });
            return;
        }
        throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
    }
};
exports.TaskTagRepository = TaskTagRepository;
exports.TaskTagRepository = TaskTagRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_tag_schema_1.TaskTag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TaskTagRepository);
//# sourceMappingURL=task-tag.repository.js.map