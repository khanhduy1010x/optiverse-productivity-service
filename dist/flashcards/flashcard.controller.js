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
exports.FlashcardController = void 0;
const common_1 = require("@nestjs/common");
const flashcard_service_1 = require("./flashcard.service");
const api_response_1 = require("../common/api-response");
const CreateFlashcardRequest_dto_1 = require("./dto/request/CreateFlashcardRequest.dto");
const UpdateFlashcardRequest_dto_1 = require("./dto/request/UpdateFlashcardRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let FlashcardController = class FlashcardController {
    constructor(flashcardService) {
        this.flashcardService = flashcardService;
    }
    async createFlashcard(req, createFlashcardDto) {
        const user = req.userInfo;
        const flashcard = await this.flashcardService.createFlashcard(user.userId, createFlashcardDto);
        return new api_response_1.ApiResponse(flashcard);
    }
    async updateFlashcard(flashcardId, updateFlashcardDto) {
        const flashcard = await this.flashcardService.updateFlashcard(flashcardId, updateFlashcardDto);
        return new api_response_1.ApiResponse(flashcard);
    }
    async deleteFlashcard(flashcardId) {
        await this.flashcardService.deleteFlashcard(flashcardId);
        return new api_response_1.ApiResponse(null);
    }
};
exports.FlashcardController = FlashcardController;
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateFlashcardRequest_dto_1.CreateFlashcardRequest }),
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateFlashcardRequest_dto_1.CreateFlashcardRequest]),
    __metadata("design:returntype", Promise)
], FlashcardController.prototype, "createFlashcard", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateFlashcardRequest_dto_1.UpdateFlashcardRequest }),
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFlashcardRequest_dto_1.UpdateFlashcardRequest]),
    __metadata("design:returntype", Promise)
], FlashcardController.prototype, "updateFlashcard", null);
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
], FlashcardController.prototype, "deleteFlashcard", null);
exports.FlashcardController = FlashcardController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/flashcard'),
    __metadata("design:paramtypes", [flashcard_service_1.FlashcardService])
], FlashcardController);
//# sourceMappingURL=flashcard.controller.js.map