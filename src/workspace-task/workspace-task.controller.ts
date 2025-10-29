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

@ApiTags('workspace-task')
@ApiBearerAuth('access-token')
@Controller('/workspace/:workspaceId/task')
export class WorkspaceTaskController {
  private logger = new Logger('WorkspaceTaskController');

  constructor(private readonly workspaceTaskService: WorkspaceTaskService) {}

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
      );
      this.logger.log(`[createTask] Task created successfully:`, task._id);
      return new ApiResponse<WorkspaceTask>(task);
    } catch (error) {
      this.logger.error(`[createTask] Error: ${error.message}`, error.stack);
      if (error instanceof AppException) {
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
      if (updateTaskDto.status !== undefined) {
        updateData.status = updateTaskDto.status;
      }
      if (updateTaskDto.assigned_to !== undefined) {
        // Convert string to ObjectId
        if (Types.ObjectId.isValid(updateTaskDto.assigned_to)) {
          updateData.assigned_to = new Types.ObjectId(updateTaskDto.assigned_to);
        } else {
          throw new Error('Invalid assigned_to ID format');
        }
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
    @Body() { userId }: { userId: string },
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.assignTask(
      taskId,
      user.userId,
      userId,
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
}
