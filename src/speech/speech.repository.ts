import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SpeechMessage } from '../focus-room/schemas/live-room-speech-message.schema';

@Injectable()
export class SpeechRepository {
  constructor(
    @InjectModel(SpeechMessage.name)
    private readonly speechModel: Model<SpeechMessage>,
  ) {}

  async getMessagesByRoomId(roomId: string): Promise<SpeechMessage[]> {
    return await this.speechModel
      .find({ room_id: new Types.ObjectId(roomId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getMessagesByRoomIdPaginated(
    roomId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<{ data: SpeechMessage[]; total: number }> {
    const data = await this.speechModel
      .find({ room_id: new Types.ObjectId(roomId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await this.speechModel.countDocuments({
      room_id: new Types.ObjectId(roomId),
    });

    return { data, total };
  }
}
