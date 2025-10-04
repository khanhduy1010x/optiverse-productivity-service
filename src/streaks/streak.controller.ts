import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { StreakService } from './streak.service';
import { Streak } from './streak.schema';
import { StreakResponse } from './dto/response/StreakResponse.dto';
import { CreateStreakRequest } from './dto/request/CreateStreakRequest.dto';
import { UpdateStreakRequest } from './dto/request/UpdateStreakRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiTags('Streak')
@ApiBearerAuth('access-token')
@ApiExtraModels(ApiResponseWrapper, StreakResponse)
@Controller('/streak')
export class StreakController {
  constructor(
    private readonly streakService: StreakService
  ) {}

  @Get('user')
  async getUserStreak(@Request() req): Promise<ApiResponseWrapper<StreakResponse>> {
    const user = req.userInfo as UserDto;
    const streak = await this.streakService.getStreakByUserID(user.userId);
    return new ApiResponseWrapper<StreakResponse>(streak);
  }
  
  @Post('login')
  async updateLoginStreak(@Request() req): Promise<ApiResponseWrapper<StreakResponse>> {
    const user = req.userInfo as UserDto;
    const streak = await this.streakService.updateLoginStreak(user.userId);
    
    return new ApiResponseWrapper<StreakResponse>(streak);
  }

  @Post('task')
  async updateTaskStreak(@Request() req): Promise<ApiResponseWrapper<StreakResponse>> {
    const user = req.userInfo as UserDto;
    const streak = await this.streakService.updateTaskStreak(user.userId);
    
    return new ApiResponseWrapper<StreakResponse>(streak);
  }

  @Post('flashcard')
  async updateFlashcardStreak(@Request() req): Promise<ApiResponseWrapper<StreakResponse>> {
    const user = req.userInfo as UserDto;
    const streak = await this.streakService.updateFlashcardStreak(user.userId);
    
    return new ApiResponseWrapper<StreakResponse>(streak);
  }
}