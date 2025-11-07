import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './task.schema';
import { TaskQuota } from './task-quota.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(TaskQuota.name) private readonly taskQuotaModel: Model<TaskQuota>,
  ) {}

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
    const now = new Date();
    
    // Calculate today's date in UTC (00:00:00 UTC) for consistent quota tracking
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    const newTask = new this.taskModel({
      ...createTaskDto,
      user_id: new Types.ObjectId(userId),
      created_at: now,
      updated_at: now,
      created_date: today, // Set to today's date (00:00:00 UTC) for reference
    });
    
    // Save task to database
    const savedTask = await newTask.save();

    // Increment quota counter for today
    await this.incrementDailyQuota(userId, today);

    return savedTask;
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<Task> {
    return await this.taskModel
      .findByIdAndUpdate(new Types.ObjectId(taskId), updateTaskDto, { new: true })
      .populate({ path: 'tags', populate: { path: 'tag' } })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTask(taskId: string): Promise<Task> {
    // Hard delete - remove document from database
    const task = await this.taskModel.findByIdAndDelete(taskId).exec();
    
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return task;
  }

  /**
   * Đếm số task được tạo trong ngày hôm nay (từ 00:00 đến 23:59)
   * Count TẤT CẢ tasks tạo hôm nay từ bộ đếm quota
   * (Daily limit không reset khi xóa - reset vào ngày mai)
   * Dùng aggregation counting thay vì document count để track despite hard deletes
   * @param userId - ID của user
   * @returns Số lượng task tạo hôm nay (kể cả deleted)
   */
  async countTasksCreatedToday(userId: string): Promise<number> {
    // Get today's date in UTC (00:00:00 UTC)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    
    // Get tomorrow's date in UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    console.log(`[countTasksCreatedToday] Looking for quota between ${today.toISOString()} and ${tomorrow.toISOString()}`);
    console.log(`[countTasksCreatedToday] userId: ${userId}`);

    // Query with date range - handles both UTC and local timezone stored records
    // MongoDB stores dates as ISO strings, so range query works across timezone boundaries
    const quotaRecord = await this.taskQuotaModel.findOne({
      user_id: new Types.ObjectId(userId),
      quota_date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // If not found, try to find ANY quota record for today (fallback for legacy data)
    let finalQuotaRecord = quotaRecord;
    if (!finalQuotaRecord) {
      console.log(`[countTasksCreatedToday] ⚠️  First query returned no result, trying fallback query...`);
      
      // Try to find by exact date (in case stored as local midnight)
      const todayLocal = new Date(now);
      todayLocal.setHours(0, 0, 0, 0);
      
      const tomorrowLocal = new Date(todayLocal);
      tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
      
      console.log(`[countTasksCreatedToday] Fallback: Looking between ${todayLocal.toISOString()} and ${tomorrowLocal.toISOString()}`);
      
      finalQuotaRecord = await this.taskQuotaModel.findOne({
        user_id: new Types.ObjectId(userId),
        quota_date: {
          $gte: todayLocal,
          $lt: tomorrowLocal,
        },
      });
    }

    const count = finalQuotaRecord?.created_count ?? 0;
    console.log(`[countTasksCreatedToday] Found quota record:`, finalQuotaRecord ? { created_count: finalQuotaRecord.created_count, quota_date: finalQuotaRecord.quota_date } : 'NONE');
    console.log(`[countTasksCreatedToday] Returning count: ${count}`);
    return count;
  }

  /**
   * Increment daily quota counter
   * Used when tasks are created (add or import)
   * Logic: 
   * 1. Find existing quota record
   * 2. If found: increment created_count
   * 3. If not found: create new quota record with created_count = 1
   * 
   * @param userId - ID của user
   * @param quotaDate - Date at 00:00:00 (today)
   */
  private async incrementDailyQuota(userId: string, quotaDate: Date): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    
    console.log(`[incrementDailyQuota] Processing quota for user ${userId}, date ${quotaDate.toISOString()}`);
    
    // Step 1: Try to find existing quota record
    const existingQuota = await this.taskQuotaModel.findOne({
      user_id: userObjectId,
      quota_date: quotaDate,
    });
    
    if (existingQuota) {
      // Step 2: Quota exists - just increment created_count
      console.log(`[incrementDailyQuota] ✅ Found existing quota record. Incrementing created_count from ${existingQuota.created_count} to ${existingQuota.created_count + 1}`);
      
      existingQuota.created_count += 1;
      existingQuota.updated_at = new Date();
      
      await existingQuota.save();
      
      console.log(`[incrementDailyQuota] ✅ Quota updated successfully. New created_count: ${existingQuota.created_count}, user_id: ${existingQuota.user_id}`);
    } else {
      // Step 3: Quota doesn't exist - create new record
      console.log(`[incrementDailyQuota] 📝 No existing quota found. Creating new quota record...`);
      
      const newQuota = new this.taskQuotaModel({
        user_id: userObjectId,
        quota_date: quotaDate,
        created_count: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      await newQuota.save();
      
      console.log(`[incrementDailyQuota] ✅ New quota created successfully. created_count: 1, user_id: ${newQuota.user_id}, quota_date: ${newQuota.quota_date.toISOString()}`);
    }
  }

  /**
   * DEBUG: Get all quota records for a user
   */
  async debugGetAllQuotaForUser(userId: string): Promise<any> {
    console.log(`[debugGetAllQuotaForUser] Fetching all quota records for user: ${userId}`);
    
    const records = await this.taskQuotaModel.find({
      user_id: new Types.ObjectId(userId),
    }).sort({ quota_date: -1 });
    
    console.log(`[debugGetAllQuotaForUser] Found ${records.length} quota records:`);
    records.forEach((record, idx) => {
      console.log(`  [${idx}] quota_date: ${record.quota_date.toISOString()}, created_count: ${record.created_count}`);
    });
    
    return records;
  }

  /**
   * DEBUG: Get quota records in today's range (UTC)
   */
  async debugGetTodayQuotaUTC(userId: string): Promise<any> {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    console.log(`[debugGetTodayQuotaUTC] Query range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
    
    const records = await this.taskQuotaModel.find({
      user_id: new Types.ObjectId(userId),
      quota_date: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    console.log(`[debugGetTodayQuotaUTC] Found ${records.length} records matching UTC range`);
    return records;
  }
}

