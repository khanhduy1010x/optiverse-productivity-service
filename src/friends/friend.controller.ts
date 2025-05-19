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
  
}
