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
exports.FlashcardSchema = exports.Flashcard = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Flashcard = class Flashcard {
};
exports.Flashcard = Flashcard;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'FlashcardDeck' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Flashcard.prototype, "deck_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Flashcard.prototype, "front", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Flashcard.prototype, "back", void 0);
exports.Flashcard = Flashcard = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Flashcard);
exports.FlashcardSchema = mongoose_1.SchemaFactory.createForClass(Flashcard);
exports.FlashcardSchema.virtual('reviewSession', {
    ref: 'ReviewSession',
    localField: '_id',
    foreignField: 'flashcard_id',
    justOne: true,
});
exports.FlashcardSchema.set('toObject', { virtuals: true });
exports.FlashcardSchema.set('toJSON', { virtuals: true });
//# sourceMappingURL=flashcard.schema.js.map