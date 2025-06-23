import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { ApiResponse } from 'src/common/api-response';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { Achievement } from './achievement.schema';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ConditionTypeEnum } from '../achievement-type/achievement-type.schema';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@ApiTags('achievements')
@Controller('/achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements' })
  async findAll(): Promise<ApiResponse<Achievement[]>> {
    const achievements = await this.achievementService.findAll();
    return new ApiResponse(achievements);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get achievement by ID' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<AchievementResponse>> {
    const achievement = await this.achievementService.findById(id);
    return new ApiResponse(new AchievementResponse(achievement));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new achievement' })
  @ApiBody({ type: CreateAchievementRequest })
  async create(@Body() createAchievementDto: CreateAchievementRequest): Promise<ApiResponse<AchievementResponse>> {
    const achievement = await this.achievementService.create(createAchievementDto);
    return new ApiResponse(new AchievementResponse(achievement));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an achievement' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  @ApiBody({ type: UpdateAchievementRequest })
  async update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementRequest,
  ): Promise<ApiResponse<AchievementResponse>> {
    const achievement = await this.achievementService.update(id, updateAchievementDto);
    return new ApiResponse(new AchievementResponse(achievement));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an achievement' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  async remove(@Param('id') id: string): Promise<ApiResponse<AchievementResponse>> {
    const achievement = await this.achievementService.delete(id);
    return new ApiResponse(new AchievementResponse(achievement));
  }

  @Post('check-task-achievements')
  @ApiOperation({ summary: 'Check and unlock all task-related achievements for a user' })
  async checkTaskAchievements(
    @Request() req
  ): Promise<ApiResponse<Achievement[]>> {
    const user = req.userInfo as UserDto;
    const newAchievements = await this.achievementService.checkAllTaskCompletedAchievements(user.userId);
    return new ApiResponse(newAchievements);
  }
}
