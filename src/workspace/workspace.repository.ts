import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from './workspace.schema';
import { WorkspaceMember } from './workspace-member.schema';
import { WorkspaceJoinRequest } from './workspace-join-request.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceRepository {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<Workspace>,
    @InjectModel(WorkspaceMember.name)
    private readonly workspaceMemberModel: Model<WorkspaceMember>,
    @InjectModel(WorkspaceJoinRequest.name)
    private readonly workspaceJoinRequestModel: Model<WorkspaceJoinRequest>,
  ) {}

  // ========== Workspace Methods ==========
  async createWorkspace(
    ownerId: string,
    name: string,
    description: string,
    password?: string,
  ): Promise<Workspace> {
    const inviteCode = this.generateInviteCode();
    const workspaceData: any = {
      name,
      description,
      owner_id: new Types.ObjectId(ownerId),
      invite_code: inviteCode,
      member_count: 1,
    };

    if (password) {
      workspaceData.password = password;
    }

    const newWorkspace = new this.workspaceModel(workspaceData);
    return await newWorkspace.save();
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException(`Invalid workspace id: ${workspaceId}`);
    }

    return await this.workspaceModel
      .findById(new Types.ObjectId(workspaceId))
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async getWorkspaceByInviteCode(inviteCode: string): Promise<Workspace> {
    return await this.workspaceModel
      .findOne({ invite_code: inviteCode })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async getWorkspacesByOwner(ownerId: string): Promise<Workspace[]> {
    return await this.workspaceModel.find({
      owner_id: new Types.ObjectId(ownerId),
    });
  }

  async updateWorkspace(
    workspaceId: string,
    updateData: Partial<Workspace>,
  ): Promise<Workspace> {
    return await this.workspaceModel
      .findByIdAndUpdate(new Types.ObjectId(workspaceId), updateData, {
        new: true,
      })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel
      .findByIdAndDelete(workspaceId)
      .exec();
    if (!workspace) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return workspace;
  }

  async incrementMemberCount(workspaceId: string): Promise<void> {
    await this.workspaceModel.findByIdAndUpdate(
      new Types.ObjectId(workspaceId),
      { $inc: { member_count: 1 } },
    );
  }

  async decrementMemberCount(workspaceId: string): Promise<void> {
    await this.workspaceModel.findByIdAndUpdate(
      new Types.ObjectId(workspaceId),
      { $inc: { member_count: -1 } },
    );
  }

  // ========== WorkspaceMember Methods ==========
  async addMember(
    workspaceId: string,
    userId: string,
    role: string = 'user',
    permissions: string[] = [],
  ): Promise<WorkspaceMember> {
    // Set default permissions based on role if not provided
    const defaultPermissions =
      permissions.length > 0 ? permissions : this.getDefaultPermissions(role);

    const newMember = new this.workspaceMemberModel({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
      role,
      permissions: defaultPermissions,
      status: 'active',
      joined_at: new Date(),
    });
    return await newMember.save();
  }

  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['ACCEPT_MEMBER'];
      case 'user':
      default:
        return []; // Regular users have no special permissions by default
    }
  }

  async addListMembers(
    workspaceId: string,
    userIds: string[],
    role: string = 'user',
  ): Promise<WorkspaceMember[]> {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const existingMembers = await this.workspaceMemberModel
      .find({ workspace_id: workspaceObjectId, user_id: { $in: userIds } })
      .select('user_id')
      .lean();
    if (!existingMembers) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const existingUserIds = new Set(
      existingMembers.map((m) => m.user_id.toString()),
    );

    const newMembers = userIds
      .filter((id) => !existingUserIds.has(id))
      .map((userId) => ({
        workspace_id: workspaceObjectId,
        user_id: new Types.ObjectId(userId),
        role,
        status: 'active',
        joined_at: new Date(),
      }));

    if (newMembers.length === 0) return [];

    const insertedMembers = await this.workspaceMemberModel.insertMany(
      newMembers,
      { ordered: false },
    );

    await this.workspaceModel.findByIdAndUpdate(workspaceObjectId, {
      $inc: { member_count: insertedMembers.length },
    });

    return insertedMembers;
  }

  async getMembersByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return await this.workspaceMemberModel.find({
      workspace_id: new Types.ObjectId(workspaceId),
    });
  }

  async getWorkspacesByUser(userId: string): Promise<WorkspaceMember[]> {
    return await this.workspaceMemberModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('workspace_id');
  }

  async getMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    return await this.workspaceMemberModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: string,
  ): Promise<WorkspaceMember> {
    // Get default permissions for the new role
    const permissions = this.getDefaultPermissions(role);

    return await this.workspaceMemberModel
      .findOneAndUpdate(
        {
          workspace_id: new Types.ObjectId(workspaceId),
          user_id: new Types.ObjectId(userId),
        },
        { role, permissions },
        { new: true },
      )
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateMemberPermissions(
    workspaceId: string,
    userId: string,
    permissions: string[],
  ): Promise<WorkspaceMember> {
    return await this.workspaceMemberModel
      .findOneAndUpdate(
        {
          workspace_id: new Types.ObjectId(workspaceId),
          user_id: new Types.ObjectId(userId),
        },
        { permissions },
        { new: true },
      )
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateMemberStatus(
    workspaceId: string,
    userId: string,
    status: string,
  ): Promise<WorkspaceMember> {
    return await this.workspaceMemberModel
      .findOneAndUpdate(
        {
          workspace_id: new Types.ObjectId(workspaceId),
          user_id: new Types.ObjectId(userId),
        },
        { status },
        { new: true },
      )
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async removeMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember> {
    const member = await this.workspaceMemberModel.findOneAndDelete({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
    if (!member) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return member;
  }

  // ========== WorkspaceJoinRequest Methods ==========
  async createJoinRequest(
    workspaceId: string,
    targetUserId: string,
    requesterId: string,
    type: 'invite' | 'request',
    message?: string,
  ): Promise<WorkspaceJoinRequest> {
    const newRequest = new this.workspaceJoinRequestModel({
      workspace_id: new Types.ObjectId(workspaceId),
      target_user_id: new Types.ObjectId(targetUserId),
      requester_id: new Types.ObjectId(requesterId),
      type,
      message,
      status: 'pending',
    });
    return await newRequest.save();
  }

  async getJoinRequestsByWorkspace(
    workspaceId: string,
    status?: string,
  ): Promise<WorkspaceJoinRequest[]> {
    const query: any = { workspace_id: new Types.ObjectId(workspaceId) };
    if (status) {
      query.status = status;
    }
    return await this.workspaceJoinRequestModel.find(query);
  }

  async getJoinRequestsByUser(userId: string): Promise<WorkspaceJoinRequest[]> {
    return await this.workspaceJoinRequestModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('workspace_id');
  }

  async getInvitationsByUser(userId: string): Promise<WorkspaceJoinRequest[]> {
    return await this.workspaceJoinRequestModel.find({
      target_user_id: new Types.ObjectId(userId),
      type: 'invite',
    });
  }

  async getJoinRequestByUserAndWorkspace(
    workspaceId: string,
    userId: string,
    type: string,
  ): Promise<WorkspaceJoinRequest | null> {
    return await this.workspaceJoinRequestModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      requester_id: new Types.ObjectId(userId),
      type: type,
    });
  }

  async getRequestsByUser(userId: string): Promise<WorkspaceJoinRequest[]> {
    return await this.workspaceJoinRequestModel.find({
      requester_id: new Types.ObjectId(userId),
      type: 'request',
    });
  }

  async getJoinRequest(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceJoinRequest | null> {
    return await this.workspaceJoinRequestModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      target_user_id: new Types.ObjectId(userId),
    });
  }

  async getJoinRequestById(
    requestId: string,
  ): Promise<WorkspaceJoinRequest | null> {
    return await this.workspaceJoinRequestModel.findById(requestId);
  }

  async updateJoinRequestStatus(
    requestId: string,
    status: string,
  ): Promise<WorkspaceJoinRequest> {
    return await this.workspaceJoinRequestModel
      .findByIdAndUpdate(
        new Types.ObjectId(requestId),
        { status },
        { new: true },
      )
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteJoinRequest(requestId: string): Promise<WorkspaceJoinRequest> {
    const request = await this.workspaceJoinRequestModel
      .findByIdAndDelete(requestId)
      .exec();
    if (!request) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return request;
  }

  // ========== Helper Methods ==========
  private generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}
