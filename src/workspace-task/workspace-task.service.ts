import { Injectable } from '@nestjs/common';
import { WorkspaceTaskRepository } from './workspace-task.repository';
import { PermissionService } from 'src/workspace/permission.service';
import { WorkspaceTask } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskService {
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
  ): Promise<WorkspaceTask> {
    // Check if user has permission to create task in workspace
    try {
      await this.permissionService.checkAdminRole(workspaceId, userId);
    } catch (error) {
      // Allow members to create tasks, but admins have priority
    }

    return await this.taskRepository.createTask(
      workspaceId,
      title,
      description,
      userId,
    );
  }

  async getTaskById(taskId: string): Promise<WorkspaceTask> {
    return await this.taskRepository.getTaskById(taskId);
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    return await this.taskRepository.getTasksByWorkspace(workspaceId);
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
    const task = await this.taskRepository.getTaskById(taskId);
    
    // Only creator, assignee, or workspace admin can update task
    const isCreator = task.created_by.toString() === userId;
    const isAssignee = task.assigned_to?.toString() === userId;

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

    if (!isCreator && !isAssignee && !isAdmin) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return await this.taskRepository.updateTask(taskId, updateData);
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
    const task = await this.taskRepository.getTaskById(taskId);

    // Only assignee or creator can update status
    const isCreator = task.created_by.toString() === userId;
    const isAssignee = task.assigned_to?.toString() === userId;

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

    if (!isCreator && !isAssignee && !isAdmin) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return await this.taskRepository.updateTaskStatus(taskId, status);
  }

  // ========== Subtask Operations ==========
  async createSubtask(
    taskId: string,
    userId: string,
    title: string,
    description: string | undefined,
    assignedTo: string,
  ): Promise<WorkspaceTask> {
    const task = await this.taskRepository.getTaskById(taskId);

    // Only creator or workspace admin can add subtask
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

    return await this.taskRepository.createSubtask(
      taskId,
      title,
      description,
      assignedTo,
    );
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    userId: string,
    updateData: any,
  ): Promise<WorkspaceTask> {
    const task = await this.taskRepository.getTaskById(taskId);
    const subtask = task.subtasks.find((st) => st._id.toString() === subtaskId);

    if (!subtask) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Only creator, assigned member, or workspace admin can update
    const isCreator = task.created_by.toString() === userId;
    const isAssigned = subtask.assigned_to.toString() === userId;

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

    if (!isCreator && !isAssigned && !isAdmin) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return await this.taskRepository.updateSubtask(taskId, subtaskId, updateData);
  }

  async deleteSubtask(
    taskId: string,
    subtaskId: string,
    userId: string,
  ): Promise<WorkspaceTask> {
    const task = await this.taskRepository.getTaskById(taskId);

    // Only creator or workspace admin can delete
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

    return await this.taskRepository.deleteSubtask(taskId, subtaskId);
  }

  async updateSubtaskStatus(
    taskId: string,
    subtaskId: string,
    userId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    const task = await this.taskRepository.getTaskById(taskId);
    const subtask = task.subtasks.find((st) => st._id.toString() === subtaskId);

    if (!subtask) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Only assigned member can update own subtask status
    const isAssigned = subtask.assigned_to.toString() === userId;

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

    if (!isAssigned && !isAdmin) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return await this.taskRepository.updateSubtaskStatus(
      taskId,
      subtaskId,
      status,
    );
  }
}
