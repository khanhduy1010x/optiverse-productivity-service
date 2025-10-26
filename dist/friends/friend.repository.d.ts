import { Model } from 'mongoose';
import { Friend } from './friend.schema';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { UserDto } from 'src/user-dto/user.dto';
import { UserHttpClient } from 'src/http-axios/user-http.client';
interface EnrichedFriendRequest extends Friend {
    friendInfo?: {
        email: string;
        full_name?: string;
        avatar_url?: string;
    };
}
export declare class FriendRepository {
    private readonly friendModel;
    private readonly userHttpClient;
    constructor(friendModel: Model<Friend>, userHttpClient: UserHttpClient);
    getFriendsByUserID(userId: string): Promise<Friend[]>;
    createFriend(createFriendDto: CreateFriendRequest): Promise<Friend>;
    updateFriend(friend_id: string, updateFriendDto: UpdateFriendRequest): Promise<Friend>;
    deleteFriend(friend_id: string): Promise<void>;
    searchUserByEmail(email: string): Promise<UserDto | null>;
    addFriend(user_id: string, friend_id: string): Promise<Friend | null>;
    acceptFriend(id: string): Promise<Friend | null>;
    viewAllFriends(user_id: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    viewAllPending(user_id: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    viewAllSent(user_id: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    removeFriend(id: string): Promise<Friend | null>;
    cancelFriendRequest(id: string): Promise<Friend | null>;
    countAcceptedFriends(userId: string): Promise<number>;
    getFriendSuggestions(userId: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    getAllRelationshipsWithUser(currentUserId: string, targetUserId: string): Promise<{
        isFriend: boolean;
        friendRelation?: Friend;
        pendingIncoming?: Friend;
        sentRequest?: Friend;
    }>;
}
export {};
