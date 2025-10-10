import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from './friend.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { UserDto } from 'src/user-dto/user.dto';
import { UserHttpClient } from 'src/http-axios/user-http.client';

interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface FriendUserInfo {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface EnrichedFriendRequest extends Friend {
  friendInfo?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

@Injectable()
export class FriendRepository {
  constructor(
    @InjectModel(Friend.name) private readonly friendModel: Model<Friend>,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  async getFriendsByUserID(userId: string): Promise<Friend[]> {
    return await this.friendModel
      .find({ user_id: new Types.ObjectId(userId) })
      .exec();
  }

  async createFriend(createFriendDto: CreateFriendRequest): Promise<Friend> {
    console.log('lllllll' + createFriendDto.user_id);
    const newFriend = new this.friendModel({
      ...createFriendDto,
      user_id: new Types.ObjectId(createFriendDto.user_id),
      friend_id: new Types.ObjectId(createFriendDto.friend_id),
    });
    return await newFriend.save();
  }

  async updateFriend(
    friend_id: string,
    updateFriendDto: UpdateFriendRequest,
  ): Promise<Friend> {
    return await this.friendModel
      .findByIdAndUpdate(friend_id, updateFriendDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteFriend(friend_id: string): Promise<void> {
    const result = await this.friendModel.deleteOne({ _id: friend_id }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async searchUserByEmail(email: string): Promise<UserDto | null> {
    const response = await this.userHttpClient.getUser(email);
    console.log(response);
    if (response) {
      return response as UserDto;
    } else {
      console.log('User not found');
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async addFriend(user_id: string, friend_id: string): Promise<Friend | null> {
    try {
      if (
        !Types.ObjectId.isValid(user_id) ||
        !Types.ObjectId.isValid(friend_id)
      ) {
        console.error(
          `Invalid ObjectId format - user_id: ${user_id}, friend_id: ${friend_id}`,
        );
        return null;
      }

      return this.friendModel.create({
        user_id: new Types.ObjectId(user_id),
        friend_id: new Types.ObjectId(friend_id),
        status: 'pending',
      });
    } catch (error) {
      console.error(
        `Error in addFriend - user_id: ${user_id}, friend_id: ${friend_id}:`,
        error,
      );
      return null;
    }
  }

  async acceptFriend(id: string): Promise<Friend | null> {
    return this.friendModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        { status: 'accepted' },
        { new: true },
      )
      .exec();
  }

  async viewAllFriends(
    user_id: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return [];
      }

      const objectId = new Types.ObjectId(user_id);

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
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(friendIds);

        const enrichedFriends = allFriends.map((friend) => {
          const isCurrentUserInFriendPosition =
            friend.friend_id.toString() === user_id;

          const enrichedFriend = friend.toObject() as EnrichedFriendRequest;

          const friendId = isCurrentUserInFriendPosition
            ? friend.user_id.toString()
            : friend.friend_id.toString();

          const userDetail = userDetails?.find(
            (user) => user.user_id === friendId,
          );

          if (isCurrentUserInFriendPosition) {
            const originalUserId = enrichedFriend.user_id;
            const originalFriendId = enrichedFriend.friend_id;

            enrichedFriend.user_id = originalFriendId;
            enrichedFriend.friend_id = originalUserId;

            // enrichedFriend.normalized = true;
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
      } catch (error) {
        console.error(`Error fetching user details for friends: ${error}`);

        return allFriends;
      }
    } catch (error) {
      console.error(`Error in viewAllFriends for user_id ${user_id}:`, error);
      return [];
    }
  }

  async viewAllPending(
    user_id: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return [];
      }

      const pendingRequests = await this.friendModel
        .find({ friend_id: new Types.ObjectId(user_id), status: 'pending' })
        .exec();

      if (!pendingRequests || pendingRequests.length === 0) {
        return [];
      }

      const userIds = pendingRequests.map((request) =>
        request.user_id.toString(),
      );

      try {
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(userIds);
        console.log('User details for pending requests:', userDetails);

        const enrichedRequests = pendingRequests.map((request) => {
          const userDetail = userDetails?.find(
            (user) => user.user_id === request.user_id.toString(),
          );

          const enrichedRequest = request.toObject() as EnrichedFriendRequest;

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
      } catch (error) {
        console.error(
          `Error fetching user details for pending requests: ${error}`,
        );

        return pendingRequests;
      }
    } catch (error) {
      console.error(`Error in viewAllPending for user_id ${user_id}:`, error);
      return [];
    }
  }

  async viewAllSent(
    user_id: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return [];
      }

      const sentRequests = await this.friendModel
        .find({ user_id: new Types.ObjectId(user_id), status: 'pending' })
        .exec();

      if (!sentRequests || sentRequests.length === 0) {
        return [];
      }

      const friendIds = sentRequests.map((request) =>
        request.friend_id.toString(),
      );

      try {
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(friendIds);
        console.log(userDetails);

        const enrichedRequests = sentRequests.map((request) => {
          const userDetail = userDetails?.find(
            (user) => user.user_id === request.friend_id.toString(),
          );

          const enrichedRequest = request.toObject() as EnrichedFriendRequest;

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
      } catch (error) {
        console.error(
          `Error fetching user details for sent requests: ${error}`,
        );

        return sentRequests;
      }
    } catch (error) {
      console.error(`Error in viewAllSent for user_id ${user_id}:`, error);
      return [];
    }
  }

  async removeFriend(id: string): Promise<Friend | null> {
    return this.friendModel.findOneAndDelete({ _id: id }).exec();
  }

  async cancelFriendRequest(id: string): Promise<Friend | null> {
    return this.friendModel
      .findOneAndDelete({ _id: id, status: 'pending' })
      .exec();
  }

  /**
   * Count the total number of accepted friends for a user
   * @param userId User ID to count friends for
   * @returns The total count of accepted friends
   */
  async countAcceptedFriends(userId: string): Promise<number> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        console.error(`Invalid ObjectId format for userId: ${userId}`);
        return 0;
      }

      const objectId = new Types.ObjectId(userId);

      const friendsAsUserCount = await this.friendModel
        .countDocuments({ user_id: objectId, status: 'accepted' })
        .exec();

      const friendsAsFriendCount = await this.friendModel
        .countDocuments({ friend_id: objectId, status: 'accepted' })
        .exec();

      return friendsAsUserCount + friendsAsFriendCount;
    } catch (error) {
      console.error(`Error counting friends for userId ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get friend suggestions for a user (friends of friends)
   * @param userId User ID to get suggestions for
   * @returns Array of suggested users with their info
   */
  async getFriendSuggestions(
    userId: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        console.error(`Invalid ObjectId format for userId: ${userId}`);
        return [];
      }

      const objectId = new Types.ObjectId(userId);

      // Lấy tất cả bạn bè của user hiện tại
      const userFriends = await this.friendModel
        .find({
          $or: [
            { user_id: objectId, status: 'accepted' },
            { friend_id: objectId, status: 'accepted' },
          ],
        })
        .exec();
      // Lấy danh sách ID của tất cả bạn bè
      const friendIds = userFriends.map((friend) => {
        return friend.user_id.toString() === userId
          ? friend.friend_id
          : friend.user_id;
      });
      // Lấy tất cả bạn bè của những người bạn (friends of friends)
      const friendsOfFriends = await this.friendModel
        .find({
          $or: [
            { user_id: { $in: friendIds }, status: 'accepted' },
            { friend_id: { $in: friendIds }, status: 'accepted' },
          ],
        })
        .exec();
      // Lọc ra những người không phải là bạn bè hiện tại và không phải chính user
      const suggestions = new Map<string, Friend>();
      const currentFriendIds = new Set([
        userId,
        ...friendIds.map((id) => id.toString()),
      ]);

      // Lấy tất cả yêu cầu kết bạn hiện tại để loại bỏ
      const existingRequests = await this.friendModel
        .find({
          $or: [
            { user_id: objectId },
            { friend_id: objectId },
          ],
        })
        .exec();

      const existingRequestIds = new Set(
        existingRequests.map((req) => {
          return req.user_id.toString() === userId
            ? req.friend_id.toString()
            : req.user_id.toString();
        }),
      );

      for (const friend of friendsOfFriends) {
        const suggestedUserId =
          friend.user_id.toString() === userId ||
          friendIds.some((id) => id.toString() === friend.user_id.toString())
            ? friend.friend_id.toString()
            : friend.user_id.toString();

        // Kiểm tra xem người này có phải là bạn bè hiện tại hoặc chính user không
        if (
          !currentFriendIds.has(suggestedUserId) &&
          !existingRequestIds.has(suggestedUserId)
        ) {
          suggestions.set(suggestedUserId, friend);
        }
      }

      // Chuyển đổi Map thành array và enrich với thông tin user
      const suggestionArray = Array.from(suggestions.values());
      const enrichedSuggestions: (Friend | EnrichedFriendRequest)[] = [];

      for (const suggestion of suggestionArray) {
        try {
          const suggestedUserId =
            suggestion.user_id.toString() === userId ||
            friendIds.some(
              (id) => id.toString() === suggestion.user_id.toString(),
            )
              ? suggestion.friend_id.toString()
              : suggestion.user_id.toString();

          const userInfos = await this.userHttpClient.getUsersByIds([
            suggestedUserId,
          ]);

          if (userInfos && userInfos.length > 0) {
            const userInfo = userInfos[0];
            const suggestionObj = suggestion instanceof Object && 'toObject' in suggestion 
              ? (suggestion as any).toObject() 
              : JSON.parse(JSON.stringify(suggestion));
            
            const enrichedSuggestion: EnrichedFriendRequest = {
              ...suggestionObj,
              friendInfo: {
                email: userInfo.email,
                full_name: userInfo.full_name,
                avatar_url: userInfo.avatar_url,
              },
            };
            enrichedSuggestions.push(enrichedSuggestion);
          }
        } catch (error) {
          console.error(
            `Error enriching suggestion for user ${suggestion.friend_id}:`,
            error,
          );
          // Vẫn thêm suggestion mà không có thông tin user
          enrichedSuggestions.push(suggestion);
        }
      }

      // Giới hạn số lượng gợi ý (ví dụ: 10 người)
      return enrichedSuggestions.slice(0, 10);
    } catch (error) {
      console.error(`Error getting friend suggestions for userId ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all relationships with a specific user
   * @param currentUserId Current user ID
   * @param targetUserId Target user ID to check relationships with
   * @returns Object containing relationship status and details
   */
  async getAllRelationshipsWithUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<{
    isFriend: boolean;
    friendRelation?: Friend;
    pendingIncoming?: Friend;
    sentRequest?: Friend;
  }> {
    try {
      console.log(`getAllRelationshipsWithUser: currentUserId=${currentUserId}, targetUserId=${targetUserId}`);
      
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(currentUserId) || !Types.ObjectId.isValid(targetUserId)) {
        console.error(`Invalid ObjectId format: currentUserId=${currentUserId}, targetUserId=${targetUserId}`);
        return {
          isFriend: false,
          friendRelation: undefined,
          pendingIncoming: undefined,
          sentRequest: undefined,
        };
      }

      // Convert to ObjectId for database queries
      const currentUserObjectId = new Types.ObjectId(currentUserId);
      const targetUserObjectId = new Types.ObjectId(targetUserId);

      console.log(`Converted ObjectIds: currentUserObjectId=${currentUserObjectId}, targetUserObjectId=${targetUserObjectId}`);

      // Check if they are friends (accepted relationship)
      const friendRelation = await this.friendModel.findOne({
        $or: [
          { user_id: currentUserObjectId, friend_id: targetUserObjectId, status: 'accepted' },
          { user_id: targetUserObjectId, friend_id: currentUserObjectId, status: 'accepted' },
        ],
      });

      console.log(`friendRelation result:`, friendRelation);

      // Check for pending incoming request (target user sent request to current user)
      const pendingIncoming = await this.friendModel.findOne({
        user_id: targetUserObjectId,
        friend_id: currentUserObjectId,
        status: 'pending',
      });

      console.log(`pendingIncoming result:`, pendingIncoming);

      // Check for sent request (current user sent request to target user)
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
    } catch (error) {
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
}
