import { Model } from 'mongoose';
import { UserInventory, UserInventoryDocument, Frame, FrameDocument } from './user-inventory.schema';
export declare class UserInventoryRepository {
    private readonly userInventoryModel;
    private readonly frameModel;
    constructor(userInventoryModel: Model<UserInventoryDocument>, frameModel: Model<FrameDocument>);
    findByUserId(userId: string): Promise<UserInventory[]>;
    create(data: Partial<UserInventory>): Promise<UserInventory>;
    findOne(filter: any): Promise<UserInventory | null>;
    createFrame(data: Partial<Frame>): Promise<Frame>;
    findAllFrames(): Promise<Frame[]>;
    findFrameById(id: string): Promise<Frame | null>;
    updateFrame(id: string, data: Partial<Frame>): Promise<Frame | null>;
    deleteFrame(id: string): Promise<Frame | null>;
    addReward(userId: string, rewardValue: string): Promise<UserInventory>;
    exchangeFrame(userId: string, frameId: string): Promise<{
        success: boolean;
        message: string;
        userInventory?: UserInventory;
    }>;
}
