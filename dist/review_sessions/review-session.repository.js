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
exports.ReviewSessionRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_session_schema_1 = require("./review-session.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let ReviewSessionRepository = class ReviewSessionRepository {
    constructor(reviewSessionModel) {
        this.reviewSessionModel = reviewSessionModel;
    }
    async findByUserAndFlashcard(userId, flashcardId) {
        return await this.reviewSessionModel
            .findOne({
            user_id: new mongoose_2.Types.ObjectId(userId),
            flashcard_id: new mongoose_2.Types.ObjectId(flashcardId),
        })
            .exec();
    }
    async updateByUserAndFlashcard(userId, flashcardId, data) {
        return await this.reviewSessionModel
            .findOneAndUpdate({
            user_id: new mongoose_2.Types.ObjectId(userId),
            flashcard_id: new mongoose_2.Types.ObjectId(flashcardId),
        }, data, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND))
            .exec();
    }
    async createReviewSession(sessionData) {
        const session = new this.reviewSessionModel(sessionData);
        return await session.save();
    }
    async getReviewSessionsByUserID(userId) {
        return await this.reviewSessionModel.find({ user_id: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
    async deleteReviewSessionByFlashcardId(flashcardId) {
        await this.reviewSessionModel.findOneAndDelete({
            flashcard_id: new mongoose_2.Types.ObjectId(flashcardId),
        });
    }
};
exports.ReviewSessionRepository = ReviewSessionRepository;
exports.ReviewSessionRepository = ReviewSessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_session_schema_1.ReviewSession.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewSessionRepository);
//# sourceMappingURL=review-session.repository.js.map