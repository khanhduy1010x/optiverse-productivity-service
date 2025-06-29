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
exports.FriendController = void 0;
const common_1 = require("@nestjs/common");
const friend_service_1 = require("./friend.service");
const api_response_1 = require("../common/api-response");
const CreateFriendRequest_dto_1 = require("./dto/request/CreateFriendRequest.dto");
const UpdateFriendRequest_dto_1 = require("./dto/request/UpdateFriendRequest.dto");
const swagger_1 = require("@nestjs/swagger");
let FriendController = class FriendController {
    constructor(friendService) {
        this.friendService = friendService;
    }
    async getFriendsByUserID(userId) {
        const friends = await this.friendService.getFriendsByUserID(userId);
        return new api_response_1.ApiResponse(friends);
    }
    async createFriend(createFriendDto) {
        const friend = await this.friendService.createFriend(createFriendDto);
        return new api_response_1.ApiResponse(friend);
    }
    async updateFriend(friendId, updateFriendDto) {
        const friend = await this.friendService.updateFriend(friendId, updateFriendDto);
        return new api_response_1.ApiResponse(friend);
    }
    async deleteFriend(friendId) {
        await this.friendService.deleteFriend(friendId);
        return new api_response_1.ApiResponse();
    }
    async searchUserByEmail(email, req) {
        const user = req.userInfo;
        const UserResponse = await this.friendService.searchUserByEmail(email);
        console.log("tao la usser" + user.userId);
        console.log("tao la UserResponse" + UserResponse?.userId);
        if (UserResponse?.email == user.email) {
            UserResponse.is_self = true;
            console.log("hello");
        }
        return new api_response_1.ApiResponse(UserResponse);
    }
    async addFriend(req, friendId) {
        const user = req.userInfo;
        const friend = await this.friendService.addFriend(user.userId, friendId);
        return new api_response_1.ApiResponse(friend);
    }
    async acceptFriend(id) {
        const updatedFriend = await this.friendService.acceptFriend(id);
        return new api_response_1.ApiResponse(updatedFriend);
    }
    async viewAllPending(req) {
        const user = req.userInfo;
        const friends = await this.friendService.viewAllPending(user.userId.toString());
        return new api_response_1.ApiResponse(friends);
    }
    async viewAllSent(req) {
        const user = req.userInfo;
        const sentRequestsWithUserInfo = await this.friendService.viewAllSent(user.userId.toString());
        return new api_response_1.ApiResponse(sentRequestsWithUserInfo);
    }
    async viewAllFriends(userId) {
        const friends = await this.friendService.viewAllFriends(userId);
        return new api_response_1.ApiResponse(friends);
    }
    async removeFriend(id) {
        const removed = await this.friendService.removeFriend(id);
        return new api_response_1.ApiResponse(removed);
    }
    async cancelFriendRequest(id) {
        const canceled = await this.friendService.cancelFriendRequest(id);
        return new api_response_1.ApiResponse(canceled);
    }
    async viewAllFriendForUser(req) {
        const user = req.userInfo;
        const friends = await this.friendService.viewAllFriends(user.userId);
        return new api_response_1.ApiResponse(friends);
    }
};
exports.FriendController = FriendController;
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'userId',
        type: String,
    }),
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "getFriendsByUserID", null);
__decorate([
    (0, swagger_1.ApiBody)({ type: CreateFriendRequest_dto_1.CreateFriendRequest }),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateFriendRequest_dto_1.CreateFriendRequest]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "createFriend", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, swagger_1.ApiBody)({ type: UpdateFriendRequest_dto_1.UpdateFriendRequest }),
    (0, common_1.Put)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFriendRequest_dto_1.UpdateFriendRequest]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "updateFriend", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "deleteFriend", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'email',
        type: String,
    }),
    (0, common_1.Get)('search-user/:email'),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "searchUserByEmail", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'friendId',
        type: String,
    }),
    (0, common_1.Post)('add/:friendId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "addFriend", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Put)('accept/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "acceptFriend", null);
__decorate([
    (0, common_1.Get)('view-all/pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "viewAllPending", null);
__decorate([
    (0, common_1.Get)('view-all/sent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "viewAllSent", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'userId',
        type: String,
    }),
    (0, common_1.Get)('view-all/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "viewAllFriends", null);
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
], FriendController.prototype, "removeFriend", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
    }),
    (0, common_1.Delete)('cancel/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "cancelFriendRequest", null);
__decorate([
    (0, common_1.Get)('view-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "viewAllFriendForUser", null);
exports.FriendController = FriendController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/friend'),
    __metadata("design:paramtypes", [friend_service_1.FriendService])
], FriendController);
//# sourceMappingURL=friend.controller.js.map