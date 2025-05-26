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
import { FriendService } from './friend.service';
import { ApiResponse } from 'src/common/api-response';
import { FriendResponse } from './dto/response/FriendResponse.dto';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { Friend } from './friend.schema';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiBearerAuth('access-token')
@Controller('/friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @ApiParam({
    name: 'userId',
    type: String,
  })
  @Get('user/:userId')
  async getFriendsByUserID(@Param('userId') userId: string): Promise<ApiResponse<Friend[]>> {
    const friends = await this.friendService.getFriendsByUserID(userId);
    return new ApiResponse<Friend[]>(friends);
  }

  @ApiBody({ type: CreateFriendRequest })
  @Post('create')
  async createFriend(
    @Body() createFriendDto: CreateFriendRequest,
  ): Promise<ApiResponse<FriendResponse>> {
    const friend = await this.friendService.createFriend(createFriendDto);
    return new ApiResponse<FriendResponse>(friend);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateFriendRequest })
  @Put('update/:id')
  async updateFriend(
    @Param('id') friendId: string,
    @Body() updateFriendDto: UpdateFriendRequest,
  ): Promise<ApiResponse<FriendResponse>> {
    const friend = await this.friendService.updateFriend(friendId, updateFriendDto);
    return new ApiResponse<FriendResponse>(friend);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('delete/:id')
  async deleteFriend(@Param('id') friendId: string): Promise<ApiResponse<void>> {
    await this.friendService.deleteFriend(friendId);
    return new ApiResponse<void>();
  }

  @ApiParam({
    name: 'email',
    type: String,
  })
  @Get('public/search-user/:email')
  async searchUserByEmail(@Param('email') email: string): Promise<ApiResponse<any>> {
    const user = await this.friendService.searchUserByEmail(email);
    return new ApiResponse(user);
  }

  @ApiParam({
    name: 'friendId',
    type: String,
  })
  @Post('add/:friendId')
  async addFriend(
    @Request() req,
    @Param('friendId') friendId: string,
  ): Promise<ApiResponse<Friend>> {
    const user = req.userInfo as UserDto;

    const friend = await this.friendService.addFriend(user.userId, friendId);
    return new ApiResponse(friend);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Put('accept/:id')
  async acceptFriend(@Param('id') id: string): Promise<ApiResponse<Friend>> {
    const updatedFriend = await this.friendService.acceptFriend(id);
    return new ApiResponse(updatedFriend);
  }

  @Get('view-all/pending')
  async viewAllPending(@Request() req): Promise<ApiResponse<Friend[]>> {
    const user = req.userInfo as UserDto;

    const friends = await this.friendService.viewAllPending(user.userId.toString());
    return new ApiResponse(friends);
  }

  @ApiParam({
    name: 'userId',
    type: String,
  })
  @Get('view-all/:userId')
  async viewAllFriends(@Param('userId') userId: string): Promise<ApiResponse<Friend[]>> {
    const friends = await this.friendService.viewAllFriends(userId);
    return new ApiResponse(friends);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async removeFriend(@Param('id') id: string): Promise<ApiResponse<Friend>> {
    const removed = await this.friendService.removeFriend(id);
    return new ApiResponse(removed);
  }
}
