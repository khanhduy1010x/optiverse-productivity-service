import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserAchievementService } from './user-achievement.service';
import { ApiResponse } from 'src/common/api-response';
import { UserAchievementResponse } from './dto/response/UserAchievementResponse.dto';
import { CreateUserAchievementRequest } from './dto/request/CreateUserAchievementRequest.dto';
import { UpdateUserAchievementRequest } from './dto/request/UpdateUserAchievementRequest.dto';
import { UserAchievement } from './user-achievement.schema';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/user-achievement')
export class UserAchievementController {
  
}
