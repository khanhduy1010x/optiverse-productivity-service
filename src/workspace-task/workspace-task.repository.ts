import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceTask, WorkspaceTaskDocument } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@Injectable()
export class WorkspaceTaskRepository {
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
  ): Promise<WorkspaceTask> {
    const newTask = new this.workspaceTaskModel({
      workspace_id: new Types.ObjectId(workspaceId),
      title,
      description,
      created_by: new Types.ObjectId(createdBy),
      status: 'to-do',
      subtasks: [],
      subtask_completed_count: 0,
    });
    return await newTask.save();
  }

  async getTaskById(taskId: string): Promise<WorkspaceTask> {
    const task = await this.workspaceTaskModel
      .findById(new Types.ObjectId(taskId))
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
    return task;
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    return await this.workspaceTaskModel
      .find({ workspace_id: new Types.ObjectId(workspaceId) })
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByStatus(
    workspaceId: string,
    status: string,
  ): Promise<WorkspaceTask[]> {
    return await this.workspaceTaskModel
      .find({
        workspace_id: new Types.ObjectId(workspaceId),
        status,
      })
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateTask(
    taskId: string,
    updateData: Partial<WorkspaceTask>,
  ): Promise<WorkspaceTask> {
    return await this.workspaceTaskModel
      .findByIdAndUpdate(new Types.ObjectId(taskId), updateData, { new: true })
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.workspaceTaskModel.findByIdAndDelete(
      new Types.ObjectId(taskId),
    );
    if (!result) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async assignTask(taskId: string, userId: string): Promise<WorkspaceTask> {
    return await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        { assigned_to: new Types.ObjectId(userId) },
        { new: true },
      )
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateTaskStatus(taskId: string, status: string): Promise<WorkspaceTask> {
    const updateData: any = { status };
    if (status === 'done') {
      updateData.completed_at = new Date();
    }
    return await this.updateTask(taskId, updateData);
  }

  // ========== Subtask Operations ==========
  async createSubtask(
    taskId: string,
    title: string,
    description: string | undefined,
    assignedTo: string,
  ): Promise<WorkspaceTask> {
    const subtaskId = new Types.ObjectId();
    const newSubtask = {
      _id: subtaskId,
      title,
      description,
      assigned_to: new Types.ObjectId(assignedTo),
      status: 'to-do',
    };

    return await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        { $push: { subtasks: newSubtask } },
        { new: true },
      )
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    updateData: any,
  ): Promise<WorkspaceTask> {
    return await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        {
          $set: {
            'subtasks.$[elem].title': updateData.title || undefined,
            'subtasks.$[elem].description': updateData.description || undefined,
            'subtasks.$[elem].assigned_to':
              updateData.assigned_to
                ? new Types.ObjectId(updateData.assigned_to)
                : undefined,
            'subtasks.$[elem].status': updateData.status || undefined,
            'subtasks.$[elem].completed_at':
              updateData.status === 'done' ? new Date() : null,
          },
        },
        {
          arrayFilters: [{ 'elem._id': new Types.ObjectId(subtaskId) }],
          new: true,
        },
      )
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<WorkspaceTask> {
    return await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        { $pull: { subtasks: { _id: new Types.ObjectId(subtaskId) } } },
        { new: true },
      )
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async updateSubtaskStatus(
    taskId: string,
    subtaskId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    const task = await this.getTaskById(taskId);
    let completedCount = 0;

    // Update subtask status
    const updatedTask = await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        {
          $set: {
            'subtasks.$[elem].status': status,
            'subtasks.$[elem].completed_at': status === 'done' ? new Date() : null,
          },
        },
        {
          arrayFilters: [{ 'elem._id': new Types.ObjectId(subtaskId) }],
          new: true,
        },
      )
      .exec();

    // Count completed subtasks
    if (updatedTask) {
      completedCount = updatedTask.subtasks.filter(
        (st) => st.status === 'done',
      ).length;
    }

    // Update completed count in main task
    return await this.workspaceTaskModel
      .findByIdAndUpdate(
        new Types.ObjectId(taskId),
        { subtask_completed_count: completedCount },
        { new: true },
      )
      .populate('created_by', 'name email avatar')
      .populate('assigned_to', 'name email avatar')
      .populate('subtasks.assigned_to', 'name email avatar')
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }
}
