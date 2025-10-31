import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LiveRoom, LiveRoomDocument } from './schemas/live-room.schema';

@Injectable()
export class LiveRoomRepository {
  constructor(
    @InjectModel(LiveRoom.name) private liveRoomModel: Model<LiveRoomDocument>,
  ) {}

  async create(data: Partial<LiveRoom>): Promise<LiveRoomDocument> {
    const liveRoom = new this.liveRoomModel(data);
    return liveRoom.save();
  }

  async findById(
    id: string | Types.ObjectId,
  ): Promise<LiveRoomDocument | null> {
    return this.liveRoomModel.findById(id).exec();
  }

  async findByRoomSid(roomSid: string): Promise<LiveRoomDocument | null> {
    return this.liveRoomModel.findOne({ room_sid: roomSid }).exec();
  }

  async findByWorkspaceId(
    workspaceId: string | Types.ObjectId,
  ): Promise<LiveRoomDocument[]> {
    return this.liveRoomModel
      .find({ workspace_id: new Types.ObjectId(workspaceId) })
      .exec();
  }

  async findByHostId(
    hostId: string | Types.ObjectId,
  ): Promise<LiveRoomDocument[]> {
    return this.liveRoomModel.find({ host_id: hostId }).exec();
  }

  async update(
    id: string | Types.ObjectId,
    data: Partial<LiveRoom>,
  ): Promise<LiveRoomDocument | null> {
    return this.liveRoomModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<void> {
    await this.liveRoomModel.findByIdAndDelete(id).exec();
  }

  async updateRoomSid(
    roomId: string | Types.ObjectId,
    roomSid: string,
  ): Promise<LiveRoomDocument | null> {
    return this.liveRoomModel
      .findByIdAndUpdate(roomId, { room_sid: roomSid }, { new: true })
      .exec();
  }
}
