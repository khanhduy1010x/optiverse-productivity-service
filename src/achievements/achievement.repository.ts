import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Achievement } from './achievement.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectModel(Achievement.name) private readonly achievementModel: Model<Achievement>,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return this.achievementModel.find().exec();
  }

  async findById(id: string): Promise<Achievement> {
    return this.achievementModel
      .findById(new Types.ObjectId(id))
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async create(createAchievementDto: CreateAchievementRequest): Promise<Achievement> {
    const newAchievement = new this.achievementModel({
      ...createAchievementDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return newAchievement.save();
  }

  async update(id: string, updateAchievementDto: UpdateAchievementRequest): Promise<Achievement> {
    return this.achievementModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateAchievementDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async delete(id: string): Promise<Achievement> {
    return this.achievementModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }
}
