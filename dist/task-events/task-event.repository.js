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
exports.TaskEventRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_event_schema_1 = require("./task-event.schema");
const task_schema_1 = require("../tasks/task.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let TaskEventRepository = class TaskEventRepository {
    constructor(taskEventModel, taskModel) {
        this.taskEventModel = taskEventModel;
        this.taskModel = taskModel;
    }
    async getTaskEventsByTaskID(taskId) {
        return await this.taskEventModel.find({ task_id: new mongoose_2.Types.ObjectId(taskId) }).exec();
    }
    async createTaskEvent(createTaskEventDto) {
        const newTaskEvent = new this.taskEventModel({
            task_id: createTaskEventDto.task_id ? new mongoose_2.Types.ObjectId(createTaskEventDto.task_id) : undefined,
            user_id: new mongoose_2.Types.ObjectId(createTaskEventDto.user_id),
            title: createTaskEventDto.title || 'Untitled Event',
            description: createTaskEventDto.description || '',
            start_time: createTaskEventDto.start_time,
            end_time: createTaskEventDto.end_time,
            all_day: createTaskEventDto.all_day,
            repeat_type: createTaskEventDto.repeat_type,
            repeat_interval: createTaskEventDto.repeat_interval,
            repeat_days: createTaskEventDto.repeat_days,
            repeat_end_type: createTaskEventDto.repeat_end_type,
            repeat_end_date: createTaskEventDto.repeat_end_date,
            repeat_occurrences: createTaskEventDto.repeat_occurrences,
            repeat_frequency: createTaskEventDto.repeat_frequency,
            repeat_unit: createTaskEventDto.repeat_unit,
            exclusion_dates: createTaskEventDto.exclusion_dates,
            location: createTaskEventDto.location,
            guests: createTaskEventDto.guests,
            color: createTaskEventDto.color,
            parent_event_id: createTaskEventDto.parent_event_id ? new mongoose_2.Types.ObjectId(createTaskEventDto.parent_event_id) : undefined
        });
        return await newTaskEvent.save();
    }
    async updateTaskEvent(taskEventId, updateTaskEventDto) {
        return await this.taskEventModel
            .findByIdAndUpdate(new mongoose_2.Types.ObjectId(taskEventId), updateTaskEventDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteTaskEvent(taskEventId) {
        const result = await this.taskEventModel
            .deleteOne({ _id: new mongoose_2.Types.ObjectId(taskEventId) })
            .exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async getTaskEventsByUserID(userId) {
        return await this.taskEventModel.find({ user_id: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
};
exports.TaskEventRepository = TaskEventRepository;
exports.TaskEventRepository = TaskEventRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_event_schema_1.TaskEvent.name)),
    __param(1, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TaskEventRepository);
//# sourceMappingURL=task-event.repository.js.map