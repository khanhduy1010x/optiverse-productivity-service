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
exports.UserInventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_inventory_schema_1 = require("./user-inventory.schema");
let UserInventoryRepository = class UserInventoryRepository {
    constructor(userInventoryModel, frameModel) {
        this.userInventoryModel = userInventoryModel;
        this.frameModel = frameModel;
    }
    async findByUserId(userId) {
        return this.userInventoryModel.find({ user_id: userId }).exec();
    }
    async create(data) {
        const created = new this.userInventoryModel(data);
        return created.save();
    }
    async findOne(filter) {
        return this.userInventoryModel.findOne(filter).exec();
    }
    async createFrame(data) {
        const created = new this.frameModel(data);
        return created.save();
    }
    async findAllFrames() {
        return this.frameModel.find().exec();
    }
    async findFrameById(id) {
        return this.frameModel.findById(id).exec();
    }
    async updateFrame(id, data) {
        return this.frameModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    async deleteFrame(id) {
        return this.frameModel.findByIdAndDelete(id).exec();
    }
    async addReward(userId, rewardValue) {
        const existingRecord = await this.userInventoryModel.findOne({
            user_id: userId,
            op: { $regex: /^\d+$/ }
        }).exec();
        if (existingRecord) {
            const currentPoints = parseInt(existingRecord.op);
            const additionalPoints = parseInt(rewardValue);
            existingRecord.op = (currentPoints + additionalPoints).toString();
            existingRecord.frame.push(new Date().toISOString());
            return existingRecord.save();
        }
        else {
            const newRecord = new this.userInventoryModel({
                user_id: userId,
                op: rewardValue,
            });
            return newRecord.save();
        }
    }
    async exchangeFrame(userId, frameId) {
        const frame = await this.frameModel.findById(frameId).exec();
        if (!frame) {
            return { success: false, message: 'Frame không tồn tại' };
        }
        const userInventory = await this.userInventoryModel.findOne({
            user_id: userId,
            op: { $regex: /^\d+$/ }
        }).exec();
        if (!userInventory) {
            return { success: false, message: 'Bạn không có điểm loại này' };
        }
        if (userInventory.frame.includes(frameId)) {
            return { success: false, message: `Bạn đã sở hữu frame "${frame.title}" rồi!` };
        }
        const currentPoints = parseInt(userInventory.op);
        if (currentPoints < frame.cost) {
            return { success: false, message: `Không đủ điểm. Cần ${frame.cost} điểm, hiện có ${currentPoints} điểm` };
        }
        const newPoints = currentPoints - frame.cost;
        userInventory.op = newPoints.toString();
        userInventory.frame.push(frameId);
        const updatedInventory = await userInventory.save();
        return {
            success: true,
            message: `Đổi frame "${frame.title}" thành công! Đã trừ ${frame.cost} điểm.`,
            userInventory: updatedInventory
        };
    }
};
exports.UserInventoryRepository = UserInventoryRepository;
exports.UserInventoryRepository = UserInventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_inventory_schema_1.UserInventory.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_inventory_schema_1.Frame.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UserInventoryRepository);
//# sourceMappingURL=user-inventory.repository.js.map