import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Streak } from './streak.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateStreakRequest } from './dto/request/CreateStreakRequest.dto';
import { UpdateStreakRequest } from './dto/request/UpdateStreakRequest.dto';

@Injectable()
export class StreakRepository {
  constructor(@InjectModel(Streak.name) private readonly streakModel: Model<Streak>) {}

  async getStreakByUserID(userId: string): Promise<Streak | null> {
    return await this.streakModel
      .findOne({ user_id: new Types.ObjectId(userId) })
      .exec();
  }

  async getStreakByID(streakId: string): Promise<Streak> {
    return await this.streakModel
      .findById(new Types.ObjectId(streakId))
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async createStreak(userId: string, createStreakDto: CreateStreakRequest): Promise<Streak> {
    const newStreak = new this.streakModel({
      ...createStreakDto,
      user_id: new Types.ObjectId(userId),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await newStreak.save();
  }

  async updateStreak(streakId: string, updateStreakDto: UpdateStreakRequest): Promise<Streak> {
    return await this.streakModel
      .findByIdAndUpdate(new Types.ObjectId(streakId), updateStreakDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateStreakByUserId(userId: string, updateStreakDto: UpdateStreakRequest): Promise<Streak> {
    return await this.streakModel
      .findOneAndUpdate({ user_id: new Types.ObjectId(userId) }, updateStreakDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteStreak(streakId: string): Promise<Streak> {
    const streak = await this.streakModel.findByIdAndDelete(streakId).exec();
    if (!streak) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return streak;
  }
} 