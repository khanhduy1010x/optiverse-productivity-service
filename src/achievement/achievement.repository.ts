import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Achievement } from './achievement.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { UserAchievementRepository } from 'src/user-achievements/user-achievement.repository';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectModel(Achievement.name) private readonly achievementModel: Model<Achievement>,
    @Inject(forwardRef(() => UserAchievementRepository))
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  async getAll(): Promise<Achievement[]> {
    return this.achievementModel.find().exec();
  }

  async findById(id: string): Promise<Achievement> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.INVALID_OBJECT_ID);
    }
    return this.achievementModel
      .findById(new Types.ObjectId(id))
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async findByTitle(title: string): Promise<Achievement | null> {
    return this.achievementModel.findOne({ title: title.trim() }).exec();
  }

  async create(dto: CreateAchievementRequest): Promise<Achievement> {
    const created = new this.achievementModel(dto as any);
    return created.save();
  }

  async update(id: string, dto: UpdateAchievementRequest): Promise<Achievement> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.INVALID_OBJECT_ID);
    }
    return this.achievementModel
      .findByIdAndUpdate(new Types.ObjectId(id), dto as any, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.INVALID_OBJECT_ID);
    }
    
    // Xóa tất cả user achievements liên quan trước khi xóa achievement
    await this.userAchievementRepository.deleteByAchievementId(id);
    
    const res = await this.achievementModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }
}