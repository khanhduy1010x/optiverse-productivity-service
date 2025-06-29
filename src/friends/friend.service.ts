import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.schema';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { FriendResponse } from './dto/response/FriendResponse.dto';
import { UserDto } from 'src/user-dto/user.dto';

// Import the interface from repository or re-declare it
interface FriendUserInfo {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface EnrichedFriendRequest extends Omit<Friend, 'toObject'> {
  friendInfo?: FriendUserInfo;
  [key: string]: any;
}

@Injectable()
export class FriendService {
  constructor(private readonly friendRepository: FriendRepository) {}

  async getFriendsByUserID(userId: string): Promise<Friend[]> {
    return await this.friendRepository.getFriendsByUserID(userId);
  }

  async createFriend(createFriendDto: CreateFriendRequest): Promise<FriendResponse> {
    const friend = await this.friendRepository.createFriend(createFriendDto);
    return new FriendResponse(friend);
  }

  async updateFriend(
    friendId: string,
    updateFriendDto: UpdateFriendRequest,
  ): Promise<FriendResponse> {
    const friend = await this.friendRepository.updateFriend(friendId, updateFriendDto);
    return new FriendResponse(friend);
  }

  async deleteFriend(friendId: string): Promise<void> {
    return await this.friendRepository.deleteFriend(friendId);
  }

  async searchUserByEmail(email: string): Promise<UserDto | null> {
    return this.friendRepository.searchUserByEmail(email);
  }

  async addFriend(userId: string, friendId: string): Promise<Friend | null> {
    return this.friendRepository.addFriend(userId, friendId);
  }

  async acceptFriend(id: string): Promise<Friend | null> {
    return this.friendRepository.acceptFriend(id);
  }

  async viewAllFriends(userId: string): Promise<(Friend | EnrichedFriendRequest)[]> {
    return this.friendRepository.viewAllFriends(userId);
  }

  async viewAllPending(userId: string): Promise<(Friend | EnrichedFriendRequest)[]> {
    return this.friendRepository.viewAllPending(userId);
  }

  async viewAllSent(userId: string): Promise<(Friend | EnrichedFriendRequest)[]> {
    return this.friendRepository.viewAllSent(userId);
  }

  async removeFriend(id: string): Promise<Friend | null> {
    return this.friendRepository.removeFriend(id);
  }

  async cancelFriendRequest(id: string): Promise<Friend | null> {
    return this.friendRepository.cancelFriendRequest(id);
  }

  /**
   * Count the total number of accepted friends for a user
   * @param userId User ID to count friends for
   * @returns The total count of accepted friends
   */
  async countAcceptedFriends(userId: string): Promise<number> {
    return this.friendRepository.countAcceptedFriends(userId);
  }
}
