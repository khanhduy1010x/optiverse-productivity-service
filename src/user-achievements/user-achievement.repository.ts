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
  
}
