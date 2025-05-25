import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from './friend.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateFriendRequest } from './dto/request/CreateFriendRequest.dto';
import { UpdateFriendRequest } from './dto/request/UpdateFriendRequest.dto';
import { UserDto } from 'src/user-dto/user.dto';
import { UserHttpClient } from 'src/http-axios/user-http.client';

@Injectable()
export class FriendRepository {
  constructor(
    @InjectModel(Friend.name) private readonly friendModel: Model<Friend>,
    private readonly userHttpClient: UserHttpClient

  ) {}

  async getFriendsByUserID(userId: string): Promise<Friend[]> {
    return await this.friendModel.find({ user_id: new Types.ObjectId(userId) }).exec();
  }

  async createFriend(createFriendDto: CreateFriendRequest): Promise<Friend> {
    const newFriend = new this.friendModel({
      ...createFriendDto,
      user_id: new Types.ObjectId(createFriendDto.user_id),
      friend_id: new Types.ObjectId(createFriendDto.friend_id),
    });
    return await newFriend.save();
  }

  async updateFriend(friend_id: string, updateFriendDto: UpdateFriendRequest): Promise<Friend> {
    return await this.friendModel
      .findByIdAndUpdate(friend_id, updateFriendDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteFriend(friend_id: string): Promise<void> {
    const result = await this.friendModel.deleteOne({ _id: friend_id }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async searchUserByEmail(email: string): Promise<UserDto | null> {
    const response = await this.userHttpClient.getUser(email);
    if (response.data.code != 1000) {
      return response.data as UserDto;
    } else {
      console.log('User not found');
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }


  

  async addFriend(user_id: string, friend_id: string): Promise<Friend | null> {
    return this.friendModel.create({ user_id, friend_id, status: 'pending' });
  }

  async acceptFriend(id: string): Promise<Friend | null> {
    return this.friendModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        { status: 'accepted' },
        { new: true },
      )
      .exec();
  }

  async viewAllFriends(user_id: string): Promise<Friend[]> {
    return this.friendModel
      .find({ user_id: new Types.ObjectId(user_id), status: 'accepted' })
      .exec();
  }

  async viewAllPending(user_id: string): Promise<Friend[]> {
    return this.friendModel
      .find({ friend_id: new Types.ObjectId(user_id), status: 'pending' })
      .exec();
  }

  async removeFriend(id: string): Promise<Friend | null> {
    return this.friendModel.findOneAndDelete({ _id: id }).exec();
  }
}
