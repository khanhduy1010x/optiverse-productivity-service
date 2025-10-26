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
exports.FriendRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const friend_schema_1 = require("./friend.schema");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const user_http_client_1 = require("../http-axios/user-http.client");
let FriendRepository = class FriendRepository {
    constructor(friendModel, userHttpClient) {
        this.friendModel = friendModel;
        this.userHttpClient = userHttpClient;
    }
    async getFriendsByUserID(userId) {
        return await this.friendModel
            .find({ user_id: new mongoose_2.Types.ObjectId(userId) })
            .exec();
    }
    async createFriend(createFriendDto) {
        console.log('lllllll' + createFriendDto.user_id);
        const newFriend = new this.friendModel({
            ...createFriendDto,
            user_id: new mongoose_2.Types.ObjectId(createFriendDto.user_id),
            friend_id: new mongoose_2.Types.ObjectId(createFriendDto.friend_id),
        });
        return await newFriend.save();
    }
    async updateFriend(friend_id, updateFriendDto) {
        return await this.friendModel
            .findByIdAndUpdate(friend_id, updateFriendDto, { new: true })
            .orFail(new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND));
    }
    async deleteFriend(friend_id) {
        const result = await this.friendModel.deleteOne({ _id: friend_id }).exec();
        if (result.deletedCount === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async searchUserByEmail(email) {
        const response = await this.userHttpClient.getUser(email);
        console.log(response);
        if (response) {
            return response;
        }
        else {
            console.log('User not found');
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.NOT_FOUND);
        }
    }
    async addFriend(user_id, friend_id) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(user_id) ||
                !mongoose_2.Types.ObjectId.isValid(friend_id)) {
                console.error(`Invalid ObjectId format - user_id: ${user_id}, friend_id: ${friend_id}`);
                return null;
            }
            return this.friendModel.create({
                user_id: new mongoose_2.Types.ObjectId(user_id),
                friend_id: new mongoose_2.Types.ObjectId(friend_id),
                status: 'pending',
            });
        }
        catch (error) {
            console.error(`Error in addFriend - user_id: ${user_id}, friend_id: ${friend_id}:`, error);
            return null;
        }
    }
    async acceptFriend(id) {
        return this.friendModel
            .findOneAndUpdate({
            _id: id,
        }, { status: 'accepted' }, { new: true })
            .exec();
    }
    async viewAllFriends(user_id) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(user_id)) {
                console.error(`Invalid ObjectId format for user_id: ${user_id}`);
                return [];
            }
            const objectId = new mongoose_2.Types.ObjectId(user_id);
            const friendsAsUser = await this.friendModel
                .find({ user_id: objectId, status: 'accepted' })
                .exec();
            const friendsAsFriend = await this.friendModel
                .find({ friend_id: objectId, status: 'accepted' })
                .exec();
            const allFriends = [...friendsAsUser, ...friendsAsFriend];
            if (!allFriends || allFriends.length === 0) {
                return [];
            }
            const friendIds = allFriends.map((friend) => {
                return friend.user_id.toString() === user_id
                    ? friend.friend_id.toString()
                    : friend.user_id.toString();
            });
            try {
                const userDetails = await this.userHttpClient.getUsersByIds(friendIds);
                const enrichedFriends = allFriends.map((friend) => {
                    const isCurrentUserInFriendPosition = friend.friend_id.toString() === user_id;
                    const enrichedFriend = friend.toObject();
                    const friendId = isCurrentUserInFriendPosition
                        ? friend.user_id.toString()
                        : friend.friend_id.toString();
                    const userDetail = userDetails?.find((user) => user.user_id === friendId);
                    if (isCurrentUserInFriendPosition) {
                        const originalUserId = enrichedFriend.user_id;
                        const originalFriendId = enrichedFriend.friend_id;
                        enrichedFriend.user_id = originalFriendId;
                        enrichedFriend.friend_id = originalUserId;
                    }
                    if (userDetail) {
                        enrichedFriend.friendInfo = {
                            email: userDetail.email,
                            full_name: userDetail.full_name,
                            avatar_url: userDetail.avatar_url,
                        };
                    }
                    return enrichedFriend;
                });
                return enrichedFriends;
            }
            catch (error) {
                console.error(`Error fetching user details for friends: ${error}`);
                return allFriends;
            }
        }
        catch (error) {
            console.error(`Error in viewAllFriends for user_id ${user_id}:`, error);
            return [];
        }
    }
    async viewAllPending(user_id) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(user_id)) {
                console.error(`Invalid ObjectId format for user_id: ${user_id}`);
                return [];
            }
            const pendingRequests = await this.friendModel
                .find({ friend_id: new mongoose_2.Types.ObjectId(user_id), status: 'pending' })
                .exec();
            if (!pendingRequests || pendingRequests.length === 0) {
                return [];
            }
            const userIds = pendingRequests.map((request) => request.user_id.toString());
            try {
                const userDetails = await this.userHttpClient.getUsersByIds(userIds);
                console.log('User details for pending requests:', userDetails);
                const enrichedRequests = pendingRequests.map((request) => {
                    const userDetail = userDetails?.find((user) => user.user_id === request.user_id.toString());
                    const enrichedRequest = request.toObject();
                    if (userDetail) {
                        enrichedRequest.friendInfo = {
                            email: userDetail.email,
                            full_name: userDetail.full_name,
                            avatar_url: userDetail.avatar_url,
                        };
                    }
                    return enrichedRequest;
                });
                return enrichedRequests;
            }
            catch (error) {
                console.error(`Error fetching user details for pending requests: ${error}`);
                return pendingRequests;
            }
        }
        catch (error) {
            console.error(`Error in viewAllPending for user_id ${user_id}:`, error);
            return [];
        }
    }
    async viewAllSent(user_id) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(user_id)) {
                console.error(`Invalid ObjectId format for user_id: ${user_id}`);
                return [];
            }
            const sentRequests = await this.friendModel
                .find({ user_id: new mongoose_2.Types.ObjectId(user_id), status: 'pending' })
                .exec();
            if (!sentRequests || sentRequests.length === 0) {
                return [];
            }
            const friendIds = sentRequests.map((request) => request.friend_id.toString());
            try {
                const userDetails = await this.userHttpClient.getUsersByIds(friendIds);
                console.log(userDetails);
                const enrichedRequests = sentRequests.map((request) => {
                    const userDetail = userDetails?.find((user) => user.user_id === request.friend_id.toString());
                    const enrichedRequest = request.toObject();
                    if (userDetail) {
                        enrichedRequest.friendInfo = {
                            email: userDetail.email,
                            full_name: userDetail.full_name,
                            avatar_url: userDetail.avatar_url,
                        };
                    }
                    return enrichedRequest;
                });
                return enrichedRequests;
            }
            catch (error) {
                console.error(`Error fetching user details for sent requests: ${error}`);
                return sentRequests;
            }
        }
        catch (error) {
            console.error(`Error in viewAllSent for user_id ${user_id}:`, error);
            return [];
        }
    }
    async removeFriend(id) {
        return this.friendModel.findOneAndDelete({ _id: id }).exec();
    }
    async cancelFriendRequest(id) {
        return this.friendModel
            .findOneAndDelete({ _id: id, status: 'pending' })
            .exec();
    }
    async countAcceptedFriends(userId) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(userId)) {
                console.error(`Invalid ObjectId format for userId: ${userId}`);
                return 0;
            }
            const objectId = new mongoose_2.Types.ObjectId(userId);
            const friendsAsUserCount = await this.friendModel
                .countDocuments({ user_id: objectId, status: 'accepted' })
                .exec();
            const friendsAsFriendCount = await this.friendModel
                .countDocuments({ friend_id: objectId, status: 'accepted' })
                .exec();
            return friendsAsUserCount + friendsAsFriendCount;
        }
        catch (error) {
            console.error(`Error counting friends for userId ${userId}:`, error);
            return 0;
        }
    }
    async getFriendSuggestions(userId) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(userId)) {
                console.error(`Invalid ObjectId format for userId: ${userId}`);
                return [];
            }
            const objectId = new mongoose_2.Types.ObjectId(userId);
            const userFriends = await this.friendModel
                .find({
                $or: [
                    { user_id: objectId, status: 'accepted' },
                    { friend_id: objectId, status: 'accepted' },
                ],
            })
                .exec();
            const friendIds = userFriends.map((friend) => {
                return friend.user_id.toString() === userId
                    ? friend.friend_id
                    : friend.user_id;
            });
            const friendsOfFriends = await this.friendModel
                .find({
                $or: [
                    { user_id: { $in: friendIds }, status: 'accepted' },
                    { friend_id: { $in: friendIds }, status: 'accepted' },
                ],
            })
                .exec();
            const suggestions = new Map();
            const currentFriendIds = new Set([
                userId,
                ...friendIds.map((id) => id.toString()),
            ]);
            const existingRequests = await this.friendModel
                .find({
                $or: [
                    { user_id: objectId },
                    { friend_id: objectId },
                ],
            })
                .exec();
            const existingRequestIds = new Set(existingRequests.map((req) => {
                return req.user_id.toString() === userId
                    ? req.friend_id.toString()
                    : req.user_id.toString();
            }));
            for (const friend of friendsOfFriends) {
                const suggestedUserId = friend.user_id.toString() === userId ||
                    friendIds.some((id) => id.toString() === friend.user_id.toString())
                    ? friend.friend_id.toString()
                    : friend.user_id.toString();
                if (!currentFriendIds.has(suggestedUserId) &&
                    !existingRequestIds.has(suggestedUserId)) {
                    suggestions.set(suggestedUserId, friend);
                }
            }
            const suggestionArray = Array.from(suggestions.values());
            const enrichedSuggestions = [];
            for (const suggestion of suggestionArray) {
                try {
                    const suggestedUserId = suggestion.user_id.toString() === userId ||
                        friendIds.some((id) => id.toString() === suggestion.user_id.toString())
                        ? suggestion.friend_id.toString()
                        : suggestion.user_id.toString();
                    const userInfos = await this.userHttpClient.getUsersByIds([
                        suggestedUserId,
                    ]);
                    if (userInfos && userInfos.length > 0) {
                        const userInfo = userInfos[0];
                        const suggestionObj = suggestion instanceof Object && 'toObject' in suggestion
                            ? suggestion.toObject()
                            : JSON.parse(JSON.stringify(suggestion));
                        const enrichedSuggestion = {
                            ...suggestionObj,
                            friendInfo: {
                                email: userInfo.email,
                                full_name: userInfo.full_name,
                                avatar_url: userInfo.avatar_url,
                            },
                        };
                        enrichedSuggestions.push(enrichedSuggestion);
                    }
                }
                catch (error) {
                    console.error(`Error enriching suggestion for user ${suggestion.friend_id}:`, error);
                    enrichedSuggestions.push(suggestion);
                }
            }
            return enrichedSuggestions.slice(0, 10);
        }
        catch (error) {
            console.error(`Error getting friend suggestions for userId ${userId}:`, error);
            return [];
        }
    }
    async getAllRelationshipsWithUser(currentUserId, targetUserId) {
        try {
            console.log(`getAllRelationshipsWithUser: currentUserId=${currentUserId}, targetUserId=${targetUserId}`);
            if (!mongoose_2.Types.ObjectId.isValid(currentUserId) || !mongoose_2.Types.ObjectId.isValid(targetUserId)) {
                console.error(`Invalid ObjectId format: currentUserId=${currentUserId}, targetUserId=${targetUserId}`);
                return {
                    isFriend: false,
                    friendRelation: undefined,
                    pendingIncoming: undefined,
                    sentRequest: undefined,
                };
            }
            const currentUserObjectId = new mongoose_2.Types.ObjectId(currentUserId);
            const targetUserObjectId = new mongoose_2.Types.ObjectId(targetUserId);
            console.log(`Converted ObjectIds: currentUserObjectId=${currentUserObjectId}, targetUserObjectId=${targetUserObjectId}`);
            const friendRelation = await this.friendModel.findOne({
                $or: [
                    { user_id: currentUserObjectId, friend_id: targetUserObjectId, status: 'accepted' },
                    { user_id: targetUserObjectId, friend_id: currentUserObjectId, status: 'accepted' },
                ],
            });
            console.log(`friendRelation result:`, friendRelation);
            const pendingIncoming = await this.friendModel.findOne({
                user_id: targetUserObjectId,
                friend_id: currentUserObjectId,
                status: 'pending',
            });
            console.log(`pendingIncoming result:`, pendingIncoming);
            const sentRequest = await this.friendModel.findOne({
                user_id: currentUserObjectId,
                friend_id: targetUserObjectId,
                status: 'pending',
            });
            console.log(`sentRequest result:`, sentRequest);
            const result = {
                isFriend: !!friendRelation,
                friendRelation: friendRelation || undefined,
                pendingIncoming: pendingIncoming || undefined,
                sentRequest: sentRequest || undefined,
            };
            console.log(`getAllRelationshipsWithUser final result:`, result);
            return result;
        }
        catch (error) {
            console.error(`Error getting relationships between ${currentUserId} and ${targetUserId}:`, error);
            console.error(`Error stack:`, error.stack);
            return {
                isFriend: false,
                friendRelation: undefined,
                pendingIncoming: undefined,
                sentRequest: undefined,
            };
        }
    }
};
exports.FriendRepository = FriendRepository;
exports.FriendRepository = FriendRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(friend_schema_1.Friend.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_http_client_1.UserHttpClient])
], FriendRepository);
//# sourceMappingURL=friend.repository.js.map