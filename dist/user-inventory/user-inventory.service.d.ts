import { UserInventoryRepository } from './user-inventory.repository';
import { UserInventory, Frame } from './user-inventory.schema';
export declare class UserInventoryService {
    private readonly repo;
    constructor(repo: UserInventoryRepository);
    findByUserId(userId: string): Promise<UserInventory[]>;
    create(data: Partial<UserInventory>): Promise<UserInventory>;
    createFrame(data: Partial<Frame>): Promise<Frame>;
    getAllFrames(): Promise<Frame[]>;
    getFrameById(id: string): Promise<Frame | null>;
    updateFrame(id: string, data: Partial<Frame>): Promise<Frame | null>;
    deleteFrame(id: string): Promise<Frame | null>;
    addReward(userId: string, rewardValue: string): Promise<UserInventory>;
    exchangeFrame(userId: string, frameId: string): Promise<{
        success: boolean;
        message: string;
        userInventory?: UserInventory;
    }>;
}
