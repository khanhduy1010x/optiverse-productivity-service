import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceTaskMemberPermission } from './workspace-task-member-permission.schema';
import { TaskPermissionType, TaskRolePreset, ROLE_PERMISSIONS } from './task-permission.enum';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskPermissionService {
  private logger = new Logger('WorkspaceTaskPermissionService');

  constructor(
    @InjectModel(WorkspaceTaskMemberPermission.name)
    private taskPermissionModel: Model<WorkspaceTaskMemberPermission>,
  ) {}

  /**
   * Grant permissions to a member for a task
   */
  async grantPermission(
    taskId: string,
    memberId: string,
    role: TaskRolePreset,
    grantedBy: string,
  ): Promise<WorkspaceTaskMemberPermission> {
    const permissions = ROLE_PERMISSIONS[role];

    const permission = await this.taskPermissionModel.findOneAndUpdate(
      {
        task_id: new Types.ObjectId(taskId),
        member_id: new Types.ObjectId(memberId),
      },
      {
        role,
        permissions,
        granted_by: new Types.ObjectId(grantedBy),
        is_owner: role === TaskRolePreset.OWNER,
      },
      { upsert: true, new: true },
    );

    this.logger.log(
      `[grantPermission] Member ${memberId} granted ${role} role for task ${taskId}`,
    );

    return permission;
  }

  /**
   * Transfer task ownership to another member
   */
  async transferOwnership(
    taskId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ): Promise<void> {
    // Remove owner status from current owner
    await this.taskPermissionModel.findOneAndUpdate(
      {
        task_id: new Types.ObjectId(taskId),
        member_id: new Types.ObjectId(currentOwnerId),
      },
      {
        is_owner: false,
        role: TaskRolePreset.ADMIN, // Demote to admin
        permissions: ROLE_PERMISSIONS[TaskRolePreset.ADMIN],
      },
    );

    // Set new owner
    await this.taskPermissionModel.findOneAndUpdate(
      {
        task_id: new Types.ObjectId(taskId),
        member_id: new Types.ObjectId(newOwnerId),
      },
      {
        is_owner: true,
        role: TaskRolePreset.OWNER,
        permissions: ROLE_PERMISSIONS[TaskRolePreset.OWNER],
      },
      { upsert: true, new: true },
    );

    this.logger.log(
      `[transferOwnership] Task ${taskId} ownership transferred from ${currentOwnerId} to ${newOwnerId}`,
    );
  }

  /**
   * Check if member has specific permission for task
   */
  async checkPermission(
    taskId: string,
    memberId: string,
    requiredPermission: TaskPermissionType,
  ): Promise<boolean> {
    const permission = await this.taskPermissionModel.findOne({
      task_id: new Types.ObjectId(taskId),
      member_id: new Types.ObjectId(memberId),
    });

    if (!permission) {
      return false;
    }

    return permission.permissions.includes(requiredPermission);
  }

  /**
   * Get member's role and permissions for a task
   */
  async getMemberPermissions(
    taskId: string,
    memberId: string,
  ): Promise<WorkspaceTaskMemberPermission | null> {
    return await this.taskPermissionModel.findOne({
      task_id: new Types.ObjectId(taskId),
      member_id: new Types.ObjectId(memberId),
    });
  }

  /**
   * Get all members with permissions for a task
   */
  async getTaskMembers(taskId: string): Promise<WorkspaceTaskMemberPermission[]> {
    return await this.taskPermissionModel.find({
      task_id: new Types.ObjectId(taskId),
    });
  }

  /**
   * Remove member's permissions for a task
   */
  async removePermission(taskId: string, memberId: string): Promise<void> {
    await this.taskPermissionModel.deleteOne({
      task_id: new Types.ObjectId(taskId),
      member_id: new Types.ObjectId(memberId),
    });

    this.logger.log(
      `[removePermission] Member ${memberId} permissions removed from task ${taskId}`,
    );
  }

  /**
   * Initialize default permissions when task is created
   * Creator gets OWNER role
   */
  async initializeTaskPermissions(
    taskId: string,
    createdBy: string,
  ): Promise<void> {
    await this.grantPermission(
      taskId,
      createdBy,
      TaskRolePreset.OWNER,
      createdBy,
    );
  }

  /**
   * Check multiple permissions
   */
  async hasAnyPermission(
    taskId: string,
    memberId: string,
    requiredPermissions: TaskPermissionType[],
  ): Promise<boolean> {
    const permission = await this.taskPermissionModel.findOne({
      task_id: new Types.ObjectId(taskId),
      member_id: new Types.ObjectId(memberId),
    });

    if (!permission) {
      return false;
    }

    return requiredPermissions.some((p) =>
      permission.permissions.includes(p),
    );
  }

  /**
   * Check if user can edit a task
   * Owner can always edit, others depend on permissions
   */
  async canEditTask(
    taskId: string,
    userId: string,
  ): Promise<boolean> {
    return this.hasAnyPermission(taskId, userId, [
      TaskPermissionType.EDIT_ALL,
      TaskPermissionType.EDIT_ASSIGNED,
      TaskPermissionType.EDIT_OWN,
    ]);
  }

  /**
   * Check if user can delete a task
   */
  async canDeleteTask(
    taskId: string,
    userId: string,
  ): Promise<boolean> {
    return this.hasAnyPermission(taskId, userId, [
      TaskPermissionType.DELETE_ALL,
      TaskPermissionType.DELETE_ASSIGNED,
      TaskPermissionType.DELETE_OWN,
    ]);
  }

  /**
   * Check if user can view a task
   */
  async canViewTask(
    taskId: string,
    userId: string,
  ): Promise<boolean> {
    return this.hasAnyPermission(taskId, userId, [
      TaskPermissionType.VIEW_ALL,
      TaskPermissionType.VIEW_ASSIGNED,
    ]);
  }
}
