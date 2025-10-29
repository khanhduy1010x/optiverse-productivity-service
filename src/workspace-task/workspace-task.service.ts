import { Injectable, Logger } from '@nestjs/common';
import { WorkspaceTaskRepository } from './workspace-task.repository';
import { PermissionService } from 'src/workspace/permission.service';
import { WorkspaceTask } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskService {
  private logger = new Logger('WorkspaceTaskService');

  constructor(
    private readonly taskRepository: WorkspaceTaskRepository,
    private readonly permissionService: PermissionService,
  ) {}

  // ========== Task CRUD ==========
  async createTask(
    workspaceId: string,
    userId: string,
    title: string,
    description?: string,
    assignedTo?: string,
  ): Promise<WorkspaceTask> {
    this.logger.log(`[createTask] Starting - workspaceId: ${workspaceId}, userId: ${userId}, title: ${title}`);
    
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

      // TODO: TEMP DISABLED FOR TESTING - Check permissions
      // const isCreator = task.created_by.toString() === userId;
      // const isAssignee = task.assigned_to?.toString() === userId;

      // let isAdmin = false;
      // try {
      //   await this.permissionService.checkAdminRole(
      //     task.workspace_id.toString(),
      //     userId,
      //   );
      //   isAdmin = true;
      // } catch (error) {
      //   this.logger.debug(`[updateTask] User is not admin`);
      //   isAdmin = false;
      // }

      // this.logger.debug(`[updateTask] Permission check - isCreator: ${isCreator}, isAssignee: ${isAssignee}, isAdmin: ${isAdmin}`);

      // if (!isCreator && !isAssignee && !isAdmin) {
      //   this.logger.warn(`[updateTask] Unauthorized: User ${userId} cannot update task ${taskId}`);
      //   throw new AppException(ErrorCode.UNAUTHORIZED);
      // }

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

    // Only creator or workspace admin can delete task
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

    await this.taskRepository.deleteTask(taskId);
  }

  async assignTask(
    taskId: string,
    userId: string,
    assignToUserId: string,
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

    return await this.taskRepository.assignTask(taskId, assignToUserId);
  }

  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[updateTaskStatus] Starting update for task ${taskId} status to ${status}`);
      
      const task = await this.taskRepository.getTaskById(taskId);

      // TODO: TEMP DISABLED FOR TESTING - Creator or assignee or admin can update status
      // const isCreator = task.created_by.toString() === userId;
      // const isAssignee = task.assigned_to ? task.assigned_to.toString() === userId : false;

      // let isAdmin = false;
      // try {
      //   await this.permissionService.checkAdminRole(
      //     task.workspace_id.toString(),
      //     userId,
      //   );
      //   isAdmin = true;
      // } catch (error) {
      //   isAdmin = false;
      // }

      // if (!isCreator && !isAssignee && !isAdmin) {
      //   throw new AppException(ErrorCode.UNAUTHORIZED);
      // }

      const updatedTask = await this.taskRepository.updateTaskStatus(taskId, status);
      this.logger.log(`[updateTaskStatus] Task ${taskId} status updated to ${status}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`[updateTaskStatus] Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
