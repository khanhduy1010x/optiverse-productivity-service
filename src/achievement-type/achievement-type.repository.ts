import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AchievementType, ConditionTypeEnum } from './achievement-type.schema';
import { Types } from 'mongoose';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateAchievementTypeRequest } from './dto/request/CreateAchievementTypeRequest.dto';
import { UpdateAchievementTypeRequest } from './dto/request/UpdateAchievementTypeRequest.dto';

@Injectable()
export class AchievementTypeRepository {
  constructor(
    @InjectModel(AchievementType.name) private readonly achievementTypeModel: Model<AchievementType>,
  ) {}

  async findByConditionType(conditionType: ConditionTypeEnum): Promise<AchievementType[]> {
    return this.achievementTypeModel.find({ condition_type: conditionType }).exec();
  }

  async findAll(): Promise<AchievementType[]> {
    return this.achievementTypeModel.find().exec();
  }

  async findById(id: string): Promise<AchievementType> {
    return this.achievementTypeModel
      .findById(new Types.ObjectId(id))
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async create(createAchievementTypeDto: CreateAchievementTypeRequest): Promise<AchievementType> {
    const newAchievementType = new this.achievementTypeModel({
      ...createAchievementTypeDto,
      achievement_id: new Types.ObjectId(createAchievementTypeDto.achievement_id),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return newAchievementType.save();
  }

  async update(id: string, updateAchievementTypeDto: UpdateAchievementTypeRequest): Promise<AchievementType> {
    const updateData: any = { ...updateAchievementTypeDto };
    
    if (updateData.achievement_id) {
      updateData.achievement_id = new Types.ObjectId(updateData.achievement_id);
    }
    
    return this.achievementTypeModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateData, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }

  async delete(id: string): Promise<AchievementType> {
    return this.achievementTypeModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .orFail(new AppException(ErrorCode.NOT_FOUND))
      .exec();
  }
} 