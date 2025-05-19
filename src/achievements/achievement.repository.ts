import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from './achievement.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';

@Injectable()
export class AchievementRepository {
  
}
