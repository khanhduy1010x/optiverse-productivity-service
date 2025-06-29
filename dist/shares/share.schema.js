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
exports.ShareSchema = exports.Share = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Share = class Share {
};
exports.Share = Share;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Share.prototype, "owner_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['note', 'folder'] }),
    __metadata("design:type", String)
], Share.prototype, "resource_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Share.prototype, "resource_id", void 0);
__decorate([
    (0, mongoose_1.Prop)([
        {
            user_id: { type: mongoose_2.Types.ObjectId, ref: 'User', required: true },
            permission: { type: String, enum: ['view', 'edit'], required: true },
            shared_at: { type: Date, default: Date.now },
        },
    ]),
    __metadata("design:type", Array)
], Share.prototype, "shared_with", void 0);
exports.Share = Share = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Share);
exports.ShareSchema = mongoose_1.SchemaFactory.createForClass(Share);
//# sourceMappingURL=share.schema.js.map