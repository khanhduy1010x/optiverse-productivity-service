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

// Import or redefine the UserResponse interface
interface UserResponse {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Interface for friend user info
interface FriendUserInfo {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Interface for enriched friend request
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
      // Validate if user_id and friend_id are valid ObjectIds
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
      // Validate if user_id is a valid ObjectId
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return []; // Return empty array instead of failing
      }

      const objectId = new Types.ObjectId(user_id);

      // Find all accepted friend requests where the user is either the sender or the receiver
      const friendsAsUser = await this.friendModel
        .find({ user_id: objectId, status: 'accepted' })
        .exec();

      const friendsAsFriend = await this.friendModel
        .find({ friend_id: objectId, status: 'accepted' })
        .exec();

      // Combine both result sets
      const allFriends = [...friendsAsUser, ...friendsAsFriend];

      // If there are no friends, return an empty array
      if (!allFriends || allFriends.length === 0) {
        return [];
      }

      // Extract friend IDs from the requests
      const friendIds = allFriends.map((friend) => {
        // If user_id matches the current user, then friend_id is the friend
        // Otherwise, user_id is the friend
        return friend.user_id.toString() === user_id
          ? friend.friend_id.toString()
          : friend.user_id.toString();
      });

      try {
        // Get user information for all friend IDs
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(friendIds);
        console.log('User details for friends:', userDetails);

        // Enrich the friends with user information
        const enrichedFriends = allFriends.map((friend) => {
          // Determine which ID represents the friend
          const friendId =
            friend.user_id.toString() === user_id
              ? friend.friend_id.toString()
              : friend.user_id.toString();

          // Find the matching user details
          const userDetail = userDetails?.find(
            (user) => user.user_id === friendId,
          );

          // Create a new object with all the properties of the original friend
          const enrichedFriend = friend.toObject() as EnrichedFriendRequest;

          // Add user details if found
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
        // If we can't fetch user details, just return the original friends
        return allFriends;
      }
    } catch (error) {
      console.error(`Error in viewAllFriends for user_id ${user_id}:`, error);
      return []; // Return empty array on error
    }
  }

  async viewAllPending(
    user_id: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      // Validate if user_id is a valid ObjectId
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return []; // Return empty array instead of failing
      }

      // Find all pending friend requests
      const pendingRequests = await this.friendModel
        .find({ friend_id: new Types.ObjectId(user_id), status: 'pending' })
        .exec();

      // If there are no pending requests, return an empty array
      if (!pendingRequests || pendingRequests.length === 0) {
        return [];
      }

      // Extract user IDs from the requests
      const userIds = pendingRequests.map((request) =>
        request.user_id.toString(),
      );

      try {
        // Get user information for all user IDs
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(userIds);
        console.log('User details for pending requests:', userDetails);

        // Enrich the pending requests with user information
        const enrichedRequests = pendingRequests.map((request) => {
          // Find the matching user details
          const userDetail = userDetails?.find(
            (user) => user.user_id === request.user_id.toString(),
          );

          // Create a new object with all the properties of the original request
          const enrichedRequest = request.toObject() as EnrichedFriendRequest;

          // Add user details if found
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
        // If we can't fetch user details, just return the original requests
        return pendingRequests;
      }
    } catch (error) {
      console.error(`Error in viewAllPending for user_id ${user_id}:`, error);
      return []; // Return empty array on error
    }
  }

  async viewAllSent(
    user_id: string,
  ): Promise<(Friend | EnrichedFriendRequest)[]> {
    try {
      // Validate if user_id is a valid ObjectId
      if (!Types.ObjectId.isValid(user_id)) {
        console.error(`Invalid ObjectId format for user_id: ${user_id}`);
        return []; // Return empty array instead of failing
      }

      // Find all sent friend requests
      const sentRequests = await this.friendModel
        .find({ user_id: new Types.ObjectId(user_id), status: 'pending' })
        .exec();

      // If there are no sent requests, return an empty array
      if (!sentRequests || sentRequests.length === 0) {
        return [];
      }

      // Extract friend IDs from the requests
      const friendIds = sentRequests.map((request) =>
        request.friend_id.toString(),
      );

      try {
        // Get user information for all friend IDs
        const userDetails: UserResponse[] =
          await this.userHttpClient.getUsersByIds(friendIds);
        console.log(userDetails);

        // Enrich the friend requests with user information
        const enrichedRequests = sentRequests.map((request) => {
          // Find the matching user details
          const userDetail = userDetails?.find(
            (user) => user.user_id === request.friend_id.toString(),
          );

          // Create a new object with all the properties of the original request
          const enrichedRequest = request.toObject() as EnrichedFriendRequest;

          // Add user details if found
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
        // If we can't fetch user details, just return the original requests
        return sentRequests;
      }
    } catch (error) {
      console.error(`Error in viewAllSent for user_id ${user_id}:`, error);
      return []; // Return empty array on error
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

      // Count friends where the user is either the sender or receiver
      const friendsAsUserCount = await this.friendModel
        .countDocuments({ user_id: objectId, status: 'accepted' })
        .exec();

      const friendsAsFriendCount = await this.friendModel
        .countDocuments({ friend_id: objectId, status: 'accepted' })
        .exec();

      // Return the total count
      return friendsAsUserCount + friendsAsFriendCount;
    } catch (error) {
      console.error(`Error counting friends for userId ${userId}:`, error);
      return 0;
    }
  }
}
