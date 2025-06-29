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
exports.ReviewSessionService = void 0;
const common_1 = require("@nestjs/common");
const review_session_repository_1 = require("./review-session.repository");
const ReviewSessionResponse_dto_1 = require("./dto/response/ReviewSessionResponse.dto");
const mongoose_1 = require("mongoose");
let ReviewSessionService = class ReviewSessionService {
    constructor(reviewSessionRepository) {
        this.reviewSessionRepository = reviewSessionRepository;
    }
    async createReviewFlashcard(user_id, flashcard_id) {
        const now = new Date();
        const session = {
            flashcard_id: new mongoose_1.Types.ObjectId(flashcard_id),
            user_id: new mongoose_1.Types.ObjectId(user_id),
            last_review: now,
            next_review: now,
            interval: 0,
            ease_factor: 2.5,
            repetition_count: 0,
            quality: 0,
        };
        const newReviewFlashcard = await this.reviewSessionRepository.createReviewSession(session);
        return new ReviewSessionResponse_dto_1.ReviewSessionResponse(newReviewFlashcard);
    }
    async reviewFlashcard(userId, dto) {
        const existing = await this.reviewSessionRepository.findByUserAndFlashcard(userId, dto.flashcard_id);
        const now = new Date();
        const session = existing ?? {
            flashcard_id: new mongoose_1.Types.ObjectId(dto.flashcard_id),
            user_id: new mongoose_1.Types.ObjectId(userId),
            last_review: now,
            next_review: now,
            interval: 0,
            ease_factor: 2.5,
            repetition_count: 0,
            quality: dto.quality,
        };
        const q = dto.quality;
        const EF_MIN = 1.3;
        if (q === 0) {
            session.repetition_count = 0;
            session.interval = 0;
        }
        else {
            session.repetition_count += 1;
            if (session.repetition_count === 1)
                session.interval = 1;
            else if (session.repetition_count === 2)
                session.interval = 6;
            else
                session.interval = Math.round(session.interval * session.ease_factor);
            session.ease_factor += 0.1 - (3 - q) * (0.05 + (3 - q) * 0.02);
            if (session.ease_factor < EF_MIN)
                session.ease_factor = EF_MIN;
        }
        session.last_review = now;
        const millisecondsUntilNextReview = session.interval === 0 ? 1 * 60 * 1000 : session.interval * 24 * 60 * 60 * 1000;
        session.next_review = new Date(now.getTime() + millisecondsUntilNextReview);
        session.quality = q;
        const saved = existing
            ? await this.reviewSessionRepository.updateByUserAndFlashcard(userId, dto.flashcard_id, session)
            : await this.reviewSessionRepository.createReviewSession(session);
        return new ReviewSessionResponse_dto_1.ReviewSessionResponse(saved);
    }
    async getReviewSessionsByUserID(userId) {
        return await this.reviewSessionRepository.getReviewSessionsByUserID(userId);
    }
    async deleteReviewSessionByFlashcardId(flashcardId) {
        await this.reviewSessionRepository.deleteReviewSessionByFlashcardId(flashcardId);
    }
};
exports.ReviewSessionService = ReviewSessionService;
exports.ReviewSessionService = ReviewSessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [review_session_repository_1.ReviewSessionRepository])
], ReviewSessionService);
//# sourceMappingURL=review-session.service.js.map