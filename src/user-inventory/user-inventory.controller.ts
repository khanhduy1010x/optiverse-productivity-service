import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInventoryService } from './user-inventory.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UserInventory, Frame } from './user-inventory.schema';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/exceptions/error-code.enum';
import { Types } from 'mongoose';
import { ApiResponse as ApiResponseWrapper } from '../common/api-response';
import { CreateFrameRequestDto } from './dto/request/create-frame-request.dto';
import { UpdateFrameRequestDto } from './dto/request/update-frame-request.dto';
import { FrameResponseDto } from './dto/response/frame-response.dto';
import { CreateFrameResponseDto } from './dto/response/create-frame-response.dto';
import { UpdateFrameResponseDto } from './dto/response/update-frame-response.dto';
import { GetFrameResponseDto } from './dto/response/get-frame-response.dto';
import { GetAllFramesResponseDto } from './dto/response/get-all-frames-response.dto';
import { DeleteFrameResponseDto } from './dto/response/delete-frame-response.dto';
import { ExchangeFrameResponseDto } from './dto/response/exchange-frame-response.dto';
import { UserFramesResponseDto } from './dto/response/user-frames-response.dto';
import { SetActiveFrameResponseDto } from './dto/response/set-active-frame-response.dto';

@Controller('user-inventory')
export class UserInventoryController {
  constructor(
    private readonly userInventoryService: UserInventoryService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // ==================== USER FRAME ENDPOINTS ====================
  
  /**
   * Lấy tất cả frame mà user sở hữu
   */
  @Get('my-frames')
  async getUserFrames(@Req() req: any): Promise<ApiResponseWrapper<UserFramesResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.userInventoryService.getUserFrames(userId);
    
    const responseData = {
      frames: result.frames.map(frame => ({
        _id: frame._id.toString(),
        title: frame.title,
        icon_url: frame.icon_url,
        cost: frame.cost
      })),
      activeFrame: result.activeFrame,
      userPoints: result.userPoints,
      total: result.frames.length
    };

    return new ApiResponseWrapper(responseData);
  }

  /**
   * Set frame active cho user
   */
  @Post('set-active-frame/:frameId')
  async setActiveFrame(
    @Req() req: any,
    @Param('frameId') frameId: string
  ): Promise<ApiResponseWrapper<SetActiveFrameResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    if (!Types.ObjectId.isValid(frameId)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }

    const result = await this.userInventoryService.setActiveFrame(userId, frameId);
    
    return new ApiResponseWrapper({
      success: result.success,
      message: result.message
    });
  }

  /**
   * Đổi frame bằng điểm
   */
  @Post('exchange-frame/:frameId')
  async exchangeFrame(
    @Req() req: any,
    @Param('frameId') frameId: string
  ): Promise<ApiResponseWrapper<ExchangeFrameResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }

    if (!Types.ObjectId.isValid(frameId)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }

    try {
      const result = await this.userInventoryService.exchangeFrame(userId, frameId);
      
      const responseData: ExchangeFrameResponseDto = {
        success: result.success,
        message: result.message,
        remainingPoints: result.userInventory ? parseInt(result.userInventory.op) : undefined,
        ownedFrameId: result.success ? frameId : undefined
      };

      return new ApiResponseWrapper(responseData);
    } catch (error) {
      throw new AppException(ErrorCode.FRAME_NOT_FOUND);
    }
  }

  // ==================== FRAME CRUD ENDPOINTS ====================
  
  /**
   * Lấy tất cả frame có trong hệ thống (để hiển thị shop)
   */
  @Get('frames/all')
  async getAllFrames(): Promise<ApiResponseWrapper<GetAllFramesResponseDto>> {
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
    return new ApiResponseWrapper(responseData);
  }

  /**
   * Lấy thông tin chi tiết 1 frame
   */
  @Get('frames/:id')
  async getFrameById(@Param('id') id: string): Promise<ApiResponseWrapper<GetFrameResponseDto>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }
    
    const frame = await this.userInventoryService.getFrameById(id);
    if (!frame) {
      throw new AppException(ErrorCode.FRAME_NOT_FOUND);
    }
    
    const responseData = {
      _id: frame._id.toString(),
      title: frame.title,
      icon_url: frame.icon_url,
      cost: frame.cost
    };
    return new ApiResponseWrapper(responseData);
  }

  /**
   * Tạo frame mới (Admin only)
   */
  @Post('frames')
  @UseInterceptors(FileInterceptor('icon'))
  async createFrame(
    @Body() data: CreateFrameRequestDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<ApiResponseWrapper<CreateFrameResponseDto>> {
    // Validate title
    if (!data.title || data.title.trim().length === 0) {
      throw new AppException(ErrorCode.FRAME_TITLE_REQUIRED);
    }
    if (data.title.trim().length < 2) {
      throw new AppException(ErrorCode.FRAME_TITLE_TOO_SHORT);
    }
    if (data.title.trim().length > 100) {
      throw new AppException(ErrorCode.FRAME_TITLE_TOO_LONG);
    }

    // Validate cost
    if (!data.cost || data.cost < 1) {
      throw new AppException(ErrorCode.FRAME_TITLE_REQUIRED);
    }
    
    // Validate file if provided
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppException(ErrorCode.FRAME_INVALID_FILE_TYPE);
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new AppException(ErrorCode.FRAME_FILE_TOO_LARGE);
      }
    }

    try {
      let icon_url: string | undefined;
      
      if (file) {
        icon_url = await this.cloudinaryService.uploadFile(file, 'frames');
      }
      
      const frameData = {
        title: data.title.trim(),
        icon_url,
        cost: data.cost
      };
      
      const frame = await this.userInventoryService.createFrame(frameData);
      
      const responseData = {
        _id: frame._id.toString(),
        title: frame.title,
        icon_url: frame.icon_url,
        cost: frame.cost
      };
      
      return new ApiResponseWrapper(responseData);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.FRAME_UPLOAD_FAILED);
    }
  }

  /**
   * Cập nhật frame (Admin only)
   */
  @Put('frames/:id')
  @UseInterceptors(FileInterceptor('icon'))
  async updateFrame(
    @Param('id') id: string,
    @Body() data: UpdateFrameRequestDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<ApiResponseWrapper<UpdateFrameResponseDto>> {
    // Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }
    
    // Validate title if provided
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new AppException(ErrorCode.FRAME_TITLE_REQUIRED);
      }
      if (data.title.trim().length < 2) {
        throw new AppException(ErrorCode.FRAME_TITLE_TOO_SHORT);
      }
      if (data.title.trim().length > 100) {
        throw new AppException(ErrorCode.FRAME_TITLE_TOO_LONG);
      }
    }

    // Validate cost if provided
    if (data.cost !== undefined && data.cost < 1) {
      throw new AppException(ErrorCode.FRAME_TITLE_REQUIRED);
    }
    
    // Validate file if provided
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppException(ErrorCode.FRAME_INVALID_FILE_TYPE);
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new AppException(ErrorCode.FRAME_FILE_TOO_LARGE);
      }
    }

    try {
      // Check if frame exists
      const existingFrame = await this.userInventoryService.getFrameById(id);
      if (!existingFrame) {
        throw new AppException(ErrorCode.FRAME_NOT_FOUND);
      }

      let icon_url: string | undefined;
      
      if (file) {
        icon_url = await this.cloudinaryService.uploadFile(file, 'frames');
      }
      
      const updateData: Partial<Frame> = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (icon_url) updateData.icon_url = icon_url;
      if (data.cost !== undefined) updateData.cost = data.cost;
      
      const updatedFrame = await this.userInventoryService.updateFrame(id, updateData);
      if (!updatedFrame) {
        throw new AppException(ErrorCode.FRAME_NOT_FOUND);
      }
      
      const responseData = {
        _id: updatedFrame._id.toString(),
        title: updatedFrame.title,
        icon_url: updatedFrame.icon_url,
        cost: updatedFrame.cost
      };
      return new ApiResponseWrapper(responseData);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.FRAME_UPLOAD_FAILED);
    }
  }

  /**
   * Xóa frame (Admin only)
   */
  @Delete('frames/:id')
  async deleteFrame(@Param('id') id: string): Promise<ApiResponseWrapper<DeleteFrameResponseDto>> {
    // Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new AppException(ErrorCode.FRAME_INVALID_ID);
    }

    try {
      // Check if frame exists before deletion
      const existingFrame = await this.userInventoryService.getFrameById(id);
      if (!existingFrame) {
        throw new AppException(ErrorCode.FRAME_NOT_FOUND);
      }

      const deletedFrame = await this.userInventoryService.deleteFrame(id);
      if (!deletedFrame) {
        throw new AppException(ErrorCode.FRAME_NOT_FOUND);
      }
      
      return new ApiResponseWrapper({
        message: 'Frame deleted successfully',
        deletedFrame: {
          _id: deletedFrame._id.toString(),
          title: deletedFrame.title,
          icon_url: deletedFrame.icon_url,
          cost: deletedFrame.cost
        }
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.FRAME_NOT_FOUND);
    }
  }

  // ==================== USER INVENTORY ENDPOINTS ====================
  
  /**
   * Lấy thông tin inventory của user (điểm, frame, ...)
    private readonly userInventoryService: UserInventoryService
  ) {}

  /**
   * Lấy thông tin inventory của user (điểm, ...)
   */
  @Get()
  async getByUserId(@Req() req: any): Promise<ApiResponseWrapper<UserInventory[]>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const data = await this.userInventoryService.findByUserId(userId);
    return new ApiResponseWrapper(data);
  }

  /**
   * Tạo inventory record mới
   */
  @Post()
  async create(@Body() data: Partial<UserInventory>): Promise<ApiResponseWrapper<UserInventory>> {
    const result = await this.userInventoryService.create(data);
    return new ApiResponseWrapper(result);
  }
}
