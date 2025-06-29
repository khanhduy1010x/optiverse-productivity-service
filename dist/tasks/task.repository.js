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
exports.TaskRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("./task.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const GetAllTaskRepose_dto_1 = require("./dto/response/GetAllTaskRepose.dto");
let TaskRepository = class TaskRepository {
    constructor(taskModel) {
        this.taskModel = taskModel;
    }
    async getAllTaskByID(id) {
        const listTask = await this.taskModel
            .find({ user_id: new mongoose_2.Types.ObjectId(id) })
            .populate({ path: 'tags', populate: { path: 'tag' } })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
        return new GetAllTaskRepose_dto_1.GetAllTaskReponse(listTask);
    }
    async getTaskByID(taskId) {
        return await this.taskModel
            .findById(new mongoose_2.Types.ObjectId(taskId))
            .populate({ path: 'tags', populate: { path: 'tag' } })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async createTask(userId, createTaskDto) {
        const newTask = new this.taskModel({
            ...createTaskDto,
            user_id: new mongoose_2.Types.ObjectId(userId),
            created_at: new Date(),
            updated_at: new Date(),
        });
        return await newTask.save();
    }
    async updateTask(taskId, updateTaskDto) {
        return await this.taskModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(taskId), updateTaskDto, { new: true })
            .populate({ path: 'tags', populate: { path: 'tag' } })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteTask(taskId) {
        const task = await this.taskModel.findByIdAndDelete(taskId).exec();
        if (!task) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
        return task;
    }
};
exports.TaskRepository = TaskRepository;
exports.TaskRepository = TaskRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TaskRepository);
//# sourceMappingURL=task.repository.js.map