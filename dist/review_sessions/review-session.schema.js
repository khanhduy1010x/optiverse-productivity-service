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
exports.ReviewSessionSchema = exports.ReviewSession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ReviewSession = class ReviewSession {
};
exports.ReviewSession = ReviewSession;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Flashcard' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReviewSession.prototype, "flashcard_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ReviewSession.prototype, "user_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], ReviewSession.prototype, "last_review", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], ReviewSession.prototype, "next_review", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 1 }),
    __metadata("design:type", Number)
], ReviewSession.prototype, "interval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 2.5 }),
    __metadata("design:type", Number)
], ReviewSession.prototype, "ease_factor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], ReviewSession.prototype, "repetition_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, min: 0, max: 3 }),
    __metadata("design:type", Number)
], ReviewSession.prototype, "quality", void 0);
exports.ReviewSession = ReviewSession = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ReviewSession);
exports.ReviewSessionSchema = mongoose_1.SchemaFactory.createForClass(ReviewSession);
//# sourceMappingURL=review-session.schema.js.map