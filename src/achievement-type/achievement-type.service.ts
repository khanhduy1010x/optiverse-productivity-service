import { Injectable } from '@nestjs/common';
import { AchievementTypeRepository } from './achievement-type.repository';
import { CreateAchievementTypeRequest } from './dto/request/CreateAchievementTypeRequest.dto';
import { UpdateAchievementTypeRequest } from './dto/request/UpdateAchievementTypeRequest.dto';
import { AchievementTypeResponse } from './dto/response/AchievementTypeResponse.dto';

@Injectable()
export class AchievementTypeService {
  constructor(private readonly achievementTypeRepository: AchievementTypeRepository) {}

  async findAll(): Promise<AchievementTypeResponse[]> {
    const achievementTypes = await this.achievementTypeRepository.findAll();
    return achievementTypes.map(type => new AchievementTypeResponse(type));
  }

  async findOne(id: string): Promise<AchievementTypeResponse> {
    const achievementType = await this.achievementTypeRepository.findById(id);
    return new AchievementTypeResponse(achievementType);
  }

  async create(
    createAchievementTypeDto: CreateAchievementTypeRequest,
  ): Promise<AchievementTypeResponse> {
    const achievementType = await this.achievementTypeRepository.create(createAchievementTypeDto);
    return new AchievementTypeResponse(achievementType);
  }

  async update(
    id: string,
    updateAchievementTypeDto: UpdateAchievementTypeRequest,
  ): Promise<AchievementTypeResponse> {
    const achievementType = await this.achievementTypeRepository.update(id, updateAchievementTypeDto);
    return new AchievementTypeResponse(achievementType);
  }

  async remove(id: string): Promise<void> {
    await this.achievementTypeRepository.delete(id);
  }
} 