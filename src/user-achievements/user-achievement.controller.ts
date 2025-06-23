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
  constructor(private readonly userAchievementService: UserAchievementService) {}


  /**
   * Lấy tất cả thành tựu đã đạt được của người dùng hiện tại
   */
  @Get('/my-achievements/unlocked')
  async getMyUnlockedAchievements(@Request() req): Promise<ApiResponse<any>> {
    const user = req.userInfo as UserDto;
    const achievements = await this.userAchievementService.getUnlockedAchievements(user.userId);
    return new ApiResponse(achievements);
  }

  /**
   * Lấy tất cả thành tựu chưa đạt được của người dùng hiện tại
   */
  @Get('/my-achievements/locked')
  async getMyLockedAchievements(@Request() req): Promise<ApiResponse<any>> {
    const user = req.userInfo as UserDto;
    const achievements = await this.userAchievementService.getLockedAchievements(user.userId);
    return new ApiResponse(achievements);
  }

  /**
   * Lấy chi tiết một thành tựu cụ thể của người dùng
   */
  @Get('/:id')
  async getAchievementById(@Param('id') id: string): Promise<ApiResponse<UserAchievementResponse>> {
    const achievement = await this.userAchievementService.getUserAchievementById(id);
    return new ApiResponse(achievement);
  }
}
