import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';

@Injectable()
export class TaskRepository {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<Task>) {}

  async getAllTaskByID(id: string): Promise<GetAllTaskReponse> {
    const listTask = await this.taskModel
    .find({ user_id: new Types.ObjectId(id) })
    .populate({ path: 'tags', populate: { path: 'tag' } })
    .orFail(new AppException(ErrorCode.NOT_FOUND));
  return new GetAllTaskReponse(listTask);
  }
  async getTaskByID(taskId: string): Promise<Task> {
    return await this.taskModel
      .findById(new Types.ObjectId(taskId))
      .populate({ path: 'tags', populate: { path: 'tag' } })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async createTask(userId: string, createTaskDto: CreateTaskRequest): Promise<Task> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      user_id: new Types.ObjectId(userId),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await newTask.save();
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<Task> {
    return await this.taskModel
      .findByIdAndUpdate(new Types.ObjectId(taskId), updateTaskDto, { new: true })
      .populate({ path: 'tags', populate: { path: 'tag' } })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTask(taskId: string): Promise<Task> {
    const task = await this.taskModel.findByIdAndDelete(taskId).exec();
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return task;
  }

  // Method for achievement tracking

  /**
   * Count the number of tasks a user has completed today
   */
  async countCompletedTasksToday(userId: string): Promise<number> {
    console.log(`[Task Repository] Counting completed tasks today for user: ${userId}`);
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    console.log(`[Task Repository] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const query = {
      user_id: new Types.ObjectId(userId),
      status: 'completed',
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    };
    
    console.log(`[Task Repository] Query:`, JSON.stringify(query));
    
    const count = await this.taskModel.countDocuments(query).exec();
    
    console.log(`[Task Repository] Found ${count} completed tasks today for user ${userId}`);
    
    return count;
  }

  /**
   * Count the number of tasks a user has completed this week
   */
  async countCompletedTasksThisWeek(userId: string): Promise<number> {
    console.log(`[Task Repository] Counting completed tasks this week for user: ${userId}`);
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
      
    console.log(`[Task Repository] Week date range: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);

    const query = {
        user_id: new Types.ObjectId(userId),
        status: 'completed',
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
    };
    
    console.log(`[Task Repository] Week query:`, JSON.stringify(query));
    
    const count = await this.taskModel.countDocuments(query).exec();
    
    console.log(`[Task Repository] Found ${count} completed tasks this week for user ${userId}`);
    
    return count;
  }

  /**
   * Count the number of tasks a user has completed this month
   */
  async countCompletedTasksThisMonth(userId: string): Promise<number> {
    console.log(`[Task Repository] Counting completed tasks this month for user: ${userId}`);
    
    const today = new Date();
    
    // Calculate the start of the month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calculate the end of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`[Task Repository] Month date range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

    const query = {
      user_id: new Types.ObjectId(userId),
      status: 'completed',
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
    };
    
    console.log(`[Task Repository] Month query:`, JSON.stringify(query));
    
    const count = await this.taskModel.countDocuments(query).exec();
    
    console.log(`[Task Repository] Found ${count} completed tasks this month for user ${userId}`);
    
    return count;
  }
}
