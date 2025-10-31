import { Injectable, Logger } from '@nestjs/common';
import { WorkspaceTaskRepository } from './workspace-task.repository';
import { PermissionService } from 'src/workspace/permission.service';
import { WorkspaceTaskPermissionService } from './workspace-task-permission.service';
import { WorkspaceTask } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { TaskRolePreset } from './task-permission.enum';

@Injectable()
export class WorkspaceTaskService {
  private logger = new Logger('WorkspaceTaskService');

  constructor(
    private readonly taskRepository: WorkspaceTaskRepository,
    private readonly permissionService: PermissionService,
    private readonly taskPermissionService: WorkspaceTaskPermissionService,
  ) {}

  // ========== Task CRUD ==========
  async createTask(
    workspaceId: string,
    userId: string,
    title: string,
    description?: string,
    assignedTo?: string,
    endTime?: string,
    assignedToList?: string[],
  ): Promise<WorkspaceTask> {
    this.logger.log(`[createTask] Starting - workspaceId: ${workspaceId}, userId: ${userId}, title: ${title}, endTime: ${endTime}`);
    
    // Check if user has permission to create task in workspace
    try {
      await this.permissionService.checkAdminRole(workspaceId, userId);
      this.logger.log(`[createTask] User is admin`);
    } catch (error) {
      // Allow members to create tasks, but admins have priority
      this.logger.log(`[createTask] User is not admin, but allowing as member`);
    }

    const task = await this.taskRepository.createTask(
      workspaceId,
      title,
      description,
      userId,
      assignedTo,
      endTime,
      assignedToList,
    );
    this.logger.log(`[createTask] Task created: ${task._id}`);
    return task;
  }

  async getTaskById(taskId: string): Promise<WorkspaceTask> {
    return await this.taskRepository.getTaskById(taskId);
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    this.logger.log(`[getTasksByWorkspace] Fetching tasks for workspace: ${workspaceId}`);
    const tasks = await this.taskRepository.getTasksByWorkspace(workspaceId);
    this.logger.log(`[getTasksByWorkspace] Found ${tasks.length} tasks`);
    return tasks;
  }

  async getTasksByStatus(
    workspaceId: string,
    status: string,
  ): Promise<WorkspaceTask[]> {
    return await this.taskRepository.getTasksByStatus(workspaceId, status);
  }

  /**
   * Check if user can edit/update a task
   * Owner can edit any task, Member can only edit if assigned to them
   */
  private async canUserEditTask(
    taskId: string,
    userId: string,
  ): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) return false;

    // Check if user is workspace owner
    let isOwner = false;
    try {
      await this.permissionService.checkAdminRole(
        task.workspace_id.toString(),
        userId,
      );
      isOwner = true;
    } catch (error) {
      isOwner = false;
    }

    // Owner can edit any task
    if (isOwner) return true;

    // Member can only edit task if assigned to them
    const isAssigned =
      (task.assigned_to?.toString() === userId) ||
      (task.assigned_to_list?.some(id => id.toString() === userId) ?? false);

    return isAssigned;
  }

  /**
   * Check if user can delete a task
   * Owner can delete any task, Member can only delete if assigned to them or if they created it
   */
  private async canUserDeleteTask(
    taskId: string,
    userId: string,
  ): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) return false;

    // Check if user is workspace owner
    let isOwner = false;
    try {
      await this.permissionService.checkAdminRole(
        task.workspace_id.toString(),
        userId,
      );
      isOwner = true;
    } catch (error) {
      isOwner = false;
    }

    // Owner can delete any task
    if (isOwner) return true;

    // Member can delete if created by them or assigned to them
    const isCreator = task.created_by.toString() === userId;
    const isAssigned =
      (task.assigned_to?.toString() === userId) ||
      (task.assigned_to_list?.some(id => id.toString() === userId) ?? false);

    return isCreator || isAssigned;
  }

  async updateTask(
    taskId: string,
    userId: string,
    updateData: Partial<WorkspaceTask>,
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[updateTask] Starting update for task ${taskId} by user ${userId}`);
      this.logger.debug(`[updateTask] Update data keys:`, Object.keys(updateData));

      // Get current task
      const task = await this.taskRepository.getTaskById(taskId);
      if (!task) {
        this.logger.error(`[updateTask] Task not found: ${taskId}`);
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      // Check permissions - Owner can edit any task, Member can only edit if assigned
      const canEdit = await this.canUserEditTask(taskId, userId);
      if (!canEdit) {
        this.logger.warn(`[updateTask] Unauthorized: User ${userId} cannot update task ${taskId}`);
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      // Perform update
      const updatedTask = await this.taskRepository.updateTask(taskId, updateData);
      this.logger.log(`[updateTask] Task ${taskId} updated successfully`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`[updateTask] Error updating task: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.getTaskById(taskId);

    // Check permissions - Owner can delete any task, Member can delete if created/assigned
    const canDelete = await this.canUserDeleteTask(taskId, userId);
    if (!canDelete) {
      this.logger.warn(`[deleteTask] Unauthorized: User ${userId} cannot delete task ${taskId}`);
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.taskRepository.deleteTask(taskId);
  }

  async assignTask(
    taskId: string,
    userId: string,
    assignToUserIds: string | string[] = [],
  ): Promise<WorkspaceTask> {
    const task = await this.taskRepository.getTaskById(taskId);

    // Only creator or workspace admin can assign task
    const isCreator = task.created_by.toString() === userId;

    let isAdmin = false;
    try {
      await this.permissionService.checkAdminRole(
        task.workspace_id.toString(),
        userId,
      );
      isAdmin = true;
    } catch (error) {
      isAdmin = false;
    }

    if (!isCreator && !isAdmin) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Support both single string (legacy) and array (new)
    const userIds = Array.isArray(assignToUserIds) ? assignToUserIds : (assignToUserIds ? [assignToUserIds] : []);
    return await this.taskRepository.assignTask(taskId, userIds);
  }

  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[updateTaskStatus] Starting update for task ${taskId} status to ${status}`);
      
      const task = await this.taskRepository.getTaskById(taskId);

      // Check permissions - Owner can update any task, Member can update if assigned/creator
      const canEdit = await this.canUserEditTask(taskId, userId);
      if (!canEdit) {
        this.logger.warn(`[updateTaskStatus] Unauthorized: User ${userId} cannot update task ${taskId} status`);
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      const updatedTask = await this.taskRepository.updateTaskStatus(taskId, status);
      this.logger.log(`[updateTaskStatus] Task ${taskId} status updated to ${status}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`[updateTaskStatus] Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ========== Task Permission Management ==========
  async grantTaskPermission(
    taskId: string,
    memberId: string,
    role: TaskRolePreset,
    grantedBy: string,
  ): Promise<void> {
    this.logger.log(
      `[grantTaskPermission] Granting ${role} role to ${memberId} for task ${taskId}`,
    );

    // Verify current user is task owner
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const currentPermission = await this.taskPermissionService.getMemberPermissions(
      taskId,
      grantedBy,
    );

    if (!currentPermission || !currentPermission.is_owner) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.taskPermissionService.grantPermission(
      taskId,
      memberId,
      role,
      grantedBy,
    );
  }

  async transferTaskOwnership(
    taskId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ): Promise<void> {
    this.logger.log(
      `[transferTaskOwnership] Transferring task ${taskId} ownership from ${currentOwnerId} to ${newOwnerId}`,
    );

    // Verify current user is task owner
    const currentPermission = await this.taskPermissionService.getMemberPermissions(
      taskId,
      currentOwnerId,
    );

    if (!currentPermission || !currentPermission.is_owner) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.taskPermissionService.transferOwnership(
      taskId,
      currentOwnerId,
      newOwnerId,
    );
  }

  async getTaskMembers(taskId: string): Promise<any[]> {
    return await this.taskPermissionService.getTaskMembers(taskId);
  }

  async removeTaskPermission(
    taskId: string,
    memberId: string,
    requestedBy: string,
  ): Promise<void> {
    this.logger.log(
      `[removeTaskPermission] Removing ${memberId} permissions from task ${taskId}`,
    );

    // Only owner can remove permissions
    const currentPermission = await this.taskPermissionService.getMemberPermissions(
      taskId,
      requestedBy,
    );

    if (!currentPermission || !currentPermission.is_owner) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    // Prevent removing owner's own permissions
    if (memberId === requestedBy) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    await this.taskPermissionService.removePermission(taskId, memberId);
  }
}
