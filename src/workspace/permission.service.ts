import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceRepository } from './workspace.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { WorkspacePermissionService } from './workspace-permission.service';

export enum Permission {
  RENAME_WORKSPACE = 'RENAME_WORKSPACE',
  EDIT_DESCRIPTION = 'EDIT_DESCRIPTION',
  MANAGE_PASSWORD = 'MANAGE_PASSWORD',
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  ACCEPT_MEMBER = 'ACCEPT_MEMBER',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS', // ✅ quyền meta: được phép cấp quyền cho người khác
  room_admin = 'room_admin', // ✅ quyền quản lý room (workspace permission)
  room_user = 'room_user', // ✅ quyền sử dụng room (workspace permission)
  room_permission = 'room_permission', // ✅ toggle permission for room (frontend only)
}

@Injectable()
export class PermissionService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspacePermissionService: WorkspacePermissionService,
  ) {}

  /**
   * Check if user has specific permission in workspace
   */
  async checkPermission(
    workspaceId: string,
    userId: string,
    permission: Permission,
  ): Promise<void> {
    // Get workspace to check if user is owner
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);

    // Owner has all permissions
    if (workspace.owner_id.toString() === userId) {
      return;
    }

    // Get user's membership
    const member = await this.workspaceRepository.getMember(
      workspaceId,
      userId,
    );

    if (!member) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (member.status === 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Check if user has the specific permission
    if (!member.permissions.includes(permission)) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * Check if user is admin (has admin role or is owner)
   */
  async checkAdminRole(workspaceId: string, userId: string): Promise<void> {
    // Get workspace to check if user is owner
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);

    // Owner is always admin
    if (workspace.owner_id.toString() === userId) {
      return;
    }

    // Get user's membership
    const member = await this.workspaceRepository.getMember(
      workspaceId,
      userId,
    );

    if (!member) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (member.status === 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Check if user has admin role
    if (member.role !== 'admin') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * Check if user has MANAGE_MEMBERS permission (for ban/unban/role updates)
   */
  async checkManageMembersPermission(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.checkPermission(workspaceId, userId, Permission.MANAGE_MEMBERS);
  }

  /**
   * Check if user has ACCEPT_MEMBER permission (for approving/rejecting join requests)
   */
  async checkAcceptMemberPermission(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.checkPermission(workspaceId, userId, Permission.ACCEPT_MEMBER);
  }

  /**
   * Check if user has MANAGE_PERMISSIONS permission (for granting/revoking permissions)
   * Only owner or users with MANAGE_PERMISSIONS can manage permissions
   * Only owner can grant MANAGE_PERMISSIONS to others
   */
  async checkManagePermissionsPermission(
    workspaceId: string,
    userId: string,
    targetPermission?: Permission,
  ): Promise<void> {
    // Get workspace to check if user is owner
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);

    // Owner has all permissions
    if (workspace.owner_id.toString() === userId) {
      return;
    }

    // If trying to grant MANAGE_PERMISSIONS, only owner can do it
    if (targetPermission === Permission.MANAGE_PERMISSIONS) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // For other permissions, check if user has MANAGE_PERMISSIONS
    await this.checkPermission(
      workspaceId,
      userId,
      Permission.MANAGE_PERMISSIONS,
    );
  }

  /**
   * Check if user is admin or owner (for inviting users)
   * Only admin (not banned) or owner can invite users - no specific permission required
   */
  async checkAdminOrOwnerPermission(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    // Get workspace to check if user is owner
    const workspace =
      await this.workspaceRepository.getWorkspaceById(workspaceId);
    if (workspace.owner_id.toString() === userId) {
      return; // Owner can always invite
    }

    // Check if user is an admin member and not banned
    const member = await this.workspaceRepository.getMember(
      workspaceId,
      userId,
    );

    if (!member) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (member.status === 'banned') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    if (member.role !== 'admin') {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * Tạo default permissions cho user mới vào workspace
   * @param workspaceId ID workspace
   * @param userId ID user được thêm vào
   * @param role 'admin' | 'user' (từ member role)
   */
  async createDefaultPermissions(
    workspaceId: string,
    userId: string,
    role: 'admin' | 'user' = 'user',
  ): Promise<void> {
    await this.workspacePermissionService.createDefaultPermissions(
      workspaceId,
      userId,
      role,
    );
  }
}
