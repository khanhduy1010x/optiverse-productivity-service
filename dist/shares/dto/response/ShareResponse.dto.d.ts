import { Share, SharedUser } from '../../share.schema';
export declare class SharedUserResponse {
    user_id: string;
    permission: string;
    shared_at: Date;
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
