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
exports.FrameSchema = exports.UserInventorySchema = exports.Frame = exports.UserInventory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserInventory = class UserInventory {
};
exports.UserInventory = UserInventory;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserInventory.prototype, "user_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserInventory.prototype, "op", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], UserInventory.prototype, "frame", void 0);
exports.UserInventory = UserInventory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserInventory);
let Frame = class Frame {
};
exports.Frame = Frame;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Frame.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Frame.prototype, "icon_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Frame.prototype, "cost", void 0);
exports.Frame = Frame = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Frame);
exports.UserInventorySchema = mongoose_1.SchemaFactory.createForClass(UserInventory);
exports.FrameSchema = mongoose_1.SchemaFactory.createForClass(Frame);
//# sourceMappingURL=user-inventory.schema.js.map