import { Injectable } from '@nestjs/common';
import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievement } from './user-achievement.schema';
import { CreateUserAchievementRequest } from './dto/request/CreateUserAchievementRequest.dto';
import { UpdateUserAchievementRequest } from './dto/request/UpdateUserAchievementRequest.dto';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';

@Injectable()
export class UserAchievementService {
  
}
