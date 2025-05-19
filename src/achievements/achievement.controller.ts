import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { ApiResponse } from 'src/common/api-response';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { Achievement } from './achievement.schema';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('/achievement')
export class AchievementController {
  
}
