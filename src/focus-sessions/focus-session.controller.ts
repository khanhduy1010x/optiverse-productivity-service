import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FocusSessionService } from './focus-session.service';
import { ApiResponse } from 'src/common/api-response';
import { FocusSessionResponse } from './dto/response/FocusSessionResponse.dto';
import { CreateFocusSessionRequest } from './dto/request/CreateFocusSessionRequest.dto';
import { UpdateFocusSessionRequest } from './dto/request/UpdateFocusSessionRequest.dto';
import { FocusSession } from './focus-session.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/focus-session')
export class FocusSessionController {
  constructor(private readonly focusSessionService: FocusSessionService) {}

  @Get('')
  async getFocusSessionsByUserID(@Request() req): Promise<ApiResponse<FocusSession[]>> {
    const user = req.userInfo as UserDto;
    const focusSessions = await this.focusSessionService.getFocusSessionsByUserID(user.userId);
    return new ApiResponse<FocusSession[]>(focusSessions);
  }

  @ApiBody({ type: CreateFocusSessionRequest })
  @Post('')
  async createFocusSession(
    @Request() req,
    @Body() createFocusSessionDto: CreateFocusSessionRequest,
  ): Promise<ApiResponse<FocusSessionResponse>> {
    const user = req.userInfo as UserDto;
    const focusSession = await this.focusSessionService.createFocusSession(
      user.userId,
      createFocusSessionDto,
    );
    return new ApiResponse<FocusSessionResponse>(focusSession);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteFocusSession(@Param('id') focusSessionId: string): Promise<ApiResponse<void>> {
    await this.focusSessionService.deleteFocusSession(focusSessionId);
    return new ApiResponse<void>(null);
  }
}
