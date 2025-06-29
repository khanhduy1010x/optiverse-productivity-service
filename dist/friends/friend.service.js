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
exports.FriendService = void 0;
const common_1 = require("@nestjs/common");
const friend_repository_1 = require("./friend.repository");
const FriendResponse_dto_1 = require("./dto/response/FriendResponse.dto");
let FriendService = class FriendService {
    constructor(friendRepository) {
        this.friendRepository = friendRepository;
    }
    async getFriendsByUserID(userId) {
        return await this.friendRepository.getFriendsByUserID(userId);
    }
    async createFriend(createFriendDto) {
        const friend = await this.friendRepository.createFriend(createFriendDto);
        return new FriendResponse_dto_1.FriendResponse(friend);
    }
    async updateFriend(friendId, updateFriendDto) {
        const friend = await this.friendRepository.updateFriend(friendId, updateFriendDto);
        return new FriendResponse_dto_1.FriendResponse(friend);
    }
    async deleteFriend(friendId) {
        return await this.friendRepository.deleteFriend(friendId);
    }
    async searchUserByEmail(email) {
        return this.friendRepository.searchUserByEmail(email);
    }
    async addFriend(userId, friendId) {
        return this.friendRepository.addFriend(userId, friendId);
    }
    async acceptFriend(id) {
        return this.friendRepository.acceptFriend(id);
    }
    async viewAllFriends(userId) {
        return this.friendRepository.viewAllFriends(userId);
    }
    async viewAllPending(userId) {
        return this.friendRepository.viewAllPending(userId);
    }
    async viewAllSent(userId) {
        return this.friendRepository.viewAllSent(userId);
    }
    async removeFriend(id) {
        return this.friendRepository.removeFriend(id);
    }
    async cancelFriendRequest(id) {
        return this.friendRepository.cancelFriendRequest(id);
    }
};
exports.FriendService = FriendService;
exports.FriendService = FriendService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [friend_repository_1.FriendRepository])
], FriendService);
//# sourceMappingURL=friend.service.js.map