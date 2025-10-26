"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const achievement_service_1 = require("./achievement.service");
const achievement_repository_1 = require("./achievement.repository");
const swagger_1 = require("@nestjs/swagger");
const CreateAchievementRequest_dto_1 = require("./dto/request/CreateAchievementRequest.dto");
const UpdateAchievementRequest_dto_1 = require("./dto/request/UpdateAchievementRequest.dto");
const AchievementResponse_dto_1 = require("./dto/response/AchievementResponse.dto");
const api_response_1 = require("../common/api-response");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const achievement_schema_1 = require("./achievement.schema");
const user_inventory_service_1 = require("../user-inventory/user-inventory.service");
let AchievementController = class AchievementController {
    constructor(achievementService, achievementRepository, cloudinaryService, userInventoryService) {
        this.achievementService = achievementService;
        this.achievementRepository = achievementRepository;
        this.cloudinaryService = cloudinaryService;
        this.userInventoryService = userInventoryService;
    }
    isEnumValue(enumObj, value) {
        return Object.values(enumObj).includes(value);
    }
    parseRulesInput(rules) {
        if (!rules)
            return [];
        if (typeof rules === 'string') {
            try {
                const parsed = JSON.parse(rules);
                if (!Array.isArray(parsed)) {
                    throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
                }
                return parsed;
            }
            catch {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
            }
        }
        if (!Array.isArray(rules)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULES_FORMAT);
        }
        return rules;
    }
    validateRule(rule) {
        if (!this.isEnumValue(achievement_schema_1.RuleCategory, rule?.category)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULE_CATEGORY);
        }
        if (typeof rule?.field !== 'string' || rule.field.trim().length === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULE_FIELD);
        }
        if (!this.isEnumValue(achievement_schema_1.ValueType, rule?.value_type)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULE_VALUE_TYPE);
        }
        if (!this.isEnumValue(achievement_schema_1.Operator, rule?.operator)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_RULE_OPERATOR);
        }
        if (rule.value_type === achievement_schema_1.ValueType.STRING || rule.value_type === achievement_schema_1.ValueType.NUMBER) {
            if (rule.threshold === undefined || typeof rule.threshold !== 'number' || Number.isNaN(rule.threshold)) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_MISSING_THRESHOLD);
            }
        }
        const val = rule.value;
        if (rule.value_type === achievement_schema_1.ValueType.DATE) {
            if (typeof val !== 'string' || Number.isNaN(Date.parse(val))) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_DATE_VALUE);
            }
        }
        else if (rule.value_type === achievement_schema_1.ValueType.BOOLEAN) {
            if (val !== 'true' && val !== 'false') {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_BOOLEAN_VALUE);
            }
        }
        else {
            if (typeof val !== 'string') {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_VALUE);
            }
        }
    }
    validateCreateDto(dto) {
        if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_TITLE);
        }
        if (dto.logic_operator && !this.isEnumValue(achievement_schema_1.LogicOperator, dto.logic_operator)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_LOGIC_OPERATOR);
        }
        const rulesArr = this.parseRulesInput(dto.rules);
        rulesArr.forEach((r) => this.validateRule(r));
    }
    validateUpdateDto(dto) {
        if (dto.title !== undefined) {
            if (typeof dto.title !== 'string' || dto.title.trim().length === 0) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_TITLE);
            }
        }
        if (dto.logic_operator && !this.isEnumValue(achievement_schema_1.LogicOperator, dto.logic_operator)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.ACHIEVEMENT_INVALID_LOGIC_OPERATOR);
        }
        if (dto.rules !== undefined) {
            const rulesArr = this.parseRulesInput(dto.rules);
            rulesArr.forEach((r) => this.validateRule(r));
        }
    }
    async getAll() {
        const list = await this.achievementService.getAllAchievements();
        return new api_response_1.ApiResponse(list.map((a) => new AchievementResponse_dto_1.AchievementResponse(a)));
    }
    async getById(id) {
        const ach = await this.achievementRepository.findById(id);
        return new api_response_1.ApiResponse(new AchievementResponse_dto_1.AchievementResponse(ach));
    }
    async create(files, createAchievementDto) {
        let iconUrl = undefined;
        const uploadedFile = files?.icon_file?.[0] || files?.file?.[0];
        if (uploadedFile) {
            iconUrl = await this.cloudinaryService.uploadFile(uploadedFile, 'achievements');
        }
        let parsedDto = { ...createAchievementDto };
        if (typeof createAchievementDto.rules === 'string') {
            parsedDto.rules = this.parseRulesInput(createAchievementDto.rules);
        }
        this.validateCreateDto(parsedDto);
        const achievement = await this.achievementRepository.create({
            ...parsedDto,
            icon_url: iconUrl,
        });
        return new api_response_1.ApiResponse(new AchievementResponse_dto_1.AchievementResponse(achievement));
    }
    async update(id, files, updateAchievementDto) {
        let iconUrl = undefined;
        const uploadedFile = files?.icon_file?.[0] || files?.file?.[0];
        if (uploadedFile) {
            iconUrl = await this.cloudinaryService.uploadFile(uploadedFile, 'achievements');
        }
        else {
            const current = await this.achievementRepository.findById(id);
            iconUrl = current.icon_url;
        }
        let parsedDto = { ...updateAchievementDto };
        if (typeof updateAchievementDto.rules === 'string') {
            parsedDto.rules = this.parseRulesInput(updateAchievementDto.rules);
        }
        this.validateUpdateDto(parsedDto);
        const achievement = await this.achievementRepository.update(id, {
            ...parsedDto,
            icon_url: iconUrl,
        });
        return new api_response_1.ApiResponse(new AchievementResponse_dto_1.AchievementResponse(achievement));
    }
    async delete(id) {
        await this.achievementRepository.delete(id);
        return new api_response_1.ApiResponse(true);
    }
    async evaluateForCurrentUser(req) {
        const userId = req.userInfo?.userId;
        if (!userId) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.MISSING_ACCESS_TOKEN);
        }
        const result = await this.achievementService.evaluateForUser(userId);
        if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
            for (const achievementId of result.newlyUnlocked) {
                try {
                    const achievement = await this.achievementRepository.findById(achievementId);
                    if (achievement && achievement.reward) {
                        await this.userInventoryService.addReward(userId, achievement.reward);
                    }
                }
                catch (error) {
                    console.error(`Failed to add reward for achievement ${achievementId}:`, error);
                }
            }
        }
        return new api_response_1.ApiResponse(result);
    }
};
exports.AchievementController = AchievementController;
__decorate([
    (0, common_1.Get)(''),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get all achievements',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(AchievementResponse_dto_1.AchievementResponse) },
                        },
                    },
                },
            ],
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('/:id'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get achievement by id',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(AchievementResponse_dto_1.AchievementResponse) },
                    },
                },
            ],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(''),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'icon_file', maxCount: 1 }
    ])),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new achievement' }),
    (0, swagger_1.ApiBody)({ type: CreateAchievementRequest_dto_1.CreateAchievementRequest }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Create achievement',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(AchievementResponse_dto_1.AchievementResponse) },
                    },
                },
            ],
        },
    }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateAchievementRequest_dto_1.CreateAchievementRequest]),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'icon_file', maxCount: 1 }
    ])),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an achievement' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Achievement ID' }),
    (0, swagger_1.ApiBody)({ type: UpdateAchievementRequest_dto_1.UpdateAchievementRequest }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update achievement',
        schema: {
            allOf: [
                { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
                {
                    type: 'object',
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(AchievementResponse_dto_1.AchievementResponse) },
                    },
                },
            ],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, UpdateAchievementRequest_dto_1.UpdateAchievementRequest]),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Delete achievement',
        schema: { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('/evaluate'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Evaluate achievements for current user and create unlocked user-achievements',
        schema: { $ref: (0, swagger_1.getSchemaPath)(api_response_1.ApiResponse) },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AchievementController.prototype, "evaluateForCurrentUser", null);
exports.AchievementController = AchievementController = __decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('/achievement'),
    __metadata("design:paramtypes", [achievement_service_1.AchievementService,
        achievement_repository_1.AchievementRepository,
        cloudinary_service_1.CloudinaryService,
        user_inventory_service_1.UserInventoryService])
], AchievementController);
//# sourceMappingURL=achievement.controller.js.map