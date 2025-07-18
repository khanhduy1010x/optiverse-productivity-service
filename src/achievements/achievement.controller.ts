import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { ApiResponse } from 'src/common/api-response';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { Achievement } from './achievement.schema';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ConditionTypeEnum } from '../achievement-type/achievement-type.schema';
import { UserDto } from 'src/user-dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@ApiBearerAuth('access-token')
@ApiTags('achievements')
@Controller('/achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService, private readonly cloudinaryService: CloudinaryService) {}

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
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new achievement' })
  @ApiBody({ type: CreateAchievementRequest })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAchievementDto: CreateAchievementRequest,
  ): Promise<ApiResponse<AchievementResponse>> {
    let iconUrl: string | undefined = undefined;
    if (file) {
      iconUrl = await this.cloudinaryService.uploadFile(file, 'achievements');
    }
    const achievement = await this.achievementService.create({
      ...createAchievementDto,
      icon_url: iconUrl,
    });
    return new ApiResponse(new AchievementResponse(achievement));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an achievement' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  @ApiBody({ type: UpdateAchievementRequest })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateAchievementDto: UpdateAchievementRequest,
  ): Promise<ApiResponse<AchievementResponse>> {
    let iconUrl: string | undefined = undefined;
    if (file) {
      iconUrl = await this.cloudinaryService.uploadFile(file, 'achievements');
    } else {
      // Lấy icon_url cũ nếu không upload file mới
      const current = await this.achievementService.findById(id);
      iconUrl = current.icon_url;
    }
    const achievement = await this.achievementService.update(id, {
      ...updateAchievementDto,
      icon_url: iconUrl,
    });
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

  @Post('check-friend-achievements')
  @ApiOperation({ summary: 'Check and unlock all friend-related achievements for a user' })
  async checkFriendAchievements(
    @Request() req
  ): Promise<ApiResponse<Achievement[]>> {
    const user = req.userInfo as UserDto;
    const newAchievements = await this.achievementService.checkFriendsCountAchievements(user.userId);
    return new ApiResponse(newAchievements);
  }

  @Post('check-streak-achievements')
  @ApiOperation({ summary: 'Check and unlock all streak-related achievements for a user' })
  async checkStreakAchievements(
    @Request() req
  ): Promise<ApiResponse<Achievement[]>> {
    const user = req.userInfo as UserDto;
    const newAchievements = await this.achievementService.checkStreakAchievements(user.userId);
    return new ApiResponse(newAchievements);
  }
}
