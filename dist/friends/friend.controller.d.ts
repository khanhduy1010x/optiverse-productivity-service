import { FriendService } from './friend.service';
import { ApiResponse } from 'src/common/api-response';
import { FriendResponse } from './dto/response/FriendResponse.dto';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { Friend } from './friend.schema';
interface FriendUserInfo {
    email: string;
    full_name?: string;
    avatar_url?: string;
}
interface EnrichedFriendRequest extends Omit<Friend, 'toObject'> {
    friendInfo?: FriendUserInfo;
    [key: string]: any;
}
export declare class FriendController {
    private readonly friendService;
    constructor(friendService: FriendService);
    getFriendsByUserID(userId: string): Promise<ApiResponse<Friend[]>>;
    createFriend(createFriendDto: CreateFriendRequest): Promise<ApiResponse<FriendResponse>>;
    updateFriend(friendId: string, updateFriendDto: UpdateFriendRequest): Promise<ApiResponse<FriendResponse>>;
    deleteFriend(friendId: string): Promise<ApiResponse<void>>;
    searchUserByEmail(email: string, req: any): Promise<ApiResponse<any>>;
    addFriend(req: any, friendId: string): Promise<ApiResponse<Friend>>;
    acceptFriend(id: string): Promise<ApiResponse<Friend>>;
    viewAllPending(req: any): Promise<ApiResponse<(Friend | EnrichedFriendRequest)[]>>;
    viewAllSent(req: any): Promise<ApiResponse<(Friend | EnrichedFriendRequest)[]>>;
    viewAllFriends(userId: string): Promise<ApiResponse<(Friend | EnrichedFriendRequest)[]>>;
    removeFriend(id: string): Promise<ApiResponse<Friend>>;
    cancelFriendRequest(id: string): Promise<ApiResponse<Friend>>;
    viewAllFriendForUser(req: any): Promise<ApiResponse<(Friend | EnrichedFriendRequest)[]>>;
    getFriendSuggestions(req: any): Promise<ApiResponse<(Friend | EnrichedFriendRequest)[]>>;
    getAllRelationshipsWithUser(req: any, targetUserId: string): Promise<ApiResponse<{
        isFriend: boolean;
        friendRelation?: Friend;
        pendingIncoming?: Friend;
        sentRequest?: Friend;
    }>>;
}
export {};
