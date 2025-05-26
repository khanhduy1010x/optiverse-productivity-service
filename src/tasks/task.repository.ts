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
}
