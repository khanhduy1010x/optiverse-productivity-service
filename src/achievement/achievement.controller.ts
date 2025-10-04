import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { ApiBearerAuth, ApiBody, ApiOkResponse, getSchemaPath, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiBearerAuth('access-token')
@Controller('/achievement')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly achievementRepository: AchievementRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('')
  @ApiOkResponse({
    description: 'Get all achievements',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(AchievementResponse) },
            },
          },
        },
      ],
    },
  })
  async getAll() {
    const list = await this.achievementService.getAllAchievements();
    return new ApiResponseWrapper(list.map((a) => new AchievementResponse(a)));
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get achievement by id',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(AchievementResponse) },
          },
        },
      ],
    },
  })
  async getById(@Param('id') id: string) {
    const ach = await this.achievementRepository.findById(id);
    return new ApiResponseWrapper(new AchievementResponse(ach));
  }

  @Post('')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'icon_file', maxCount: 1 }
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new achievement' })
  @ApiBody({ type: CreateAchievementRequest })
  @ApiOkResponse({
    description: 'Create achievement',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(AchievementResponse) },
          },
        },
      ],
    },
  })
  async create(
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body() createAchievementDto: CreateAchievementRequest,
  ): Promise<ApiResponseWrapper<AchievementResponse>> {
    let iconUrl: string | undefined = undefined;
    const uploadedFile = files?.icon_file?.[0] || files?.file?.[0];
    if (uploadedFile) {
      iconUrl = await this.cloudinaryService.uploadFile(uploadedFile, 'achievements');
    }

    // Parse rules từ string thành array object khi sử dụng FormData
    let parsedDto = { ...createAchievementDto };
    if (typeof createAchievementDto.rules === 'string') {
      try {
        parsedDto.rules = JSON.parse(createAchievementDto.rules);
      } catch (error) {
        throw new Error('Invalid rules format. Must be a valid JSON array.');
      }
    }

    const achievement = await this.achievementRepository.create({
      ...parsedDto,
      icon_url: iconUrl,
    });
    return new ApiResponseWrapper(new AchievementResponse(achievement));
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'icon_file', maxCount: 1 }
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an achievement' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  @ApiBody({ type: UpdateAchievementRequest })
  @ApiOkResponse({
    description: 'Update achievement',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(AchievementResponse) },
          },
        },
      ],
    },
  })
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body() updateAchievementDto: UpdateAchievementRequest,
  ): Promise<ApiResponseWrapper<AchievementResponse>> {
    let iconUrl: string | undefined = undefined;
    const uploadedFile = files?.icon_file?.[0] || files?.file?.[0];
    if (uploadedFile) {
      iconUrl = await this.cloudinaryService.uploadFile(uploadedFile, 'achievements');
    } else {
      // Lấy icon_url cũ nếu không upload file mới
      const current = await this.achievementRepository.findById(id);
      iconUrl = current.icon_url;
    }

    // Parse rules từ string thành array object khi sử dụng FormData
    let parsedDto = { ...updateAchievementDto };
    if (typeof updateAchievementDto.rules === 'string') {
      try {
        parsedDto.rules = JSON.parse(updateAchievementDto.rules);
      } catch (error) {
        throw new Error('Invalid rules format. Must be a valid JSON array.');
      }
    }

    const achievement = await this.achievementRepository.update(id, {
      ...parsedDto,
      icon_url: iconUrl,
    });
    return new ApiResponseWrapper(new AchievementResponse(achievement));
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Delete achievement',
    schema: { $ref: getSchemaPath(ApiResponseWrapper) },
  })
  async delete(@Param('id') id: string) {
    await this.achievementRepository.delete(id);
    return new ApiResponseWrapper(true);
  }

  @Post('/evaluate')
  @ApiOkResponse({
    description: 'Evaluate achievements for current user and create unlocked user-achievements',
    schema: { $ref: getSchemaPath(ApiResponseWrapper) },
  })
  async evaluateForCurrentUser(@Request() req) {
    const userId = req.userInfo?.userId;
    const result = await this.achievementService.evaluateForUser(userId);
    return new ApiResponseWrapper(result);
  }
}