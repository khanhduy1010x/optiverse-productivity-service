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
exports.UpdateAchievementRequest = exports.RuleUpdateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const achievement_schema_1 = require("../../achievement.schema");
class RuleUpdateDto {
}
exports.RuleUpdateDto = RuleUpdateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: achievement_schema_1.RuleCategory }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(achievement_schema_1.RuleCategory),
    __metadata("design:type", String)
], RuleUpdateDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RuleUpdateDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: achievement_schema_1.ValueType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(achievement_schema_1.ValueType),
    __metadata("design:type", String)
], RuleUpdateDto.prototype, "value_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required for STRING/NUMBER types, optional for DATE/BOOLEAN/ENUM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RuleUpdateDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: achievement_schema_1.Operator }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(achievement_schema_1.Operator),
    __metadata("design:type", String)
], RuleUpdateDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Giá trị filter, nếu là DATE/NUMBER sẽ parse từ string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RuleUpdateDto.prototype, "value", void 0);
class UpdateAchievementRequest {
}
exports.UpdateAchievementRequest = UpdateAchievementRequest;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        format: 'binary',
        description: 'Achievement icon file upload'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAchievementRequest.prototype, "file", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAchievementRequest.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAchievementRequest.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAchievementRequest.prototype, "icon_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [RuleUpdateDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RuleUpdateDto),
    __metadata("design:type", Object)
], UpdateAchievementRequest.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: achievement_schema_1.LogicOperator }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(achievement_schema_1.LogicOperator),
    __metadata("design:type", String)
], UpdateAchievementRequest.prototype, "logic_operator", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAchievementRequest.prototype, "reward", void 0);
//# sourceMappingURL=UpdateAchievementRequest.dto.js.map