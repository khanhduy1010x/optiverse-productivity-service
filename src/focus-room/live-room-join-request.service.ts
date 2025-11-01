import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LiveRoomJoinRequest,
  LiveRoomJoinRequestDocument,
  JoinRequestStatus,
} from './schemas/live-room-join-request.schema';
import {
  LiveRoomMember,
  LiveRoomMemberDocument,
  MemberRole,
  MemberStatus,
} from './schemas/live-room-member.schema';
import { UserHttpClient } from '../http-axios/user-http.client';

@Injectable()
export class LiveRoomJoinRequestService {
  constructor(
    @InjectModel(LiveRoomJoinRequest.name)
    private joinRequestModel: Model<LiveRoomJoinRequestDocument>,
    @InjectModel(LiveRoomMember.name)
    private memberModel: Model<LiveRoomMemberDocument>,
    private userHttpClient: UserHttpClient,
  ) {}

  async createJoinRequest(
    roomId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<LiveRoomJoinRequestDocument> {
    const existing = await this.joinRequestModel.findOne({
      room_id: new Types.ObjectId(roomId),
      user_id: new Types.ObjectId(userId),
      status: JoinRequestStatus.PENDING,
    });

    if (existing) {
      return existing;
    }

    const joinRequest = new this.joinRequestModel({
      room_id: new Types.ObjectId(roomId),
      user_id: new Types.ObjectId(userId),
      status: JoinRequestStatus.PENDING,
      requested_at: new Date(),
    });

    return joinRequest.save();
  }

  async getPendingRequests(roomId: string | Types.ObjectId): Promise<any[]> {
    const requests = await this.joinRequestModel
      .find({
        room_id: new Types.ObjectId(roomId),
        status: JoinRequestStatus.PENDING,
      })
      .sort({ createdAt: -1 })
      .exec();

    // Get user IDs and fetch user info from core service
    const userIds = requests.map((r) => r.user_id.toString());
    const usersData = await this.userHttpClient.getUsersByIds(userIds);

    // Map requests with user data
    return requests.map((request) => {
      const user = usersData.find(
        (u) => u.user_id === request.user_id.toString(),
      );

      return {
        _id: request._id,
        room_id: request.room_id,
        user_id: request.user_id,
        user: user || null,
        status: request.status,
        created_at: request.createdAt,
        updated_at: request.updatedAt,
      };
    });
  }

  async approveRequest(
    requestId: string | Types.ObjectId,
    respondedBy: string | Types.ObjectId,
  ): Promise<LiveRoomJoinRequestDocument | null> {
    const request = await this.joinRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          status: JoinRequestStatus.ACCEPTED,
          responded_by: new Types.ObjectId(respondedBy),
          responded_at: new Date(),
        },
        { new: true },
      )
      .exec();

    if (request) {
      // Add user to member list
      await this.memberModel.findOneAndUpdate(
        {
          room_id: request.room_id,
          user_id: request.user_id,
        },
        {
          room_id: request.room_id,
          user_id: request.user_id,
          role: MemberRole.MEMBER,
          status: MemberStatus.JOINED,
          joined_at: new Date(),
        },
        { upsert: true, new: true },
      );

      // Delete the join request after approval
      await this.joinRequestModel.findByIdAndDelete(requestId).exec();
    }

    return request;
  }

  async rejectRequest(
    requestId: string | Types.ObjectId,
    respondedBy: string | Types.ObjectId,
    reason?: string,
  ): Promise<LiveRoomJoinRequestDocument | null> {
    const request = await this.joinRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          status: JoinRequestStatus.REJECTED,
          responded_by: new Types.ObjectId(respondedBy),
          rejection_reason: reason,
          responded_at: new Date(),
        },
        { new: true },
      )
      .exec();

    if (request) {
      // Delete the join request after rejection
      await this.joinRequestModel.findByIdAndDelete(requestId).exec();
    }

    return request;
  }

  async getUserRequestStatus(
    roomId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<JoinRequestStatus | null> {
    const request = await this.joinRequestModel.findOne({
      room_id: new Types.ObjectId(roomId),
      user_id: new Types.ObjectId(userId),
    });

    return request?.status || null;
  }
}
