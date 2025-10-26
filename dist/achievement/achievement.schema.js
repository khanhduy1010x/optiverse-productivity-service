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
exports.AchievementSchema = exports.Achievement = exports.Rule = exports.LogicOperator = exports.Operator = exports.ValueType = exports.RuleCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var RuleCategory;
(function (RuleCategory) {
    RuleCategory["TASK"] = "TASK";
    RuleCategory["FRIEND"] = "FRIEND";
    RuleCategory["STREAK"] = "STREAK";
})(RuleCategory || (exports.RuleCategory = RuleCategory = {}));
var ValueType;
(function (ValueType) {
    ValueType["STRING"] = "STRING";
    ValueType["ENUM"] = "ENUM";
    ValueType["DATE"] = "DATE";
    ValueType["NUMBER"] = "NUMBER";
    ValueType["BOOLEAN"] = "BOOLEAN";
})(ValueType || (exports.ValueType = ValueType = {}));
var Operator;
(function (Operator) {
    Operator["GT"] = "GT";
    Operator["GTE"] = "GTE";
    Operator["LT"] = "LT";
    Operator["LTE"] = "LTE";
    Operator["EQ"] = "EQ";
    Operator["NE"] = "NE";
})(Operator || (exports.Operator = Operator = {}));
var LogicOperator;
(function (LogicOperator) {
    LogicOperator["AND"] = "AND";
    LogicOperator["OR"] = "OR";
})(LogicOperator || (exports.LogicOperator = LogicOperator = {}));
let Rule = class Rule {
};
exports.Rule = Rule;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Object.values(RuleCategory) }),
    __metadata("design:type", String)
], Rule.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rule.prototype, "field", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Object.values(ValueType) }),
    __metadata("design:type", String)
], Rule.prototype, "value_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Rule.prototype, "threshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Object.values(Operator) }),
    __metadata("design:type", String)
], Rule.prototype, "operator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Rule.prototype, "value", void 0);
exports.Rule = Rule = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Rule);
let Achievement = class Achievement {
};
exports.Achievement = Achievement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Achievement.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Achievement.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Achievement.prototype, "icon_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Rule], default: [] }),
    __metadata("design:type", Array)
], Achievement.prototype, "rules", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(LogicOperator), default: LogicOperator.AND }),
    __metadata("design:type", String)
], Achievement.prototype, "logic_operator", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Achievement.prototype, "reward", void 0);
exports.Achievement = Achievement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Achievement);
exports.AchievementSchema = mongoose_1.SchemaFactory.createForClass(Achievement);
//# sourceMappingURL=achievement.schema.js.map