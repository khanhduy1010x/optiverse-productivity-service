import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MarketplaceItemService } from './marketplace-item.service';
import { CreateMarketplaceItemDto } from './dto/request/create-marketplace-item.dto';
import { UpdateMarketplaceItemDto } from './dto/request/update-marketplace-item.dto';
import { PurchaseMarketplaceItemDto } from './dto/request/purchase-marketplace-item.dto';
import { MarketplaceItemType } from './marketplace-item.schema';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { MarketplaceItemResponseDto } from './dto/response/marketplace-item-response.dto';
import { PurchaseResponseDto } from './dto/response/purchase-response.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Controller('marketplace')
export class MarketplaceItemController {
  constructor(private readonly marketplaceItemService: MarketplaceItemService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: MarketplaceItemType,
  ): Promise<ApiResponseWrapper<{ items: MarketplaceItemResponseDto[]; total: number }>> {
    const result = await this.marketplaceItemService.findAll(page, limit, type);
    return new ApiResponseWrapper(result);
  }

  @Get('user/my-items')
  async findMyItems(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ items: MarketplaceItemResponseDto[]; total: number }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    
    const result = await this.marketplaceItemService.findByCreatorId(userId, page, limit);
    return new ApiResponseWrapper(result);
  }

  @Get('user/:creatorId')
  async findByCreatorId(
    @Param('creatorId') creatorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseWrapper<{ items: MarketplaceItemResponseDto[]; total: number }>> {
    const result = await this.marketplaceItemService.findByCreatorId(creatorId, page, limit);
    return new ApiResponseWrapper(result);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponseWrapper<MarketplaceItemResponseDto>> {
    const item = await this.marketplaceItemService.findById(id);
    return new ApiResponseWrapper(item);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Request() req,
    @Body() createDto: CreateMarketplaceItemDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponseWrapper<MarketplaceItemResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    
    const item = await this.marketplaceItemService.create(userId, createDto, files);
    return new ApiResponseWrapper(item);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateMarketplaceItemDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponseWrapper<MarketplaceItemResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    
    const item = await this.marketplaceItemService.update(id, userId, updateDto, files);
    return new ApiResponseWrapper(item);
  }

  @Delete(':id')
  async delete(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponseWrapper<{ success: boolean }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    
    const success = await this.marketplaceItemService.delete(id, userId);
    return new ApiResponseWrapper({ success });
  }

  @Post('purchase')
  async purchase(
    @Request() req,
    @Body() purchaseDto: PurchaseMarketplaceItemDto,
  ): Promise<ApiResponseWrapper<PurchaseResponseDto>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.marketplaceItemService.purchase(userId, purchaseDto);
    return new ApiResponseWrapper(result);
  }
}