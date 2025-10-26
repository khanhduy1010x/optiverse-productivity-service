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
exports.UserInventoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const user_inventory_service_1 = require("./user-inventory.service");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const error_code_enum_1 = require("../common/exceptions/error-code.enum");
const mongoose_1 = require("mongoose");
const api_response_1 = require("../common/api-response");
const createframerequest_dto_1 = require("./dto/request/createframerequest.dto");
const updateframerequest_dto_1 = require("./dto/request/updateframerequest.dto");
let UserInventoryController = class UserInventoryController {
    constructor(userInventoryService, cloudinaryService) {
        this.userInventoryService = userInventoryService;
        this.cloudinaryService = cloudinaryService;
    }
    async getByUserId(req) {
        const userId = req.userInfo?.userId;
        if (!userId) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UNAUTHENTICATED);
        }
        const data = await this.userInventoryService.findByUserId(userId);
        return new api_response_1.ApiResponse(data);
    }
    async create(data) {
        const result = await this.userInventoryService.create(data);
        return new api_response_1.ApiResponse(result);
    }
    async getAllFrames() {
        const frames = await this.userInventoryService.getAllFrames();
        const responseData = {
            frames: frames.map(frame => ({
                _id: frame._id.toString(),
                title: frame.title,
                icon_url: frame.icon_url,
                cost: frame.cost
            })),
            total: frames.length
        };
        return new api_response_1.ApiResponse(responseData);
    }
    async getFrameById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_ID);
        }
        const frame = await this.userInventoryService.getFrameById(id);
        if (!frame) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
        }
        const responseData = {
            _id: frame._id.toString(),
            title: frame.title,
            icon_url: frame.icon_url,
            cost: frame.cost
        };
        return new api_response_1.ApiResponse(responseData);
    }
    async createFrame(data, file) {
        console.log('=== CREATE FRAME DEBUG ===');
        console.log('Request data:', data);
        console.log('File info:', file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        } : 'No file uploaded');
        if (!data.title || data.title.trim().length === 0) {
            console.log('❌ Validation failed: Title required');
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_REQUIRED);
        }
        if (data.title.trim().length < 2) {
            console.log('❌ Validation failed: Title too short');
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_TOO_SHORT);
        }
        if (data.title.trim().length > 100) {
            console.log('❌ Validation failed: Title too long');
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_TOO_LONG);
        }
        console.log('✅ Title validation passed');
        if (!data.cost || data.cost < 1) {
            console.log('❌ Validation failed: Invalid cost');
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_REQUIRED);
        }
        console.log('✅ Cost validation passed');
        if (file) {
            console.log('📁 File validation starting...');
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                console.log('❌ File validation failed: Invalid file type');
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_FILE_TYPE);
            }
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                console.log('❌ File validation failed: File too large');
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_FILE_TOO_LARGE);
            }
            console.log('✅ File validation passed');
        }
        else {
            console.log('📁 No file to validate');
        }
        try {
            console.log('🚀 Starting frame creation process...');
            let icon_url;
            if (file) {
                console.log('📤 Uploading file to Cloudinary...');
                icon_url = await this.cloudinaryService.uploadFile(file, 'frames');
                console.log('✅ File uploaded successfully:', icon_url);
            }
            console.log('💾 Creating frame in database...');
            const frameData = {
                title: data.title.trim(),
                icon_url,
                cost: data.cost
            };
            console.log('Frame data to save:', frameData);
            const frame = await this.userInventoryService.createFrame(frameData);
            console.log('✅ Frame created successfully:', frame);
            const responseData = {
                _id: frame._id.toString(),
                title: frame.title,
                icon_url: frame.icon_url,
                cost: frame.cost
            };
            console.log('📤 Sending response:', responseData);
            console.log('=== CREATE FRAME DEBUG END ===');
            return new api_response_1.ApiResponse(responseData);
        }
        catch (error) {
            console.log('❌ Error in createFrame:', error);
            if (error instanceof app_exception_1.AppException) {
                throw error;
            }
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_UPLOAD_FAILED);
        }
    }
    async updateFrame(id, data, file) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_ID);
        }
        if (data.title !== undefined) {
            if (!data.title || data.title.trim().length === 0) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_REQUIRED);
            }
            if (data.title.trim().length < 2) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_TOO_SHORT);
            }
            if (data.title.trim().length > 100) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_TOO_LONG);
            }
        }
        if (data.cost !== undefined && data.cost < 1) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_TITLE_REQUIRED);
        }
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_FILE_TYPE);
            }
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_FILE_TOO_LARGE);
            }
        }
        try {
            const existingFrame = await this.userInventoryService.getFrameById(id);
            if (!existingFrame) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
            }
            let icon_url;
            if (file) {
                icon_url = await this.cloudinaryService.uploadFile(file, 'frames');
            }
            const updateData = {};
            if (data.title !== undefined)
                updateData.title = data.title.trim();
            if (icon_url)
                updateData.icon_url = icon_url;
            if (data.cost !== undefined)
                updateData.cost = data.cost;
            const updatedFrame = await this.userInventoryService.updateFrame(id, updateData);
            if (!updatedFrame) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
            }
            const responseData = {
                _id: updatedFrame._id.toString(),
                title: updatedFrame.title,
                icon_url: updatedFrame.icon_url,
                cost: updatedFrame.cost
            };
            return new api_response_1.ApiResponse(responseData);
        }
        catch (error) {
            if (error instanceof app_exception_1.AppException) {
                throw error;
            }
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_UPLOAD_FAILED);
        }
    }
    async deleteFrame(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_ID);
        }
        try {
            const existingFrame = await this.userInventoryService.getFrameById(id);
            if (!existingFrame) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
            }
            const deletedFrame = await this.userInventoryService.deleteFrame(id);
            if (!deletedFrame) {
                throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
            }
            return new api_response_1.ApiResponse({
                message: 'Frame deleted successfully',
                deletedFrame: {
                    _id: deletedFrame._id.toString(),
                    title: deletedFrame.title,
                    icon_url: deletedFrame.icon_url,
                    cost: deletedFrame.cost
                }
            });
        }
        catch (error) {
            if (error instanceof app_exception_1.AppException) {
                throw error;
            }
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
        }
    }
    async exchangeFrame(req, frameId) {
        const userId = req.userInfo?.userId;
        if (!userId) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.UNAUTHENTICATED);
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_ID);
        }
        if (!mongoose_1.Types.ObjectId.isValid(frameId)) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_INVALID_ID);
        }
        try {
            const result = await this.userInventoryService.exchangeFrame(userId, frameId);
            const responseData = {
                success: result.success,
                message: result.message,
                remainingPoints: result.userInventory ? parseInt(result.userInventory.op) : undefined,
                ownedFrameId: result.success ? frameId : undefined
            };
            return new api_response_1.ApiResponse(responseData);
        }
        catch (error) {
            throw new app_exception_1.AppException(error_code_enum_1.ErrorCode.FRAME_NOT_FOUND);
        }
    }
};
exports.UserInventoryController = UserInventoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "getByUserId", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('frames/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "getAllFrames", null);
__decorate([
    (0, common_1.Get)('frames/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "getFrameById", null);
__decorate([
    (0, common_1.Post)('frames'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('icon')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createframerequest_dto_1.CreateFrameRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "createFrame", null);
__decorate([
    (0, common_1.Put)('frames/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('icon')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, updateframerequest_dto_1.UpdateFrameRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "updateFrame", null);
__decorate([
    (0, common_1.Delete)('frames/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "deleteFrame", null);
__decorate([
    (0, common_1.Post)('exchange-frame/:frameId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('frameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserInventoryController.prototype, "exchangeFrame", null);
exports.UserInventoryController = UserInventoryController = __decorate([
    (0, common_1.Controller)('user-inventory'),
    __metadata("design:paramtypes", [user_inventory_service_1.UserInventoryService,
        cloudinary_service_1.CloudinaryService])
], UserInventoryController);
//# sourceMappingURL=user-inventory.controller.js.map