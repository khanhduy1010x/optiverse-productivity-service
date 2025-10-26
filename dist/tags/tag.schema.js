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
exports.TagSchema = exports.Tag = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Tag = class Tag {
};
exports.Tag = Tag;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Tag.prototype, "user_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '#000000' }),
    __metadata("design:type", String)
], Tag.prototype, "color", void 0);
exports.Tag = Tag = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Tag);
exports.TagSchema = mongoose_1.SchemaFactory.createForClass(Tag);
exports.TagSchema.virtual('tasks', {
    ref: 'TaskTag',
    localField: '_id',
    foreignField: 'tag',
    justOne: false,
    options: { populate: { path: 'task' } },
});
exports.TagSchema.set('toObject', { virtuals: true });
exports.TagSchema.set('toJSON', { virtuals: true });
//# sourceMappingURL=tag.schema.js.map