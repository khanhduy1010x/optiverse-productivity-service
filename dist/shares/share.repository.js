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
exports.ShareRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const share_schema_1 = require("./share.schema");
let ShareRepository = class ShareRepository {
    constructor(shareModel) {
        this.shareModel = shareModel;
    }
    async findShareByResourceId(resourceType, resourceId) {
        return await this.shareModel
            .findOne({
            resource_type: resourceType,
            resource_id: new mongoose_2.Types.ObjectId(resourceId),
        })
            .exec();
    }
    async createShare(ownerId, resourceType, resourceId, users) {
        const sharedUsers = users.map((user) => ({
            user_id: new mongoose_2.Types.ObjectId(user.user_id),
            permission: user.permission,
            shared_at: new Date(),
        }));
        const share = new this.shareModel({
            owner_id: new mongoose_2.Types.ObjectId(ownerId),
            resource_type: resourceType,
            resource_id: new mongoose_2.Types.ObjectId(resourceId),
            shared_with: sharedUsers,
        });
        return await share.save();
    }
    async updateShare(shareId, users) {
        const sharedUsers = users.map((user) => ({
            user_id: new mongoose_2.Types.ObjectId(user.user_id),
            permission: user.permission,
            shared_at: new Date(),
        }));
        return await this.shareModel
            .findByIdAndUpdate(shareId, { $set: { shared_with: sharedUsers } }, { new: true })
            .exec();
    }
    async addUsersToShare(shareId, users) {
        const sharedUsers = users.map((user) => ({
            user_id: new mongoose_2.Types.ObjectId(user.user_id),
            permission: user.permission,
            shared_at: new Date(),
        }));
        return await this.shareModel
            .findByIdAndUpdate(shareId, { $push: { shared_with: { $each: sharedUsers } } }, { new: true })
            .exec();
    }
    async removeUserFromShare(shareId, userId) {
        return await this.shareModel
            .findByIdAndUpdate(shareId, { $pull: { shared_with: { user_id: new mongoose_2.Types.ObjectId(userId) } } }, { new: true })
            .exec();
    }
    async deleteShare(shareId) {
        await this.shareModel.findByIdAndDelete(shareId).exec();
    }
    async getSharesSharedWithUser(userId) {
        return await this.shareModel
            .find({
            'shared_with.user_id': new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
    }
    async getSharesByOwnerId(ownerId) {
        return await this.shareModel
            .find({
            owner_id: new mongoose_2.Types.ObjectId(ownerId),
        })
            .exec();
    }
    async findShareByResourceIdAndUserId(resourceType, resourceId, userId) {
        return await this.shareModel
            .findOne({
            resource_type: resourceType,
            resource_id: new mongoose_2.Types.ObjectId(resourceId),
            'shared_with.user_id': new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
    }
};
exports.ShareRepository = ShareRepository;
exports.ShareRepository = ShareRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(share_schema_1.Share.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShareRepository);
//# sourceMappingURL=share.repository.js.map