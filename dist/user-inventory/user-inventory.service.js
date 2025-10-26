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
exports.UserInventoryService = void 0;
const common_1 = require("@nestjs/common");
const user_inventory_repository_1 = require("./user-inventory.repository");
let UserInventoryService = class UserInventoryService {
    constructor(repo) {
        this.repo = repo;
    }
    async findByUserId(userId) {
        return this.repo.findByUserId(userId);
    }
    async create(data) {
        const { user_id, op, frame } = data;
        const existed = await this.repo.findOne({ user_id, op, frame });
        if (existed) {
            return existed;
        }
        return this.repo.create(data);
    }
    async createFrame(data) {
        return this.repo.createFrame(data);
    }
    async getAllFrames() {
        return this.repo.findAllFrames();
    }
    async getFrameById(id) {
        return this.repo.findFrameById(id);
    }
    async updateFrame(id, data) {
        return this.repo.updateFrame(id, data);
    }
    async deleteFrame(id) {
        return this.repo.deleteFrame(id);
    }
    async addReward(userId, rewardValue) {
        return this.repo.addReward(userId, rewardValue);
    }
    async exchangeFrame(userId, frameId) {
        return this.repo.exchangeFrame(userId, frameId);
    }
};
exports.UserInventoryService = UserInventoryService;
exports.UserInventoryService = UserInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_inventory_repository_1.UserInventoryRepository])
], UserInventoryService);
//# sourceMappingURL=user-inventory.service.js.map