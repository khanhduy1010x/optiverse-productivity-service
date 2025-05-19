import { Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';
import { Achievement } from './achievement.schema';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';

@Injectable()
export class AchievementService {
  
}
