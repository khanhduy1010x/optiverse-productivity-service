import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { GetAllTaskReponse } from './dto/response/GetAllTaskRepose.dto';
import { TaskResponse } from './dto/response/TaskReponse.dto';
import { CreateTaskRequest } from './dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from './dto/request/UpdateTaskRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiTags('Task')
@ApiBearerAuth('access-token')
@ApiExtraModels(ApiResponseWrapper, TaskResponse)
@Controller('/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('all')
  async getAllTaskUser(@Request() req): Promise<ApiResponseWrapper<GetAllTaskReponse>> {
    const user = req.userInfo as UserDto;
    const result = await this.taskService.getAllTaskByID(user.userId);
    return new ApiResponseWrapper<GetAllTaskReponse>(result);
  }
  @Get(':id')
  async getTaskById(@Param('id') taskId: string): Promise<ApiResponseWrapper<TaskResponse>> {
    const task = await this.taskService.getTaskByID(taskId);
    return new ApiResponseWrapper<TaskResponse>(task);
  }

  @ApiBody({ type: CreateTaskRequest })
  @ApiOkResponse({
    description: 'Create task successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(TaskResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Created failed' })
  @Post('')
  async createTask(
    @Request() req,
    @Body() createTaskDto: CreateTaskRequest,
  ): Promise<ApiResponseWrapper<TaskResponse>> {
    const user = req.userInfo as UserDto;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[TaskController.createTask] 🔵 REQUEST RECEIVED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[TaskController.createTask] user.userId:', user.userId);
    console.log('[TaskController.createTask] user.membership:', JSON.stringify(user.membership, null, 2));
    
    // Lấy membership level từ req.userInfo
    // MAPPING:
    //   hasActiveMembership: false → FREE (10/day limit)
    //   hasActiveMembership: true:
    //     level: 0 → BASIC (20/day limit)
    //     level: 1 → PLUS (50/day limit)
    //     level: 2 → BUSINESS (unlimited)
    
    // Step 1: Determine hasActiveMembership
    const hasActiveMembership = user.membership?.hasActiveMembership === true;
    console.log('[TaskController.createTask] Step 1 - hasActiveMembership:', hasActiveMembership);
    
    // Step 2: Parse membership level - handle both string and number types
    let membershipLevel = 0;
    if (hasActiveMembership && user.membership?.level !== undefined) {
      // Convert to number if it's a string
      const rawLevel = user.membership.level;
      console.log('[TaskController.createTask] Step 2 - rawLevel from JWT:', rawLevel, `(type: ${typeof rawLevel})`);
      
      membershipLevel = typeof rawLevel === 'string' 
        ? parseInt(rawLevel, 10) 
        : rawLevel;
      
      console.log('[TaskController.createTask] Step 2 - membershipLevel after parsing:', membershipLevel);
      
      // Validate range (0-2)
      if (membershipLevel < 0 || membershipLevel > 2) {
        console.log(`[TaskController.createTask] ⚠️  Level ${membershipLevel} is out of range, defaulting to 0 (BASIC)`);
        membershipLevel = 0;
      }
    } else {
      console.log('[TaskController.createTask] Step 2 - hasActiveMembership is false, keeping membershipLevel = 0 (will be treated as FREE)');
    }
    
    console.log('[TaskController.createTask] Step 3 - Final values to send to service:');
    console.log('  - membershipLevel:', membershipLevel);
    console.log('  - hasActiveMembership:', hasActiveMembership);
    
    // Map tier name for logging
    let tierName = 'UNKNOWN';
    if (!hasActiveMembership) {
      tierName = 'FREE (10/day)';
    } else if (membershipLevel === 0) {
      tierName = 'BASIC (20/day)';
    } else if (membershipLevel === 1) {
      tierName = 'PLUS (50/day)';
    } else if (membershipLevel === 2) {
      tierName = 'BUSINESS (Unlimited)';
    }
    console.log('[TaskController.createTask] Determined tier:', tierName);
    console.log('═══════════════════════════════════════════════════════════');

    try {
      const task = await this.taskService.createTask(user.userId, createTaskDto, membershipLevel, hasActiveMembership);
      console.log('[TaskController.createTask] ✅ Task created successfully');
      return new ApiResponseWrapper<TaskResponse>(task);
    } catch (error) {
      console.error('[TaskController.createTask] ❌ Error creating task:', error);
      throw error;
    }
  }

  @Get('debug/membership')
  async debugMembership(@Request() req): Promise<ApiResponseWrapper<any>> {
    const user = req.userInfo as UserDto;
    return new ApiResponseWrapper<any>({
      userId: user.userId,
      membership: user.membership,
      hasActiveMembership: user.membership?.hasActiveMembership,
      level: user.membership?.level,
      message: 'Debug info for membership'
    });
  }

  @Get('quota/today')
  async getTasksCreatedToday(@Request() req): Promise<ApiResponseWrapper<{ tasksCreatedToday: number }>> {
    const user = req.userInfo as UserDto;
    const tasksCreatedToday = await this.taskService.getTasksCreatedToday(user.userId);
    return new ApiResponseWrapper<{ tasksCreatedToday: number }>({
      tasksCreatedToday,
    });
  }

  @Get('debug/quota')
  async debugQuota(@Request() req): Promise<ApiResponseWrapper<any>> {
    const user = req.userInfo as UserDto;
    
    // Get today in UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
    
    // Get today in local timezone
    const todayLocal = new Date(now);
    todayLocal.setHours(0, 0, 0, 0);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
    
    return new ApiResponseWrapper<any>({
      userId: user.userId,
      message: 'Debug info for quota date ranges',
      dateRanges: {
        nowISO: now.toISOString(),
        todayUTC: {
          start: todayUTC.toISOString(),
          end: tomorrowUTC.toISOString(),
        },
        todayLocal: {
          start: todayLocal.toISOString(),
          end: tomorrowLocal.toISOString(),
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    });
  }

  @Get('debug/quota/all')
  async debugAllQuota(@Request() req): Promise<ApiResponseWrapper<any>> {
    const user = req.userInfo as UserDto;
    const records = await this.taskService.debugGetAllQuotaRecords(user.userId);
    return new ApiResponseWrapper<any>({
      userId: user.userId,
      quotaRecords: records,
    });
  }

  @Get('debug/quota/today')
  async debugTodayQuota(@Request() req): Promise<ApiResponseWrapper<any>> {
    const user = req.userInfo as UserDto;
    const records = await this.taskService.debugGetTodayQuota(user.userId);
    return new ApiResponseWrapper<any>({
      userId: user.userId,
      todayQuotaRecords: records,
    });
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateTaskRequest })
  @ApiOkResponse({
    description: 'Update task successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(TaskResponse) },
          },
        },
      ],
    },
  })
  @Put('/:id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskRequest,
  ): Promise<ApiResponseWrapper<TaskResponse>> {
    const task = await this.taskService.updateTask(taskId, updateTaskDto);
    return new ApiResponseWrapper<TaskResponse>(task);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete('/:id')
  async deleteTask(@Param('id') taskId: string): Promise<ApiResponseWrapper<void>> {
    await this.taskService.deleteTask(taskId);
    return new ApiResponseWrapper<void>(null);
  }
}
