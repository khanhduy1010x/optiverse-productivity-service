import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserInventory,
  UserInventoryDocument,
  Frame,
  FrameDocument,
} from './user-inventory.schema';

@Injectable()
export class UserInventoryRepository {
  constructor(
    @InjectModel(UserInventory.name)
    private readonly userInventoryModel: Model<UserInventoryDocument>,
    @InjectModel(Frame.name) private readonly frameModel: Model<FrameDocument>,
  ) {}

  async findByUserId(userId: string): Promise<UserInventory[]> {
    return this.userInventoryModel.find({ user_id: userId }).exec();
  }

  async create(data: Partial<UserInventory>): Promise<UserInventory> {
    const created = new this.userInventoryModel(data);
    return created.save();
  }

  async findOne(filter: any): Promise<UserInventory | null> {
    return this.userInventoryModel.findOne(filter).exec();
  }

  // Frame methods
  async createFrame(data: Partial<Frame>): Promise<Frame> {
    const created = new this.frameModel(data);
    return created.save();
  }

  async findAllFrames(): Promise<Frame[]> {
    return this.frameModel.find().exec();
  }

  async findFrameById(id: string): Promise<Frame | null> {
    return this.frameModel.findById(id).exec();
  }

  async updateFrame(id: string, data: Partial<Frame>): Promise<Frame | null> {
    return this.frameModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteFrame(id: string): Promise<Frame | null> {
    return this.frameModel.findByIdAndDelete(id).exec();
  }

  async addReward(userId: string, rewardValue: string): Promise<UserInventory> {
    // Tìm xem đã có record điểm chưa (op là số điểm hiện có)
    const existingRecord = await this.userInventoryModel
      .findOne({
        user_id: userId,
        op: { $regex: /^\d+$/ }, // Tìm record có op là số
      })
      .exec();

    if (existingRecord) {
      // Nếu đã có, cộng thêm điểm vào op
      const currentPoints = parseInt(existingRecord.op);
      const additionalPoints = parseInt(rewardValue);
      existingRecord.op = (currentPoints + additionalPoints).toString();
      // Thêm timestamp vào frame để track lịch sử nhận reward
      existingRecord.frame.push(new Date().toISOString());
      return existingRecord.save();
    } else {
      const newRecord = new this.userInventoryModel({
        user_id: userId,
        op: rewardValue,
      });
      return newRecord.save();
    }
  }

  async getUserFrames(
    userId: string,
  ): Promise<{ frames: Frame[]; activeFrame?: string; userPoints: number }> {
    // Tìm user inventory
    const userInventory = await this.userInventoryModel
      .findOne({
        user_id: userId,
        op: { $regex: /^\d+$/ }, // Tìm record có op là số điểm
      })
      .exec();

    if (!userInventory) {
      return { frames: [], userPoints: 0 };
    }

    // Lấy danh sách frame IDs mà user sở hữu
    const frameIds = userInventory.frame.filter(
      (frameId) => frameId.length === 24,
    ); // Filter valid ObjectIds

    // Lấy thông tin chi tiết của các frame
    const frames = await this.frameModel
      .find({ _id: { $in: frameIds } })
      .exec();

    return {
      frames,
      activeFrame: userInventory.active_frame,
      userPoints: parseInt(userInventory.op),
    };
  }

  async setActiveFrame(
    userId: string,
    frameId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Tìm user inventory
    const userInventory = await this.userInventoryModel
      .findOne({
        user_id: userId,
        op: { $regex: /^\d+$/ },
      })
      .exec();

    if (!userInventory) {
      return { success: false, message: 'User inventory không tồn tại' };
    }

    // Kiểm tra user có sở hữu frame này không
    if (!userInventory.frame.includes(frameId)) {
      return { success: false, message: 'Bạn không sở hữu frame này' };
    }

    // Cập nhật active frame
    userInventory.active_frame = frameId;
    await userInventory.save();

    return { success: true, message: 'Đã cập nhật frame active thành công' };
  }

  async exchangeFrame(
    userId: string,
    frameId: string,
  ): Promise<{
    success: boolean;
    message: string;
    userInventory?: UserInventory;
  }> {
    // Tìm frame để biết cost
    const frame = await this.frameModel.findById(frameId).exec();
    if (!frame) {
      return { success: false, message: 'Frame không tồn tại' };
    }

    // Tìm user inventory với điểm (op là số)
    const userInventory = await this.userInventoryModel
      .findOne({
        user_id: userId,
        op: { $regex: /^\d+$/ }, // Tìm record có op là số điểm
      })
      .exec();

    if (!userInventory) {
      return { success: false, message: 'Bạn không có điểm loại này' };
    }

    // Kiểm tra xem đã sở hữu frame này chưa
    if (userInventory.frame.includes(frameId)) {
      return {
        success: false,
        message: `Bạn đã sở hữu frame "${frame.title}" rồi!`,
      };
    }

    // Kiểm tra đủ điểm không (số điểm = giá trị op)
    const currentPoints = parseInt(userInventory.op);
    if (currentPoints < frame.cost) {
      return {
        success: false,
        message: `Không đủ điểm. Cần ${frame.cost} điểm, hiện có ${currentPoints} điểm`,
      };
    }

    // Trừ điểm bằng cách cập nhật giá trị op
    const newPoints = currentPoints - frame.cost;
    userInventory.op = newPoints.toString();

    // Thêm frameId vào frame array để track frame đã đổi
    userInventory.frame.push(frameId);

    // Lưu lại user inventory đã trừ điểm và thêm frame
    const updatedInventory = await userInventory.save();

    return {
      success: true,
      message: `Đổi frame "${frame.title}" thành công! Đã trừ ${frame.cost} điểm.`,
      userInventory: updatedInventory,
    };
  }

  /**
   * Add OP credits to user inventory
   * If inventory exists, increment OP, otherwise create new
   */
  async addOpCredits(userId: string, amount: number): Promise<UserInventory> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Try to find existing OP record
    const existingRecord = await this.userInventoryModel
      .findOne({
        user_id: userId,
        op: { $regex: /^\d+$/ }, // Find record with numeric OP
      })
      .exec();

    if (existingRecord) {
      // If exists, increment OP
      const currentOp = parseInt(existingRecord.op);
      existingRecord.op = (currentOp + amount).toString();
      return existingRecord.save();
    } else {
      // If not exists, create new record
      const newRecord = new this.userInventoryModel({
        user_id: userId,
        op: amount.toString(),
        frame: [],
        active_frame: null,
      });
      return newRecord.save();
    }
  }
}
