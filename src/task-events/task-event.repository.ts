import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskEvent } from './task-event.schema';
import { Task } from '../tasks/task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTaskEventRequest } from './dto/request/CreateTaskEventRequest.dto';
import { UpdateTaskEventRequest } from './dto/request/UpdateTaskEventRequest.dto';

@Injectable()
export class TaskEventRepository {
  constructor(
    @InjectModel(TaskEvent.name) private readonly taskEventModel: Model<TaskEvent>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async getTaskEventsByTaskID(taskId: string): Promise<TaskEvent[]> {
    return await this.taskEventModel.find({ task_id: new Types.ObjectId(taskId) }).exec();
  }

  async createTaskEvent(createTaskEventDto: CreateTaskEventRequest): Promise<TaskEvent> {
    const newTaskEvent = new this.taskEventModel({
      task_id: createTaskEventDto.task_id ? new Types.ObjectId(createTaskEventDto.task_id) : undefined,
      user_id: new Types.ObjectId(createTaskEventDto.user_id),
      title: createTaskEventDto.title || 'Untitled Event',
      description: createTaskEventDto.description || '',
      start_time: createTaskEventDto.start_time,
      end_time: createTaskEventDto.end_time,
      all_day: createTaskEventDto.all_day,
      repeat_type: createTaskEventDto.repeat_type,
      repeat_interval: createTaskEventDto.repeat_interval,
      repeat_days: createTaskEventDto.repeat_days,
      repeat_end_type: createTaskEventDto.repeat_end_type,
      repeat_end_date: createTaskEventDto.repeat_end_date,
      repeat_occurrences: createTaskEventDto.repeat_occurrences,
      repeat_frequency: createTaskEventDto.repeat_frequency,
      repeat_unit: createTaskEventDto.repeat_unit,
      exclusion_dates: createTaskEventDto.exclusion_dates,
      location: createTaskEventDto.location,
      guests: createTaskEventDto.guests,
      color: createTaskEventDto.color,
      parent_event_id: createTaskEventDto.parent_event_id ? new Types.ObjectId(createTaskEventDto.parent_event_id) : undefined
    });
    return await newTaskEvent.save();
  }

  async updateTaskEvent(
    taskEventId: string,
    updateTaskEventDto: UpdateTaskEventRequest,
  ): Promise<TaskEvent> {
    return await this.taskEventModel
      .findByIdAndUpdate(new Types.ObjectId(taskEventId), updateTaskEventDto, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTaskEvent(taskEventId: string): Promise<void> {
    const result = await this.taskEventModel
      .deleteOne({ _id: new Types.ObjectId(taskEventId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  /**
   * Get all task events belonging to a user by their userId.
   * This directly queries TaskEvent documents using the user_id field.
   */
  async getTaskEventsByUserID(userId: string): Promise<TaskEvent[]> {
    return await this.taskEventModel.find({ user_id: new Types.ObjectId(userId) }).exec();
  }
}
