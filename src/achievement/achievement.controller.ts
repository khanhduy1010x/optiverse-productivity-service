import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { ApiBearerAuth, ApiBody, ApiOkResponse, getSchemaPath, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateAchievementRequest } from './dto/request/CreateAchievementRequest.dto';
import { UpdateAchievementRequest } from './dto/request/UpdateAchievementRequest.dto';
import { AchievementResponse } from './dto/response/AchievementResponse.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { Operator, RuleCategory, ValueType, LogicOperator } from './achievement.schema';
import { UserInventoryService } from 'src/user-inventory/user-inventory.service';

@ApiBearerAuth('access-token')
@Controller('/achievement')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly achievementRepository: AchievementRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userInventoryService: UserInventoryService,
  ) {}

  private isEnumValue<T extends object>(enumObj: T, value: any): boolean {
    return Object.values(enumObj as any).includes(value);
  }

  private parseRulesInput(rules: any[] | string | undefined): any[] {
    if (!rules) return [];
    if (typeof rules === 'string') {
      try {
        const parsed = JSON.parse(rules);
        if (!Array.isArray(parsed)) {
          throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
        }
        return parsed;
      } catch {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
      }
    }
    if (!Array.isArray(rules)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
    }
    return rules;
  }

  private validateRule(rule: any) {
    if (!this.isEnumValue(RuleCategory, rule?.category)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULE_CATEGORY);
    }
    if (typeof rule?.field !== 'string' || rule.field.trim().length === 0) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULE_FIELD);
    }
    if (!this.isEnumValue(ValueType, rule?.value_type)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULE_VALUE_TYPE);
    }
    if (!this.isEnumValue(Operator, rule?.operator)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_RULE_OPERATOR);
    }
    // threshold validation for STRING/NUMBER
    if (rule.value_type === ValueType.STRING || rule.value_type === ValueType.NUMBER) {
      if (rule.threshold === undefined || typeof rule.threshold !== 'number' || Number.isNaN(rule.threshold)) {
        throw new AppException(ErrorCode.ACHIEVEMENT_MISSING_THRESHOLD);
      }
    }
    // value validation by type
    const val = rule.value;
    if (rule.value_type === ValueType.DATE) {
      if (typeof val !== 'string') {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_DATE_VALUE);
      }
      // Accept:
      // 1. ISO dates: "2025-01-15"
      // 2. Relative dates: "1D", "7D", "30D", "24H"
      // 3. Date ranges: "2025-01-15 to 2025-01-20" or "2025-11-22 to 2025-11-29"
      const isValidIsoDate = !Number.isNaN(Date.parse(val));
      const isValidRelativeDate = /^\d+[DdHh]$/.test(val); // Matches "1D", "7D", "24H"
      const isValidDateRange = /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/.test(val); // Matches "YYYY-MM-DD to YYYY-MM-DD"
      
      if (!isValidIsoDate && !isValidRelativeDate && !isValidDateRange) {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_DATE_VALUE);
      }
    } 
    else if (rule.value_type === ValueType.BOOLEAN) {
      if (val !== 'true' && val !== 'false') {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_BOOLEAN_VALUE);
      }
    } else {
      if (typeof val !== 'string') {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_VALUE);
      }
    }
  }

  private validateCreateDto(dto: CreateAchievementRequest) {
    if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_TITLE);
    }
    if (dto.logic_operator && !this.isEnumValue(LogicOperator, dto.logic_operator)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_LOGIC_OPERATOR);
    }
    const rulesArr = this.parseRulesInput(dto.rules as any);
    rulesArr.forEach((r) => this.validateRule(r));
  }

  private async validateCreateDtoWithDuplicate(dto: CreateAchievementRequest) {
    this.validateCreateDto(dto);
    // Check for duplicate title
    if (dto.title) {
      const existing = await this.achievementRepository.findByTitle(dto.title);
      if (existing) {
        throw new AppException(ErrorCode.ACHIEVEMENT_DUPLICATE_TITLE);
      }
    }
  }

  private validateUpdateDto(dto: UpdateAchievementRequest) {
    if (dto.title !== undefined) {
      if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
        throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_TITLE);
      }
    }
    if (dto.logic_operator && !this.isEnumValue(LogicOperator, dto.logic_operator)) {
      throw new AppException(ErrorCode.ACHIEVEMENT_INVALID_LOGIC_OPERATOR);
    }
    if (dto.rules !== undefined) {
      const rulesArr = this.parseRulesInput(dto.rules as any);
      rulesArr.forEach((r) => this.validateRule(r));
    }
  }

  private async validateUpdateDtoWithDuplicate(id: string, dto: UpdateAchievementRequest) {
    this.validateUpdateDto(dto);
    // Check for duplicate title only if title is being updated
    if (dto.title) {
      const existing = await this.achievementRepository.findByTitle(dto.title);
      if (existing && existing._id.toString() !== id) {
        throw new AppException(ErrorCode.ACHIEVEMENT_DUPLICATE_TITLE);
      }
    }
  }

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
    console.log('=== CREATE ACHIEVEMENT - Frontend Request ===');
    console.log('Raw DTO from frontend:', JSON.stringify(createAchievementDto, null, 2));
    console.log('Rules type:', typeof createAchievementDto.rules);
    console.log('Rules value:', createAchievementDto.rules);
    if (typeof createAchievementDto.rules === 'string') {
      console.log('Rules is string, parsing...');
      try {
        const parsed = JSON.parse(createAchievementDto.rules);
        console.log('Parsed rules:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Failed to parse rules:', e);
      }
    }
    console.log('Files received:', files ? Object.keys(files) : 'none');
    
    let iconUrl: string | undefined = undefined;
    const uploadedFile = files?.icon_file?.[0] || files?.file?.[0];
    if (uploadedFile) {
      iconUrl = await this.cloudinaryService.uploadFile(uploadedFile, 'achievements');
    }

    // Parse rules từ string thành array object khi sử dụng FormData
    let parsedDto = { ...createAchievementDto };
    if (typeof createAchievementDto.rules === 'string') {
      parsedDto.rules = this.parseRulesInput(createAchievementDto.rules);
    }
    // Validate full dto including duplicate title check
    await this.validateCreateDtoWithDuplicate(parsedDto as any);

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
    console.log('=== UPDATE ACHIEVEMENT - Frontend Request ===');
    console.log('Achievement ID:', id);
    console.log('Raw DTO from frontend:', JSON.stringify(updateAchievementDto, null, 2));
    console.log('Rules type:', typeof updateAchievementDto.rules);
    console.log('Rules value:', updateAchievementDto.rules);
    if (typeof updateAchievementDto.rules === 'string') {
      console.log('Rules is string, parsing...');
      try {
        const parsed = JSON.parse(updateAchievementDto.rules);
        console.log('Parsed rules:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Failed to parse rules:', e);
      }
    }
    console.log('Files received:', files ? Object.keys(files) : 'none');
    
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
      parsedDto.rules = this.parseRulesInput(updateAchievementDto.rules);
    }
    // Validate update dto (only provided fields) including duplicate title check
    await this.validateUpdateDtoWithDuplicate(id, parsedDto as any);

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
    if (!userId) {
      throw new AppException(ErrorCode.MISSING_ACCESS_TOKEN);
    }
    const result = await this.achievementService.evaluateForUser(userId);
    
    // Thêm reward vào user-inventory cho những achievement mới unlock
    if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
      for (const achievementId of result.newlyUnlocked) {
        try {
          // Lấy thông tin achievement để có reward
          const achievement = await this.achievementRepository.findById(achievementId);
          if (achievement && achievement.reward) {
            // Thêm reward vào user-inventory
            await this.userInventoryService.addReward(userId, achievement.reward);
          }
        } catch (error) {
          // Log error nhưng không làm fail toàn bộ process
          console.error(`Failed to add reward for achievement ${achievementId}:`, error);
        }
      }
    }
    
    return new ApiResponseWrapper(result);
  }
}