import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { MarketplaceFollowerService } from './marketplace-follower.service';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Controller('marketplace/followers')
export class MarketplaceFollowerController {
  constructor(private readonly followerService: MarketplaceFollowerService) {}

  /**
   * Toggle follow (follow/unfollow)
   */
  @Post('toggle')
  async toggleFollow(
    @Request() req,
    @Body('creator_id') creatorId: string,
  ): Promise<ApiResponseWrapper<{ isFollowing: boolean; message: string }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.followerService.toggleFollow(userId, creatorId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Kiểm tra đã follow creator chưa
   */
  @Get('check/:creatorId')
  async checkFollowing(
    @Request() req,
    @Param('creatorId') creatorId: string,
  ): Promise<ApiResponseWrapper<{ isFollowing: boolean }>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.followerService.isFollowing(userId, creatorId);
    return new ApiResponseWrapper(result);
  }

  /**
   * Lấy danh sách creators mà user đang follow
   */
  @Get('following')
  async getFollowingList(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
    @Query('search') search: string = '',
  ): Promise<ApiResponseWrapper<any>> {
    const userId = req.userInfo?.userId;
    if (!userId) {
      throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    const result = await this.followerService.getFollowingList(userId, page, limit, search);
    return new ApiResponseWrapper(result);
  }
}
