import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { WorkspaceTaskService } from './workspace-task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserDto } from 'src/user-dto/user.dto';
import { ApiResponse } from 'src/common/api-response';
import { WorkspaceTask } from './workspace-task.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { TaskRolePreset } from './task-permission.enum';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { MembershipHttpClient } from 'src/http-axios/membership-http.client';

@ApiTags('workspace-task')
@ApiBearerAuth('access-token')
@Controller('/workspace/:workspaceId/task')
export class WorkspaceTaskController {
  private logger = new Logger('WorkspaceTaskController');

  constructor(
    private readonly workspaceTaskService: WorkspaceTaskService,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly membershipHttpClient: MembershipHttpClient,
  ) {}

  // ========== Task Endpoints ==========
  @Post('')
  async createTask(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    try {
      this.logger.log(`[createTask] Received request for workspace: ${workspaceId}`);
      this.logger.log(`[createTask] DTO:`, JSON.stringify(createTaskDto));
      
      const user = req.userInfo as UserDto;
      
      // Get workspace to retrieve owner_id
      const workspace = await this.workspaceRepository.getWorkspaceById(workspaceId);
      if (!workspace) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      
      const ownerId = workspace.owner_id.toString();
      this.logger.log(`[createTask] Workspace owner: ${ownerId}`);
      
      // Get owner's membership info from core service
      // MAPPING:
      //   hasActiveMembership: false → FREE (10/day limit)
      //   hasActiveMembership: true:
      //     level: 0 → BASIC (20/day limit)
      //     level: 1 → PLUS (50/day limit)
      //     level: 2 → BUSINESS (unlimited)
      
      // Step 1: Get membership level from core service
      let ownerMembershipLevel = 0;
      let ownerHasActiveMembership = false;
      
      try {
        const membershipLevel = await this.membershipHttpClient.getUserMembershipLevel(ownerId);
        this.logger.log(`[createTask] Owner membership level from core service: ${membershipLevel}`);
        
        // Parse membership level
        if (membershipLevel !== undefined && membershipLevel !== null) {
          if (typeof membershipLevel === 'string') {
            ownerMembershipLevel = parseInt(membershipLevel, 10);
          } else if (typeof membershipLevel === 'number') {
            ownerMembershipLevel = membershipLevel;
          }
          
          // If level is valid (0, 1, 2), user has active membership
          if (Number.isInteger(ownerMembershipLevel) && ownerMembershipLevel >= 0 && ownerMembershipLevel <= 2) {
            ownerHasActiveMembership = true;
            this.logger.log(`[createTask] Owner has active membership - level: ${ownerMembershipLevel}`);
          } else {
            // Invalid level or -1 (FREE)
            ownerHasActiveMembership = false;
            ownerMembershipLevel = 0;
            this.logger.log(`[createTask] Owner membership level invalid or -1 → FREE tier`);
          }
        } else {
          // No membership data
          ownerHasActiveMembership = false;
          ownerMembershipLevel = 0;
          this.logger.log(`[createTask] No membership data → FREE tier`);
        }
      } catch (error) {
        this.logger.error(`[createTask] Error getting owner membership: ${error.message}`);
        // Default to FREE on error
        ownerHasActiveMembership = false;
        ownerMembershipLevel = 0;
      }
      
      this.logger.log(`[createTask] Final - ownerMembershipLevel: ${ownerMembershipLevel}, ownerHasActiveMembership: ${ownerHasActiveMembership}`);
      
      // Handle null or empty string assigned_to
      let assignedTo = createTaskDto.assigned_to;
      if (assignedTo === '' || assignedTo === null) {
        assignedTo = undefined;
      }
      
      const task = await this.workspaceTaskService.createTask(
        workspaceId,
        user.userId,
        createTaskDto.title,
        createTaskDto.description,
        assignedTo,
        createTaskDto.end_time,
        createTaskDto.assigned_to_list,
        ownerMembershipLevel,
        ownerHasActiveMembership,
      );
      this.logger.log(`[createTask] Task created successfully:`, task._id);
      return new ApiResponse<WorkspaceTask>(task);
    } catch (error) {
      this.logger.error(`[createTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Get('')
  async getTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<WorkspaceTask[]>> {
    try {
      this.logger.log(`[getTasksByWorkspace] Received request for workspace: ${workspaceId}`);
      const tasks = await this.workspaceTaskService.getTasksByWorkspace(
        workspaceId,
      );
      this.logger.log(`[getTasksByWorkspace] Returning ${tasks.length} tasks`);
      return new ApiResponse<WorkspaceTask[]>(tasks);
    } catch (error) {
      this.logger.error(`[getTasksByWorkspace] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Get('status/:status')
  async getTasksByStatus(
    @Param('workspaceId') workspaceId: string,
    @Param('status') status: string,
  ): Promise<ApiResponse<WorkspaceTask[]>> {
    try {
      const tasks = await this.workspaceTaskService.getTasksByStatus(
        workspaceId,
        status,
      );
      return new ApiResponse<WorkspaceTask[]>(tasks);
    } catch (error) {
      this.logger.error(`[getTasksByStatus] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Get('by-status/:status')
  async getTasksByStatusAlternative(
    @Param('workspaceId') workspaceId: string,
    @Param('status') status: string,
  ): Promise<ApiResponse<WorkspaceTask[]>> {
    try {
      const tasks = await this.workspaceTaskService.getTasksByStatus(
        workspaceId,
        status,
      );
      return new ApiResponse<WorkspaceTask[]>(tasks);
    } catch (error) {
      this.logger.error(`[getTasksByStatusAlternative] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Get(':taskId')
  async getTaskById(
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<WorkspaceTask>> {
    try {
      const task = await this.workspaceTaskService.getTaskById(taskId);
      return new ApiResponse<WorkspaceTask>(task);
    } catch (error) {
      this.logger.error(`[getTaskById] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Put(':taskId')
  async updateTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    try {
      this.logger.warn(`[PUT REQUEST] RECEIVED UPDATE REQUEST FOR TASK: ${taskId}`);
      this.logger.warn(`[PUT REQUEST] Received DTO: ${JSON.stringify(updateTaskDto)}`);
      
      this.logger.log(`Updating task ${taskId}`);
      this.logger.debug(`[updateTask] Received DTO:`, JSON.stringify(updateTaskDto));
      const user = req.userInfo as UserDto;
      
      // Validate taskId is valid MongoDB ID
      if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('Invalid task ID format');
      }

      const updateData: any = {};

      // Only include fields that are provided
      if (updateTaskDto.title !== undefined) {
        updateData.title = updateTaskDto.title;
      }
      if (updateTaskDto.description !== undefined) {
        updateData.description = updateTaskDto.description;
      }
      // NOTE: Do NOT update status via updateTask - use updateTaskStatus endpoint instead
      // This ensures status changes are intentional and logged
      if (updateTaskDto.status !== undefined) {
        this.logger.warn(`[updateTask] Attempted to update status directly - ignoring. Use updateTaskStatus endpoint instead.`);
        // Don't update status
      }
      if (updateTaskDto.assigned_to !== undefined) {
        // Convert string to ObjectId
        if (Types.ObjectId.isValid(updateTaskDto.assigned_to)) {
          updateData.assigned_to = new Types.ObjectId(updateTaskDto.assigned_to);
        } else {
          throw new Error('Invalid assigned_to ID format');
        }
      }
      if (updateTaskDto.assigned_to_list !== undefined) {
        // Convert array of strings to ObjectIds
        if (updateTaskDto.assigned_to_list.length > 0) {
          const validIds = updateTaskDto.assigned_to_list.every(id => Types.ObjectId.isValid(id));
          if (!validIds) {
            throw new Error('Invalid ID in assigned_to_list');
          }
          updateData.assigned_to_list = updateTaskDto.assigned_to_list.map(id => new Types.ObjectId(id));
        } else {
          updateData.assigned_to_list = [];
        }
      }
      if (updateTaskDto.end_time !== undefined) {
        updateData.end_time = updateTaskDto.end_time ? new Date(updateTaskDto.end_time) : null;
      }

      this.logger.debug(`[updateTask] Update data to be sent:`, JSON.stringify(updateData));

      const task = await this.workspaceTaskService.updateTask(
        taskId,
        user.userId,
        updateData,
      );
      this.logger.log(`[updateTask] Task updated, returning:`, JSON.stringify(task));
      return new ApiResponse<WorkspaceTask>(task);
    } catch (error) {
      this.logger.error(`[updateTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Delete(':taskId')
  async deleteTask(
    @Request() req,
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<void>> {
    try {
      const user = req.userInfo as UserDto;
      await this.workspaceTaskService.deleteTask(taskId, user.userId);
      return new ApiResponse<void>(null);
    } catch (error) {
      this.logger.error(`[deleteTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Post(':taskId/assign')
  async assignTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() { userId, userIds }: { userId?: string; userIds?: string[] },
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    // Support both single userId (legacy) and userIds array (new)
    const assignToUserIds = userIds || (userId ? [userId] : []);
    const task = await this.workspaceTaskService.assignTask(
      taskId,
      user.userId,
      assignToUserIds,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Put(':taskId/status')
  async updateTaskStatus(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() { status }: { status: string },
  ): Promise<ApiResponse<WorkspaceTask>> {
    try {
      const user = req.userInfo as UserDto;
      const task = await this.workspaceTaskService.updateTaskStatus(
        taskId,
        user.userId,
        status,
      );
      return new ApiResponse<WorkspaceTask>(task);
    } catch (error) {
      this.logger.error(`[updateTaskStatus] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  // ========== Task Permission Endpoints ==========
  @Post(':taskId/grant-permission')
  async grantTaskPermission(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() { memberId, role }: { memberId: string; role: TaskRolePreset },
  ): Promise<ApiResponse<void>> {
    try {
      const user = req.userInfo as UserDto;
      await this.workspaceTaskService.grantTaskPermission(
        taskId,
        memberId,
        role,
        user.userId,
      );
      return new ApiResponse<void>(null);
    } catch (error) {
      this.logger.error(`[grantTaskPermission] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Post(':taskId/transfer-ownership')
  async transferTaskOwnership(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() { newOwnerId }: { newOwnerId: string },
  ): Promise<ApiResponse<void>> {
    try {
      const user = req.userInfo as UserDto;
      await this.workspaceTaskService.transferTaskOwnership(
        taskId,
        user.userId,
        newOwnerId,
      );
      return new ApiResponse<void>(null);
    } catch (error) {
      this.logger.error(`[transferTaskOwnership] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Get(':taskId/permissions')
  async getTaskPermissions(
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<any>> {
    try {
      const members = await this.workspaceTaskService.getTaskMembers(taskId);
      return new ApiResponse<any>(members);
    } catch (error) {
      this.logger.error(`[getTaskPermissions] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  @Delete(':taskId/remove-permission')
  async removeTaskPermission(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() { memberId }: { memberId: string },
  ): Promise<ApiResponse<void>> {
    try {
      const user = req.userInfo as UserDto;
      await this.workspaceTaskService.removeTaskPermission(
        taskId,
        memberId,
        user.userId,
      );
      return new ApiResponse<void>(null);
    } catch (error) {
      this.logger.error(`[removeTaskPermission] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }
}
