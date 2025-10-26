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
exports.CreateTaskRequest = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTaskRequest {
}
exports.CreateTaskRequest = CreateTaskRequest;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'task title' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title must not be empty' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Title must be at most 50 characters' }),
    (0, class_validator_1.Matches)(/\S/, { message: 'Title cannot be only whitespace' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'task description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Description must be at most 150 characters' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pending', enum: ['pending', 'completed', 'overdue'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'overdue'], { message: 'Invalid status value' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'low', enum: ['low', 'medium', 'high'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high'], { message: 'Invalid priority value' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-12T08:00:00.000Z' }),
    (0, class_transformer_1.Transform)(({ value }) => (value instanceof Date ? value.toISOString() : value)),
    (0, class_validator_1.IsNotEmpty)({ message: 'Start time is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Start time must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-12-12T10:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value instanceof Date ? value.toISOString() : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'End time must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateTaskRequest.prototype, "end_time", void 0);
//# sourceMappingURL=CreateTaskRequest.dto.js.map