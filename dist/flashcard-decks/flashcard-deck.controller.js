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
exports.FlashcardDeckController = void 0;
const common_1 = require("@nestjs/common");
const flashcard_deck_service_1 = require("./flashcard-deck.service");
const api_response_1 = require("../common/api-response");
const CreateFlashcardDeckRequest_dto_1 = require("./dto/request/CreateFlashcardDeckRequest.dto");
const UpdateFlashcardDeckRequest_dto_1 = require("./dto/request/UpdateFlashcardDeckRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let FlashcardDeckController = class FlashcardDeckController {
    constructor(flashcardDeckService) {
        this.flashcardDeckService = flashcardDeckService;
    }
    async getFlashcardDecksByUserID(req) {
        const user = req.userInfo;
        const flashcardDecks = await this.flashcardDeckService.getFlashcardDecksByUserID(user.userId);
        return new api_response_1.ApiResponse(flashcardDecks);
    }
    async getStatisticsByUserID(req) {
        const user = req.userInfo;
        const basicStatistic = await this.flashcardDeckService.getStatisticsByUserID(user.userId);
        const reviewsByDay = await this.flashcardDeckService.getReviewsByDayByUserID(user.userId);
        const dueTodayPerDeck = await this.flashcardDeckService.getDueTodayPerDeck(user.userId);
        return new api_response_1.ApiResponse({
            ...basicStatistic,
            reviewsByDay,
            dueTodayPerDeck
        });
    }
    async getFlashcardDeckById(flashcardDeckId) {
        const flashcardDeck = await this.flashcardDeckService.getFlashcardDeckById(flashcardDeckId);
        return new api_response_1.ApiResponse(flashcardDeck);
    }
    async createFlashcardDeck(req, createFlashcardDeckDto) {
        const user = req.userInfo;
        const flashcardDeck = await this.flashcardDeckService.createFlashcardDeck(createFlashcardDeckDto, user.userId);
        return new api_response_1.ApiResponse(flashcardDeck);
    }
    async updateFlashcardDeck(flashcardDeckId, updateFlashcardDeckDto) {
        const flashcardDeck = await this.flashcardDeckService.updateFlashcardDeck(flashcardDeckId, updateFlashcardDeckDto);
        return new api_response_1.ApiResponse(flashcardDeck);
    }
    async duplicateFlashcardDeck(flashcardDeckId, req) {
        const user = req.userInfo;
        const duplicatedDeck = await this.flashcardDeckService.duplicateFlashcardDeck(flashcardDeckId, user.userId);
        return new api_response_1.ApiResponse(duplicatedDeck);
    }
    async deleteFlashcardDeck(flashcardDeckId) {
        await this.flashcardDeckService.deleteFlashcardDeck(flashcardDeckId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.FlashcardDeckController = FlashcardDeckController;
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "getFlashcardDecksByUserID", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "getStatisticsByUserID", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "getFlashcardDeckById", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateFlashcardDeckRequest_dto_1.CreateFlashcardDeckRequest }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateFlashcardDeckRequest_dto_1.CreateFlashcardDeckRequest]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "createFlashcardDeck", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateFlashcardDeckRequest_dto_1.UpdateFlashcardDeckRequest }),
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFlashcardDeckRequest_dto_1.UpdateFlashcardDeckRequest]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "updateFlashcardDeck", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Post)('/:id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "duplicateFlashcardDeck", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlashcardDeckController.prototype, "deleteFlashcardDeck", null);
exports.FlashcardDeckController = FlashcardDeckController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/flashcard-deck'),
    __metadata("design:paramtypes", [flashcard_deck_service_1.FlashcardDeckService])
], FlashcardDeckController);
//# sourceMappingURL=flashcard-deck.controller.js.map