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
exports.FlashcardDeckService = void 0;
const flashcard_service_1 = require("./../flashcards/flashcard.service");
const common_1 = require("@nestjs/common");
const flashcard_deck_repository_1 = require("./flashcard-deck.repository");
const FlashcardDeckResponse_dto_1 = require("./dto/response/FlashcardDeckResponse.dto");
let FlashcardDeckService = class FlashcardDeckService {
    constructor(flashcardDeckRepository, flashcardService) {
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardService = flashcardService;
    }
    async getFlashcardDecksByUserID(userId) {
        return await this.flashcardDeckRepository.getFlashcardDecksByUserID(userId);
    }
    async getStatisticsByUserID(userId) {
        return await this.flashcardDeckRepository.getStatisticsByUserID(userId);
    }
    async getDueTodayPerDeck(userId) {
        return await this.flashcardDeckRepository.getDueTodayPerDeck(userId);
    }
    async getReviewsByDayByUserID(userId) {
        return await this.flashcardDeckRepository.getReviewsByDay(userId);
    }
    async getFlashcardDeckById(deckId) {
        return await this.flashcardDeckRepository.getFlashcardDeckById(deckId);
    }
    async createFlashcardDeck(createFlashcardDeckDto, userId) {
        const flashcardDeck = await this.flashcardDeckRepository.createFlashcardDeck(createFlashcardDeckDto, userId);
        return new FlashcardDeckResponse_dto_1.FlashcardDeckResponse(flashcardDeck);
    }
    async updateFlashcardDeck(flashcardDeckId, updateFlashcardDeckDto) {
        const flashcardDeck = await this.flashcardDeckRepository.updateFlashcardDeck(flashcardDeckId, updateFlashcardDeckDto);
        return new FlashcardDeckResponse_dto_1.FlashcardDeckResponse(flashcardDeck);
    }
    async deleteFlashcardDeck(flashcardDeckId) {
        const flashcards = await this.flashcardService.getFlashcardsByDeckID(flashcardDeckId);
        const ids = flashcards.map((flashcard) => flashcard._id.toString());
        await this.flashcardService.deleteManyByIds(ids);
        await this.flashcardDeckRepository.deleteFlashcardDeck(flashcardDeckId);
    }
    async duplicateFlashcardDeck(deckId, userId) {
        const originalDeck = await this.flashcardDeckRepository.getFlashcardDeckById(deckId);
        if (!originalDeck) {
            throw new Error('Deck not found');
        }
        const newDeck = await this.flashcardDeckRepository.createFlashcardDeck({
            title: originalDeck.flashcardDeck.title + ' (Copy)',
        }, userId);
        const flashcards = await this.flashcardService.getFlashcardsByDeckID(deckId);
        for (const fc of flashcards) {
            await this.flashcardService.createFlashcard(userId, {
                deck_id: newDeck._id,
                front: fc.front,
                back: fc.back,
            });
        }
        return new FlashcardDeckResponse_dto_1.FlashcardDeckResponse(newDeck);
    }
};
exports.FlashcardDeckService = FlashcardDeckService;
exports.FlashcardDeckService = FlashcardDeckService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flashcard_deck_repository_1.FlashcardDeckRepository,
        flashcard_service_1.FlashcardService])
], FlashcardDeckService);
//# sourceMappingURL=flashcard-deck.service.js.map