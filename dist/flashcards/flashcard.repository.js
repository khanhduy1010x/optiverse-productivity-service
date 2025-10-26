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
exports.FlashcardRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const flashcard_schema_1 = require("./flashcard.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
let FlashcardRepository = class FlashcardRepository {
    constructor(flashcardModel) {
        this.flashcardModel = flashcardModel;
    }
    async getFlashcardsByDeckID(deckId) {
        return await this.flashcardModel
            .find({ deck_id: new mongoose_2.Types.ObjectId(deckId) })
            .populate('reviewSession')
            .exec();
    }
    async createFlashcard(createFlashcardDto) {
        const newFlashcard = new this.flashcardModel({
            ...createFlashcardDto,
            deck_id: new mongoose_2.Types.ObjectId(createFlashcardDto.deck_id),
        });
        return await newFlashcard.save();
    }
    async updateFlashcard(flashcardId, updateFlashcardDto) {
        return await this.flashcardModel
            .findByIdAndUpdate(flashcardId, updateFlashcardDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteFlashcard(flashcardId) {
        const result = await this.flashcardModel.deleteOne({ _id: flashcardId }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async deleteManyByIds(ids) {
        const objectIds = ids.map((id) => new mongoose_2.Types.ObjectId(id));
        const result = await this.flashcardModel.deleteMany({
            _id: { $in: objectIds },
        });
    }
};
exports.FlashcardRepository = FlashcardRepository;
exports.FlashcardRepository = FlashcardRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(flashcard_schema_1.Flashcard.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FlashcardRepository);
//# sourceMappingURL=flashcard.repository.js.map