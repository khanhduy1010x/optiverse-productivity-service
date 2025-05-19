import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { Friend } from './friend.schema';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { FriendResponse } from './dto/response/FriendResponse.dto';
import { UserDto } from 'src/user-dto/user.dto';

@Injectable()
export class FriendService {
  
}
