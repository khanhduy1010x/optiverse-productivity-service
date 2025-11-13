import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspacePermission } from './workspace_permission.schema';
import { Workspace } from './workspace.schema';
import { WorkspaceNotePermission } from './wokspace_permission.note.schema';

@Injectable()
export class WorkspacePermissionService {
  constructor(
    @InjectModel('WorkspacePermission')
    private workspacePermissionModel: Model<WorkspacePermission>,
    @InjectModel('WorkspaceNotePermission')
    private workspaceNotePermissionModel: Model<WorkspaceNotePermission>,
    @InjectModel('Workspace')
    private workspaceModel: Model<Workspace>,
  ) {}

  /**
   * Tạo default permissions cho user mới trong workspace
   * @param workspaceId ID workspace
   * @param userId ID user
   * @param role 'admin' | 'user'
   */
  async createDefaultPermissions(
    workspaceId: string,
    userId: string,
    role: 'admin' | 'user' = 'user',
  ): Promise<void> {
    try {
      const existing = await this.workspacePermissionModel.findOne({
        workspace_id: new Types.ObjectId(workspaceId),
        user_id: new Types.ObjectId(userId),
      });

      if (!existing) {
        const actions = role === 'admin' ? ['ROOM_ADMIN'] : ['ROOM_USER'];

        await this.workspacePermissionModel.create({
          workspace_id: new Types.ObjectId(workspaceId),
          user_id: new Types.ObjectId(userId),
          actions,
        });
      }
    } catch (error) {
      console.error('Failed to create default permissions:', error);
    }
  }

  /**
   * Lấy quyền của user trong workspace
   */
  async getUserPermissions(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspacePermission | null> {
    return this.workspacePermissionModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
  }
  async getUserNotePermissions(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspacePermission | null> {
    return this.workspaceNotePermissionModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
  }

  /**
   * Kiểm tra user có quyền cụ thể không
   * Nếu user là chủ workspace thì luôn true
   */
  async hasPermission(
    workspaceId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    // Check if user is workspace owner
    const isOwner = await this.isWorkspaceOwner(workspaceId, userId);
    if (isOwner) {
      return true;
    }

    // Check if user has the specific action
    const permission = await this.getUserPermissions(workspaceId, userId);
    return permission ? permission.actions.includes(action) : false;
  }

  async hasPermissionNote(
    workspaceId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    // Check if user is workspace owner
    const isOwner = await this.isWorkspaceOwner(workspaceId, userId);
    if (isOwner) {
      return true;
    }

    // Check if user has the specific action
    const permission = await this.getUserNotePermissions(workspaceId, userId);
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Cập nhật quyền cho user
   */
  async updatePermissions(
    workspaceId: string,
    userId: string,
    actions: string[],
  ): Promise<WorkspacePermission | null> {
    return this.workspacePermissionModel.findOneAndUpdate(
      {
        workspace_id: new Types.ObjectId(workspaceId),
        user_id: new Types.ObjectId(userId),
      },
      { actions },
      { new: true },
    );
  }

  /**
   * Cập nhật note permissions cho user
   */
  async updateNotePermissions(
    workspaceId: string,
    userId: string,
    actions: string[],
  ): Promise<WorkspaceNotePermission | null> {
    return this.workspaceNotePermissionModel.findOneAndUpdate(
      {
        workspace_id: new Types.ObjectId(workspaceId),
        user_id: new Types.ObjectId(userId),
      },
      { actions },
      { new: true, upsert: true },
    );
  }

  /**
   * Xóa quyền của user
   */
  async deletePermissions(workspaceId: string, userId: string): Promise<void> {
    await this.workspacePermissionModel.deleteMany({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
  }

  /**
   * Lấy tất cả quyền của user trong workspace
   */
  async getUserWorkspacePermissions(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspacePermission | null> {
    return this.getUserPermissions(workspaceId, userId);
  }

  async isWorkspaceOwner(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const workspace = await this.workspaceModel.findById(
      new Types.ObjectId(workspaceId),
    );
    if (!workspace) {
      throw new BadRequestException('Workspace không tồn tại');
    }
    return workspace.owner_id.toString() === userId;
  }

  /**
   * Kiểm tra user có quyền quản lý phòng (duyệt request, điều khiển record, v.v.)
   * Với mô hình mới chỉ ROOM_ADMIN (hoặc chủ workspace) được phép quản lý.
   * Không dùng quyền này để bỏ qua cơ chế join của phòng.
   */
  async canManageRoom(workspaceId: string, userId: string): Promise<boolean> {
    const isOwner = await this.isWorkspaceOwner(workspaceId, userId);
    if (isOwner) {
      return true;
    }

    const permission = await this.getUserPermissions(workspaceId, userId);

    if (!permission) {
      return false;
    }

    return permission.actions.includes('ROOM_ADMIN');
  }

  /**
   * Kiểm tra user là room admin (có ROOM_ADMIN permission hoặc là workspace owner)
   */
  async isRoomAdmin(workspaceId: string, userId: string): Promise<boolean> {
    return this.canManageRoom(workspaceId, userId);
  }
}
