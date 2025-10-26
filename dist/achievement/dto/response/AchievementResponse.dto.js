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
exports.AchievementResponse = exports.RuleResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const achievement_schema_1 = require("../../achievement.schema");
class RuleResponse {
}
exports.RuleResponse = RuleResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RuleResponse.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RuleResponse.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RuleResponse.prototype, "value_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], RuleResponse.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RuleResponse.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RuleResponse.prototype, "value", void 0);
class AchievementResponse {
    constructor(ach) {
        this._id = ach._id.toString();
        this.title = ach.title;
        this.description = ach.description;
        this.icon_url = ach.icon_url;
        this.rules = (ach.rules || []).map((r) => ({
            category: r.category,
            field: r.field,
            value_type: r.value_type,
            threshold: r.threshold,
            operator: r.operator,
            value: r.value,
        }));
        this.logic_operator = ach.logic_operator;
        this.reward = ach.reward;
    }
}
exports.AchievementResponse = AchievementResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AchievementResponse.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AchievementResponse.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AchievementResponse.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AchievementResponse.prototype, "icon_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RuleResponse] }),
    __metadata("design:type", Array)
], AchievementResponse.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: achievement_schema_1.LogicOperator, default: achievement_schema_1.LogicOperator.AND }),
    __metadata("design:type", String)
], AchievementResponse.prototype, "logic_operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AchievementResponse.prototype, "reward", void 0);
//# sourceMappingURL=AchievementResponse.dto.js.map