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
exports.CreateAchievementRequest = exports.RuleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const achievement_schema_1 = require("../../achievement.schema");
class RuleDto {
}
exports.RuleDto = RuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: achievement_schema_1.RuleCategory }),
    (0, class_validator_1.IsEnum)(achievement_schema_1.RuleCategory),
    __metadata("design:type", String)
], RuleDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RuleDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: achievement_schema_1.ValueType }),
    (0, class_validator_1.IsEnum)(achievement_schema_1.ValueType),
    __metadata("design:type", String)
], RuleDto.prototype, "value_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Required for STRING/NUMBER types, optional for DATE/BOOLEAN/ENUM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RuleDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: achievement_schema_1.Operator }),
    (0, class_validator_1.IsEnum)(achievement_schema_1.Operator),
    __metadata("design:type", String)
], RuleDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Giá trị filter, nếu là DATE/NUMBER sẽ parse từ string' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RuleDto.prototype, "value", void 0);
class CreateAchievementRequest {
}
exports.CreateAchievementRequest = CreateAchievementRequest;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAchievementRequest.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAchievementRequest.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        required: false,
        description: 'Achievement icon file upload'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAchievementRequest.prototype, "file", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAchievementRequest.prototype, "icon_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RuleDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RuleDto),
    __metadata("design:type", Object)
], CreateAchievementRequest.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: achievement_schema_1.LogicOperator, required: false, default: achievement_schema_1.LogicOperator.AND }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(achievement_schema_1.LogicOperator),
    __metadata("design:type", String)
], CreateAchievementRequest.prototype, "logic_operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAchievementRequest.prototype, "reward", void 0);
//# sourceMappingURL=CreateAchievementRequest.dto.js.map