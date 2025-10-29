import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceTask, WorkspaceTaskDocument } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskRepository {
  private logger = new Logger('WorkspaceTaskRepository');

  constructor(
    @InjectModel(WorkspaceTask.name)
    private readonly workspaceTaskModel: Model<WorkspaceTaskDocument>,
  ) {}

  // ========== Task CRUD Operations ==========
  async createTask(
    workspaceId: string,
    title: string,
    description: string | undefined,
    createdBy: string,
    assignedTo?: string,
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[createTask] Creating task - workspaceId: ${workspaceId}, title: ${title}, createdBy: ${createdBy}, assignedTo: ${assignedTo}`);
      
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(workspaceId)) {
        this.logger.error(`[createTask] Invalid workspaceId: ${workspaceId}`);
        throw new AppException(ErrorCode.INVALID_CODE);
      }
      if (!Types.ObjectId.isValid(createdBy)) {
        this.logger.error(`[createTask] Invalid createdBy: ${createdBy}`);
        throw new AppException(ErrorCode.INVALID_CODE);
      }
      if (assignedTo && !Types.ObjectId.isValid(assignedTo)) {
        this.logger.error(`[createTask] Invalid assignedTo: ${assignedTo}`);
        throw new AppException(ErrorCode.INVALID_CODE);
      }

      const newTask = new this.workspaceTaskModel({
        workspace_id: new Types.ObjectId(workspaceId),
        title,
        description,
        created_by: new Types.ObjectId(createdBy),
        assigned_to: assignedTo ? new Types.ObjectId(assignedTo) : null,
        status: 'to-do',
      });
      
      const savedTask = await newTask.save();
      this.logger.log(`[createTask] Task saved successfully: ${savedTask._id}`);

      this.logger.log(`[createTask] Task created successfully: ${savedTask._id}`);
      return savedTask as WorkspaceTask;
    } catch (error) {
      this.logger.error(`[createTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async getTaskById(taskId: string): Promise<WorkspaceTask> {
    try {
      const objectId = new Types.ObjectId(taskId);
      const task = await this.workspaceTaskModel
        .findById(objectId)
        .exec();
      
      if (!task) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      return task;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    try {
      this.logger.log(`[getTasksByWorkspace] Fetching tasks for workspace: ${workspaceId}`);
      
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(workspaceId)) {
        this.logger.error(`[getTasksByWorkspace] Invalid workspace ID format: ${workspaceId}`);
        throw new AppException(ErrorCode.INVALID_CODE);
      }

      const objectId = new Types.ObjectId(workspaceId);
      const tasks = await this.workspaceTaskModel
        .find({ workspace_id: objectId })
        .sort({ createdAt: -1 })
        .exec();
      
      this.logger.log(`[getTasksByWorkspace] Found ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      this.logger.error(`[getTasksByWorkspace] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async getTasksByStatus(
    workspaceId: string,
    status: string,
  ): Promise<WorkspaceTask[]> {
    try {
      const objectId = new Types.ObjectId(workspaceId);
      return await this.workspaceTaskModel
        .find({
          workspace_id: objectId,
          status,
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async updateTask(
    taskId: string,
    updateData: Partial<WorkspaceTask>,
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[updateTask] Starting update for taskId: ${taskId}`);
      this.logger.debug(`[updateTask] Update data:`, JSON.stringify(updateData));
      
      const objectId = new Types.ObjectId(taskId);
      const result = await this.workspaceTaskModel
        .findByIdAndUpdate(objectId, updateData, { new: true })
        .exec();

      this.logger.log(`[updateTask] Update completed. Result:`, result ? `Task ID ${result._id}` : 'null');
      
      if (!result) {
        this.logger.error(`[updateTask] Task not found after update: ${taskId}`);
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      return result;
    } catch (error) {
      this.logger.error(`[updateTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const objectId = new Types.ObjectId(taskId);
      const result = await this.workspaceTaskModel.findByIdAndDelete(objectId);
      if (!result) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async assignTask(taskId: string, userId: string): Promise<WorkspaceTask> {
    try {
      const taskObjectId = new Types.ObjectId(taskId);
      const userObjectId = new Types.ObjectId(userId);
      const result = await this.workspaceTaskModel
        .findByIdAndUpdate(
          taskObjectId,
          { assigned_to: userObjectId },
          { new: true },
        )
        .exec();

      if (!result) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }

      return result;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async updateTaskStatus(taskId: string, status: string): Promise<WorkspaceTask> {
    const updateData: any = { status };
    if (status === 'done') {
      updateData.completed_at = new Date();
    }
    return await this.updateTask(taskId, updateData);
  }
}
