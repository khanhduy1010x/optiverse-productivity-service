import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAchievement } from './user-achievement.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateUserAchievementRequest } from './dto/request/CreateUserAchievementRequest.dto';
import { UpdateUserAchievementRequest } from './dto/request/UpdateUserAchievementRequest.dto';

@Injectable()
export class UserAchievementRepository {
  constructor(
    @InjectModel(UserAchievement.name) private readonly userAchievementModel: Model<UserAchievement>,
  ) {}

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('achievement_id')
      .exec();
  }

  async findById(id: string): Promise<UserAchievement> {
    return this.userAchievementModel
      .findById(new Types.ObjectId(id))
      .populate('achievement_id')
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async checkUserHasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const count = await this.userAchievementModel.countDocuments({
      user_id: new Types.ObjectId(userId),
      achievement_id: new Types.ObjectId(achievementId),
    }).exec();
    
    return count > 0;
  }

  async createUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const newUserAchievement = new this.userAchievementModel({
      user_id: new Types.ObjectId(userId),
      achievement_id: new Types.ObjectId(achievementId),
      unlocked_at: new Date(),
    });
    
    return newUserAchievement.save();
  }

  async createManyUserAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<UserAchievement[]> {
    const userAchievements = achievementIds.map(achievementId => ({
      user_id: new Types.ObjectId(userId),
      achievement_id: new Types.ObjectId(achievementId),
      unlocked_at: new Date(),
    }));
    
    return this.userAchievementModel.insertMany(userAchievements);
  }
}
