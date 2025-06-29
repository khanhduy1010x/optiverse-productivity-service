import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Share, ShareDocument, SharedUser } from './share.schema';

@Injectable()
export class ShareRepository {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<ShareDocument>,
  ) {}

  async findShareByResourceId(
    resourceType: string,
    resourceId: string,
  ): Promise<Share | null> {
    return await this.shareModel
      .findOne({
        resource_type: resourceType,
        resource_id: new Types.ObjectId(resourceId),
      })
      .exec();
  }

  async createShare(
    ownerId: string,
    resourceType: string,
    resourceId: string,
    users: { user_id: string; permission: string }[],
  ): Promise<Share> {
    const sharedUsers: SharedUser[] = users.map((user) => ({
      user_id: new Types.ObjectId(user.user_id),
      permission: user.permission,
      shared_at: new Date(),
    }));

    const share = new this.shareModel({
      owner_id: new Types.ObjectId(ownerId),
      resource_type: resourceType,
      resource_id: new Types.ObjectId(resourceId),
      shared_with: sharedUsers,
    });

    return await share.save();
  }

  async updateShare(
    shareId: string,
    users: { user_id: string; permission: string }[],
  ): Promise<Share | null> {
    const sharedUsers: SharedUser[] = users.map((user) => ({
      user_id: new Types.ObjectId(user.user_id),
      permission: user.permission,
      shared_at: new Date(),
    }));

    return await this.shareModel
      .findByIdAndUpdate(
        shareId,
        { $set: { shared_with: sharedUsers } },
        { new: true },
      )
      .exec();
  }

  async addUsersToShare(
    shareId: string,
    users: { user_id: string; permission: string }[],
  ): Promise<Share | null> {
    const sharedUsers: SharedUser[] = users.map((user) => ({
      user_id: new Types.ObjectId(user.user_id),
      permission: user.permission,
      shared_at: new Date(),
    }));

    return await this.shareModel
      .findByIdAndUpdate(
        shareId,
        { $push: { shared_with: { $each: sharedUsers } } },
        { new: true },
      )
      .exec();
  }

  async removeUserFromShare(
    shareId: string,
    userId: string,
  ): Promise<Share | null> {
    return await this.shareModel
      .findByIdAndUpdate(
        shareId,
        { $pull: { shared_with: { user_id: new Types.ObjectId(userId) } } },
        { new: true },
      )
      .exec();
  }

  async deleteShare(shareId: string): Promise<void> {
    await this.shareModel.findByIdAndDelete(shareId).exec();
  }

  async getSharesSharedWithUser(userId: string): Promise<Share[]> {
    return await this.shareModel
      .find({
        'shared_with.user_id': new Types.ObjectId(userId),
      })
      .exec();
  }

  async getSharesByOwnerId(ownerId: string): Promise<Share[]> {
    return await this.shareModel
      .find({
        owner_id: new Types.ObjectId(ownerId),
      })
      .exec();
  }

  async findShareByResourceIdAndUserId(
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<Share | null> {
    return await this.shareModel
      .findOne({
        resource_type: resourceType,
        resource_id: new Types.ObjectId(resourceId),
        'shared_with.user_id': new Types.ObjectId(userId),
      })
      .exec();
  }
}
