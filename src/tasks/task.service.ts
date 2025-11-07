import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Task } from './task.schema';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { TaskTagService } from '../task-tags/task-tag.service';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { getTaskLimitByMembershipLevel, canCreateTask, getDetailedLimitExceededResponse } from './utils/task-limit.util';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskTagService: TaskTagService,
  ) {}

  async getAllTaskByID(id: string): Promise<GetAllTaskReponse> {
    return await this.taskRepository.getAllTaskByID(id);
  }
  async getTaskByID(taskId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.getTaskByID(taskId);
    return new TaskResponse(task);
  }

  /**
   * Validate xem user có thể tạo task dựa trên membership level và giới hạn ngày
   * 
   * Logic kiểm tra:
   * 1. Nếu hasActiveMembership: false → coi là FREE (10/ngày), bất kể level
   * 2. Nếu hasActiveMembership: true → kiểm tra lại level:
   *    - level 0: BASIC (20/ngày)
   *    - level 1: PLUS (50/ngày)
   *    - level 2: BUSINESS (Unlimited - skip check)
   *    - level khác: coi là FREE (10/ngày)
   * 
   * @param userId - ID của user
   * @param membershipLevel - Level membership từ req.userInfo.membership.level
   * @param hasActiveMembership - Từ req.userInfo.membership.hasActiveMembership
   * @throws HttpException nếu vượt giới hạn với detailed response
   */
  private async validateTaskCreationLimit(userId: string, membershipLevel: number, hasActiveMembership: boolean = true): Promise<void> {
    console.log(`[validateTaskCreationLimit] Checking user ${userId}: hasActiveMembership=${hasActiveMembership}, membershipLevel=${membershipLevel}`);

    let finalMembershipLevel = membershipLevel;
    let finalHasActiveMembership = hasActiveMembership;

    // Logic 1: Nếu hasActiveMembership: false → luôn là FREE, không xét level
    if (!hasActiveMembership) {
      console.log('[validateTaskCreationLimit] hasActiveMembership: false → User is FREE tier (10/day limit)');
      finalMembershipLevel = 0; // Dummy level, sẽ được xử lý qua hasActiveMembership: false
    } 
    // Logic 2: Nếu hasActiveMembership: true → kiểm tra xem level có hợp lệ không
    else {
      // Chỉ BUSINESS (level 2) có unlimited - skip check hoàn toàn
      if (membershipLevel === 2) {
        console.log('[validateTaskCreationLimit] hasActiveMembership: true + level 2 → BUSINESS tier (Unlimited) - skipping validation');
        return;
      }

      // Kiểm tra level hợp lệ: nếu không phải 0, 1, 2 thì coi là lỗi
      if (!Number.isInteger(membershipLevel) || membershipLevel < 0 || membershipLevel > 2) {
        console.log(`[validateTaskCreationLimit] hasActiveMembership: true nhưng membershipLevel ${membershipLevel} không hợp lệ → treating as FREE`);
        // Nếu level không hợp lệ, coi như không có active membership
        finalHasActiveMembership = false;
      } else if (membershipLevel === 0) {
        console.log('[validateTaskCreationLimit] hasActiveMembership: true + level 0 → BASIC tier (20/day limit)');
      } else if (membershipLevel === 1) {
        console.log('[validateTaskCreationLimit] hasActiveMembership: true + level 1 → PLUS tier (50/day limit)');
      }
    }

    // Đếm số task tạo hôm nay
    const tasksCreatedToday = await this.taskRepository.countTasksCreatedToday(userId);
    console.log(`[validateTaskCreationLimit] tasksCreatedToday: ${tasksCreatedToday}, finalMembershipLevel: ${finalMembershipLevel}, finalHasActiveMembership: ${finalHasActiveMembership}`);

    // Check xem có thể tạo task không - IMPORTANT: pass finalHasActiveMembership để đúng limit
    const canCreate = canCreateTask(tasksCreatedToday, finalMembershipLevel, finalHasActiveMembership);
    console.log(`[validateTaskCreationLimit] canCreate result: ${canCreate}`);
    
    if (!canCreate) {
      console.log(`[validateTaskCreationLimit] ❌ Task limit EXCEEDED for user ${userId}. tasksCreatedToday=${tasksCreatedToday}`);
      try {
        // Lấy detailed response với upgrade suggestion
        const errorResponse = getDetailedLimitExceededResponse(finalMembershipLevel, tasksCreatedToday, finalHasActiveMembership);
        
        console.log('Task limit error response:', JSON.stringify(errorResponse, null, 2));
        
        // Throw HttpException to ensure proper JSON response with full error details
        throw new HttpException(
          {
            code: errorResponse.code,
            statusCode: errorResponse.code,
            message: errorResponse.message,
            error: errorResponse.error,
            details: errorResponse.details,
            upgrade: errorResponse.upgrade,
          },
          HttpStatus.BAD_REQUEST,
        );
      } catch (error) {
        console.error('Error in validateTaskCreationLimit:', error);
        // If it's already an HttpException, re-throw it
        if (error instanceof HttpException) {
          throw error;
        }
        // Otherwise throw a generic bad request
        throw new HttpException(
          {
            code: 400,
            statusCode: 400,
            message: `You have reached the daily task limit. Please upgrade your membership to create more tasks.`,
            error: 'TASK_LIMIT_EXCEEDED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      console.log(`[validateTaskCreationLimit] User can create task (${tasksCreatedToday} < limit)`);
    }
  }

  async createTask(userId: string, createTaskDto: CreateTaskRequest, membershipLevel: number = 0, hasActiveMembership: boolean = false): Promise<TaskResponse> {
    // Validate task creation limit based on membership level
    await this.validateTaskCreationLimit(userId, membershipLevel, hasActiveMembership);

    const task = await this.taskRepository.createTask(userId, createTaskDto);
    return new TaskResponse(task);
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskRequest): Promise<TaskResponse> {
    // No validation required - start_time and end_time are optional
    const task = await this.taskRepository.updateTask(taskId, updateTaskDto);
    return new TaskResponse(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.deleteTask(taskId);

    await this.taskTagService.deleteMany({ task_id: task._id });
  }

  /**
   * Get number of tasks created today for a user
   * Used to check quota before importing
   * 
   * @param userId - ID của user
   * @returns Number of tasks created today
   */
  async getTasksCreatedToday(userId: string): Promise<number> {
    return await this.taskRepository.countTasksCreatedToday(userId);
  }

  /**
   * DEBUG: Get all quota records for user
   */
  async debugGetAllQuotaRecords(userId: string): Promise<any> {
    return await this.taskRepository.debugGetAllQuotaForUser(userId);
  }

  /**
   * DEBUG: Get today's quota records
   */
  async debugGetTodayQuota(userId: string): Promise<any> {
    return await this.taskRepository.debugGetTodayQuotaUTC(userId);
  }
}
