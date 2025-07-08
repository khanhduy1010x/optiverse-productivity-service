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
}
