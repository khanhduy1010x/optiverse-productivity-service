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
exports.CreateTaskEventRequest = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTaskEventRequest {
}
exports.CreateTaskEventRequest = CreateTaskEventRequest;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "task_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsString)({ message: 'Event title must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Event title must be at most 50 characters' }),
    (0, class_validator_1.Matches)(/\S/, { message: 'Event title cannot be only whitespace' }),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Start time is required' }),
    (0, class_transformer_1.Transform)(({ value }) => (value instanceof Date ? value.toISOString() : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'Start time must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "start_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value instanceof Date ? value.toISOString() : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'End time must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "end_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaskEventRequest.prototype, "all_day", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekday', 'custom']),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "repeat_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTaskEventRequest.prototype, "repeat_interval", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskEventRequest.prototype, "repeat_days", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['never', 'on', 'after']),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "repeat_end_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateTaskEventRequest.prototype, "repeat_end_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTaskEventRequest.prototype, "repeat_occurrences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTaskEventRequest.prototype, "repeat_frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['day', 'week', 'month', 'year']),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "repeat_unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskEventRequest.prototype, "exclusion_dates", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskEventRequest.prototype, "guests", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskEventRequest.prototype, "parent_event_id", void 0);
//# sourceMappingURL=CreateTaskEventRequest.dto.js.map