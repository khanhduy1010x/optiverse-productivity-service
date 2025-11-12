import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceTask, WorkspaceTaskDocument } from './workspace-task.schema';
import { WorkspaceTaskQuota } from './workspace-task-quota.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskRepository {
  private logger = new Logger('WorkspaceTaskRepository');

  constructor(
    @InjectModel(WorkspaceTask.name)
    private readonly workspaceTaskModel: Model<WorkspaceTaskDocument>,
    @InjectModel(WorkspaceTaskQuota.name)
    private readonly workspaceTaskQuotaModel: Model<WorkspaceTaskQuota>,
  ) {}

  // ========== Task CRUD Operations ==========
  async createTask(
    workspaceId: string,
    title: string,
    description: string | undefined,
    createdBy: string,
    assignedTo?: string,
    endTime?: string,
    assignedToList?: string[],
  ): Promise<WorkspaceTask> {
    try {
      this.logger.log(`[createTask] Creating task - workspaceId: ${workspaceId}, title: ${title}, createdBy: ${createdBy}, assignedTo: ${assignedTo}, endTime: ${endTime}`);
      
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
      if (assignedToList && assignedToList.length > 0) {
        for (const id of assignedToList) {
          if (!Types.ObjectId.isValid(id)) {
            this.logger.error(`[createTask] Invalid ID in assignedToList: ${id}`);
            throw new AppException(ErrorCode.INVALID_CODE);
          }
        }
      }

      const newTask = new this.workspaceTaskModel({
        workspace_id: new Types.ObjectId(workspaceId),
        title,
        description,
        created_by: new Types.ObjectId(createdBy),
        assigned_to: assignedTo ? new Types.ObjectId(assignedTo) : null,
        assigned_to_list: assignedToList && assignedToList.length > 0 ? assignedToList.map(id => new Types.ObjectId(id)) : [],
        status: 'to-do',
        end_time: endTime ? new Date(endTime) : null,
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

  async assignTask(taskId: string, userIds: string | string[]): Promise<WorkspaceTask> {
    try {
      const taskObjectId = new Types.ObjectId(taskId);
      
      // Support both single string (legacy) and array (new)
      const ids = Array.isArray(userIds) 
        ? userIds.map(id => new Types.ObjectId(id))
        : userIds ? [new Types.ObjectId(userIds)] : [];

      const updateData: any = {
        assigned_to_list: ids,
      };
      
      // For backward compatibility, also update assigned_to with first user if exists
      if (ids.length > 0) {
        updateData.assigned_to = ids[0];
      } else {
        // If no users, clear both fields
        updateData.assigned_to = null;
      }

      const result = await this.workspaceTaskModel
        .findByIdAndUpdate(
          taskObjectId,
          updateData,
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

  /**
   * Đếm số workspace task được tạo hôm nay trong một workspace (dựa trên quota tracking)
   * Dùng để check membership limit theo owner của workspace
   * @param workspaceId - ID của workspace
   * @returns Số lượng task đã tạo hôm nay trong workspace đó
   */
  async countWorkspaceTasksCreatedToday(workspaceId: string): Promise<number> {
    // Get today's date in UTC (00:00:00 UTC)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    
    // Get tomorrow's date in UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    console.log(`[countWorkspaceTasksCreatedToday] Looking for quota between ${today.toISOString()} and ${tomorrow.toISOString()}`);
    console.log(`[countWorkspaceTasksCreatedToday] workspaceId: ${workspaceId}`);

    // Query with date range - handles both UTC and local timezone stored records
    const quotaRecord = await this.workspaceTaskQuotaModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      quota_date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // If not found, try to find ANY quota record for today (fallback for legacy data)
    let finalQuotaRecord = quotaRecord;
    if (!finalQuotaRecord) {
      console.log(`[countWorkspaceTasksCreatedToday] ⚠️  First query returned no result, trying fallback query...`);
      
      // Try to find by exact date (in case stored as local midnight)
      const todayLocal = new Date(now);
      todayLocal.setHours(0, 0, 0, 0);
      
      const tomorrowLocal = new Date(todayLocal);
      tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
      
      console.log(`[countWorkspaceTasksCreatedToday] Fallback: Looking between ${todayLocal.toISOString()} and ${tomorrowLocal.toISOString()}`);
      
      finalQuotaRecord = await this.workspaceTaskQuotaModel.findOne({
        workspace_id: new Types.ObjectId(workspaceId),
        quota_date: {
          $gte: todayLocal,
          $lt: tomorrowLocal,
        },
      });
    }

    const count = finalQuotaRecord?.created_count ?? 0;
    console.log(`[countWorkspaceTasksCreatedToday] Found quota record:`, finalQuotaRecord ? { created_count: finalQuotaRecord.created_count, quota_date: finalQuotaRecord.quota_date } : 'NONE');
    console.log(`[countWorkspaceTasksCreatedToday] Returning count: ${count}`);
    return count;
  }

  /**
   * Increment daily quota counter cho workspace
   * Được gọi khi workspace task được tạo
   */
  async incrementWorkspaceTaskQuota(workspaceId: string): Promise<void> {
    const now = new Date();
    // Use UTC midnight
    const quotaDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    console.log(`[incrementWorkspaceTaskQuota] workspaceId: ${workspaceId}, quotaDate: ${quotaDate.toISOString()}`);

    // Find existing quota record for this workspace + date
    const existingQuota = await this.workspaceTaskQuotaModel.findOne({
      workspace_id: new Types.ObjectId(workspaceId),
      quota_date: quotaDate,
    });

    if (existingQuota) {
      // Increment counter
      existingQuota.created_count += 1;
      existingQuota.updated_at = new Date();
      await existingQuota.save();
      console.log(`[incrementWorkspaceTaskQuota] Updated quota for workspace ${workspaceId}: ${existingQuota.created_count}`);
    } else {
      // Create new record
      const newQuota = new this.workspaceTaskQuotaModel({
        workspace_id: new Types.ObjectId(workspaceId),
        quota_date: quotaDate,
        created_count: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
      await newQuota.save();
      console.log(`[incrementWorkspaceTaskQuota] Created new quota record for workspace ${workspaceId}: 1`);
    }
  }
}

