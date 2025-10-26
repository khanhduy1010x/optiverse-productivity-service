import { Share, SharedUser } from '../../share.schema';
export declare class UserInfoDto {
    id: string;
    name?: string;
    email: string;
    avatar_url?: string;
}
export declare class SharedUserResponse {
    user_id: string;
    permission: string;
    shared_at: Date;
    user_info?: UserInfoDto | null;
    constructor(sharedUser: SharedUser);
}
export declare class ShareResponse {
    id: string;
    owner_id: string;
    resource_type: string;
    resource_id: string;
    shared_with: SharedUserResponse[];
    createdAt: Date;
    updatedAt: Date;
    constructor(share: Share);
}
