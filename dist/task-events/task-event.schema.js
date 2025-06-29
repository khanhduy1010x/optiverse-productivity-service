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
exports.TaskEventSchema = exports.TaskEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TaskEvent = class TaskEvent {
};
exports.TaskEvent = TaskEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Task' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TaskEvent.prototype, "task_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], TaskEvent.prototype, "start_time", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TaskEvent.prototype, "end_time", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' }),
    __metadata("design:type", String)
], TaskEvent.prototype, "repeat_type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], TaskEvent.prototype, "repeat_interval", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TaskEvent.prototype, "repeat_end_date", void 0);
exports.TaskEvent = TaskEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TaskEvent);
exports.TaskEventSchema = mongoose_1.SchemaFactory.createForClass(TaskEvent);
//# sourceMappingURL=task-event.schema.js.map