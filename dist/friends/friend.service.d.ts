import { FriendRepository } from './friend.repository';
import { Friend } from './friend.schema';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { FriendResponse } from './dto/response/FriendResponse.dto';
import { UserDto } from 'src/user-dto/user.dto';
interface FriendUserInfo {
    email: string;
    full_name?: string;
    avatar_url?: string;
}
interface EnrichedFriendRequest extends Omit<Friend, 'toObject'> {
    friendInfo?: FriendUserInfo;
    [key: string]: any;
}
export declare class FriendService {
    private readonly friendRepository;
    constructor(friendRepository: FriendRepository);
    getFriendsByUserID(userId: string): Promise<Friend[]>;
    createFriend(createFriendDto: CreateFriendRequest): Promise<FriendResponse>;
    updateFriend(friendId: string, updateFriendDto: UpdateFriendRequest): Promise<FriendResponse>;
    deleteFriend(friendId: string): Promise<void>;
    searchUserByEmail(email: string): Promise<UserDto | null>;
    addFriend(userId: string, friendId: string): Promise<Friend | null>;
    acceptFriend(id: string): Promise<Friend | null>;
    viewAllFriends(userId: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    viewAllPending(userId: string): Promise<(Friend | EnrichedFriendRequest)[]>;
    viewAllSent(userId: string): Promise<(Friend | EnrichedFriendRequest)[]>;
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
