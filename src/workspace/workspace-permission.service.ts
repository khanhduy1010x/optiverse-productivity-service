import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspacePermission } from './workspace_permission.schema';
import { Workspace } from './workspace.schema';

@Injectable()
export class WorkspacePermissionService {
  constructor(
    @InjectModel('WorkspacePermission')
    private workspacePermissionModel: Model<WorkspacePermission>,
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
    const modules = [
      'task',
      'flashcard',
      'note',
      'schedule',
      'chat',
      'blog',
      'live_room',
    ];

    try {
      for (const module of modules) {
        const existing = await this.workspacePermissionModel.findOne({
          workspace_id: new Types.ObjectId(workspaceId),
          user_id: new Types.ObjectId(userId),
          module,
        });

        if (!existing) {
          let actions: string[] = [];

          if (role === 'admin') {
            if (module === 'live_room') {
              actions = ['ROOM_ADMIN'];
            } else {
              actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
            }
          } else {
            if (module === 'live_room') {
              actions = ['ROOM_USER'];
            } else {
              actions = ['READ'];
            }
          }

          await this.workspacePermissionModel.create({
            workspace_id: new Types.ObjectId(workspaceId),
            user_id: new Types.ObjectId(userId),
            module,
            actions,
          });
        }
      }
    } catch (error) {
      console.error('Failed to create default permissions:', error);
    }
  }

  /**
   * Lấy quyền của user với module cụ thể trong workspace
   */
  async getUserModulePermissions(
    workspaceId: string,
    userId: string,
    module: string,
  ): Promise<WorkspacePermission | null> {
    return this.workspacePermissionModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
      module,
    });
  }

  /**
   * Kiểm tra user có quyền cụ thể không
   */
  async hasPermission(
    workspaceId: string,
    userId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    const permission = await this.getUserModulePermissions(
      workspaceId,
      userId,
      module,
    );
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Cập nhật quyền cho user
   */
  async updatePermissions(
    workspaceId: string,
    userId: string,
    module: string,
    actions: string[],
  ): Promise<WorkspacePermission | null> {
    return this.workspacePermissionModel.findOneAndUpdate(
      {
        workspace_id: new Types.ObjectId(workspaceId),
        user_id: new Types.ObjectId(userId),
        module,
      },
      { actions },
      { new: true },
    );
  }

  /**
   * Xóa quyền của user
   */
  async deletePermissions(
    workspaceId: string,
    userId: string,
    module?: string,
  ): Promise<void> {
    const query: any = {
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    };

    if (module) {
      query.module = module;
    }

    await this.workspacePermissionModel.deleteMany(query);
  }

  /**
   * Lấy tất cả quyền của user trong workspace
   */
  async getUserWorkspacePermissions(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspacePermission[]> {
    return this.workspacePermissionModel.find({
      workspace_id: new Types.ObjectId(workspaceId),
      user_id: new Types.ObjectId(userId),
    });
  }

  async isWorkspaceOwner(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const workspace = await this.workspaceModel.findById(workspaceId);
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

    const permission = await this.getUserModulePermissions(
      workspaceId,
      userId,
      'live_room',
    );

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
