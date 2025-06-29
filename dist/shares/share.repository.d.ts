import { Model } from 'mongoose';
import { Share, ShareDocument } from './share.schema';
export declare class ShareRepository {
    private shareModel;
    constructor(shareModel: Model<ShareDocument>);
    findShareByResourceId(resourceType: string, resourceId: string): Promise<Share | null>;
    createShare(ownerId: string, resourceType: string, resourceId: string, users: {
        user_id: string;
        permission: string;
    }[]): Promise<Share>;
    updateShare(shareId: string, users: {
        user_id: string;
        permission: string;
    }[]): Promise<Share | null>;
    addUsersToShare(shareId: string, users: {
        user_id: string;
        permission: string;
    }[]): Promise<Share | null>;
    removeUserFromShare(shareId: string, userId: string): Promise<Share | null>;
    deleteShare(shareId: string): Promise<void>;
    getSharesSharedWithUser(userId: string): Promise<Share[]>;
    getSharesByOwnerId(ownerId: string): Promise<Share[]>;
    findShareByResourceIdAndUserId(resourceType: string, resourceId: string, userId: string): Promise<Share | null>;
}
