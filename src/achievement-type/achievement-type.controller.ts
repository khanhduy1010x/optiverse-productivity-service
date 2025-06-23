import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AchievementTypeService } from './achievement-type.service';
import { CreateAchievementTypeRequest } from './dto/request/CreateAchievementTypeRequest.dto';
import { UpdateAchievementTypeRequest } from './dto/request/UpdateAchievementTypeRequest.dto';
import { AchievementTypeResponse } from './dto/response/AchievementTypeResponse.dto';
import { ApiResponse } from 'src/common/api-response';

@Controller('achievement-types')
export class AchievementTypeController {
  constructor(private readonly achievementTypeService: AchievementTypeService) {}

  @Get()
  async findAll(): Promise<ApiResponse<AchievementTypeResponse[]>> {
    const achievementTypes = await this.achievementTypeService.findAll();
    return new ApiResponse<AchievementTypeResponse[]>(achievementTypes);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<AchievementTypeResponse>> {
    const achievementType = await this.achievementTypeService.findOne(id);
    return new ApiResponse<AchievementTypeResponse>(achievementType);
  }

  @Post()
  async create(
    @Body() createAchievementTypeDto: CreateAchievementTypeRequest,
  ): Promise<ApiResponse<AchievementTypeResponse>> {
    const achievementType = await this.achievementTypeService.create(createAchievementTypeDto);
    return new ApiResponse<AchievementTypeResponse>(achievementType);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAchievementTypeDto: UpdateAchievementTypeRequest,
  ): Promise<ApiResponse<AchievementTypeResponse>> {
    const achievementType = await this.achievementTypeService.update(id, updateAchievementTypeDto);
    return new ApiResponse<AchievementTypeResponse>(achievementType);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.achievementTypeService.remove(id);
    return new ApiResponse<void>(null);
  }
} 