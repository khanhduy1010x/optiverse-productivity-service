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
exports.FlashcardService = void 0;
const common_1 = require("@nestjs/common");
const flashcard_repository_1 = require("./flashcard.repository");
const FlashcardResponse_dto_1 = require("./dto/response/FlashcardResponse.dto");
const review_session_service_1 = require("../review_sessions/review-session.service");
let FlashcardService = class FlashcardService {
    constructor(flashcardRepository, reviewSessionService) {
        this.flashcardRepository = flashcardRepository;
        this.reviewSessionService = reviewSessionService;
    }
    async getFlashcardsByDeckID(deckId) {
        return await this.flashcardRepository.getFlashcardsByDeckID(deckId);
    }
    async createFlashcard(user_id, createFlashcardDto) {
        const flashcard = await this.flashcardRepository.createFlashcard(createFlashcardDto);
        const reviewSession = await this.reviewSessionService.createReviewFlashcard(user_id, flashcard._id.toString());
        return new FlashcardResponse_dto_1.FlashcardResponse(flashcard);
    }
    async updateFlashcard(flashcardId, updateFlashcardDto) {
        const flashcard = await this.flashcardRepository.updateFlashcard(flashcardId, updateFlashcardDto);
        return new FlashcardResponse_dto_1.FlashcardResponse(flashcard);
    }
    async deleteFlashcard(flashcardId) {
        await this.reviewSessionService.deleteReviewSessionByFlashcardId(flashcardId);
        return await this.flashcardRepository.deleteFlashcard(flashcardId);
    }
    async deleteManyByIds(ids) {
        return await this.flashcardRepository.deleteManyByIds(ids);
    }
};
exports.FlashcardService = FlashcardService;
exports.FlashcardService = FlashcardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flashcard_repository_1.FlashcardRepository,
        review_session_service_1.ReviewSessionService])
], FlashcardService);
//# sourceMappingURL=flashcard.service.js.map