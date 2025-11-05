import { Injectable } from '@nestjs/common';
import { UserInventoryRepository } from './user-inventory.repository';
import { UserInventory, Frame } from './user-inventory.schema';

@Injectable()
export class UserInventoryService {
  constructor(private readonly repo: UserInventoryRepository) {}

  async findByUserId(userId: string): Promise<UserInventory[]> {
    return this.repo.findByUserId(userId);
  }

  async create(data: Partial<UserInventory>): Promise<UserInventory> {
    // Kiểm tra đã tồn tại chưa
    const { user_id, op, frame } = data;
    const existed = await this.repo.findOne({ user_id, op, frame });
    if (existed) {
      return existed;
    }
    return this.repo.create(data);
  }

  // Frame service methods
  async createFrame(data: Partial<Frame>): Promise<Frame> {
    return this.repo.createFrame(data);
  }

  async getAllFrames(): Promise<Frame[]> {
    return this.repo.findAllFrames();
  }

  async getFrameById(id: string): Promise<Frame | null> {
    return this.repo.findFrameById(id);
  }

  async updateFrame(id: string, data: Partial<Frame>): Promise<Frame | null> {
    return this.repo.updateFrame(id, data);
  }

  async deleteFrame(id: string): Promise<Frame | null> {
    return this.repo.deleteFrame(id);
  }

  async addReward(userId: string, rewardValue: string): Promise<UserInventory> {
    return this.repo.addReward(userId, rewardValue);
  }

  async getUserFrames(
    userId: string,
  ): Promise<{ frames: Frame[]; activeFrame?: string; userPoints: number }> {
    return this.repo.getUserFrames(userId);
  }

  async setActiveFrame(
    userId: string,
    frameId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.repo.setActiveFrame(userId, frameId);
  }

  async exchangeFrame(
    userId: string,
    frameId: string,
  ): Promise<{
    success: boolean;
    message: string;
    userInventory?: UserInventory;
  }> {
    return this.repo.exchangeFrame(userId, frameId);
  }

  /**
   * Add OP credits to user inventory
   */
  async addOpCredits(userId: string, amount: number): Promise<UserInventory> {
    return this.repo.addOpCredits(userId, amount);
  }
}
