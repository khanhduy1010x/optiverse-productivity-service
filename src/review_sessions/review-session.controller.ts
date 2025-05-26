import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewSessionService } from './review-session.service';
import { ApiResponse } from 'src/common/api-response';
import { ReviewSessionResponse } from './dto/response/ReviewSessionResponse.dto';

import { ReviewRequestDto } from './dto/request/ReviewRequest.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/review-session')
export class ReviewSessionController {
  constructor(private readonly reviewSessionService: ReviewSessionService) {}

  @Post('review')
  async reviewFlashcard(
    @Req() req,
    @Body() dto: ReviewRequestDto,
  ): Promise<ApiResponse<ReviewSessionResponse>> {
    const user = req.userInfo as UserDto;
    const userId = user.userId;
    const result = await this.reviewSessionService.reviewFlashcard(userId, dto);
    return new ApiResponse(result);
  }

  @Get('user')
  async getReviewSessionsByUserID(
    @Req() req,
  ): Promise<ApiResponse<ReviewSessionResponse[]>> {
    const user = req.userInfo as UserDto;
    const userId = user.userId;
    const sessions =
      await this.reviewSessionService.getReviewSessionsByUserID(userId);
    const result = sessions.map((s) => new ReviewSessionResponse(s));
    return new ApiResponse(result);
  }
}
