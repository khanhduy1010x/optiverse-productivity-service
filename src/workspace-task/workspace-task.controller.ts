import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WorkspaceTaskService } from './workspace-task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { UserDto } from 'src/user-dto/user.dto';
import { ApiResponse } from 'src/common/api-response';
import { WorkspaceTask } from './workspace-task.schema';

@ApiTags('workspace-task')
@ApiBearerAuth('access-token')
@Controller('/workspace/:workspaceId/task')
export class WorkspaceTaskController {
  constructor(private readonly workspaceTaskService: WorkspaceTaskService) {}

  // ========== Task Endpoints ==========
  @Post('')
  async createTask(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.createTask(
      workspaceId,
      user.userId,
      createTaskDto.title,
      createTaskDto.description,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Get('')
  async getTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<WorkspaceTask[]>> {
    const tasks = await this.workspaceTaskService.getTasksByWorkspace(
      workspaceId,
    );
    return new ApiResponse<WorkspaceTask[]>(tasks);
  }

  @Get('status/:status')
  async getTasksByStatus(
    @Param('workspaceId') workspaceId: string,
    @Param('status') status: string,
  ): Promise<ApiResponse<WorkspaceTask[]>> {
    const tasks = await this.workspaceTaskService.getTasksByStatus(
      workspaceId,
      status,
    );
    return new ApiResponse<WorkspaceTask[]>(tasks);
  }

  @Get(':taskId')
  async getTaskById(
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<WorkspaceTask>> {
    const task = await this.workspaceTaskService.getTaskById(taskId);
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Put(':taskId')
  async updateTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const updateData: any = { ...updateTaskDto };
    const task = await this.workspaceTaskService.updateTask(
      taskId,
      user.userId,
      updateData,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Delete(':taskId')
  async deleteTask(
    @Request() req,
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceTaskService.deleteTask(taskId, user.userId);
    return new ApiResponse<void>(null);
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
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.updateTaskStatus(
      taskId,
      user.userId,
      status,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  // ========== Subtask Endpoints ==========
  @Post(':taskId/subtask')
  async createSubtask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.createSubtask(
      taskId,
      user.userId,
      createSubtaskDto.title,
      createSubtaskDto.description,
      createSubtaskDto.assigned_to,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Put(':taskId/subtask/:subtaskId')
  async updateSubtask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.updateSubtask(
      taskId,
      subtaskId,
      user.userId,
      updateSubtaskDto,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }

  @Delete(':taskId/subtask/:subtaskId')
  async deleteSubtask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceTaskService.deleteSubtask(
      taskId,
      subtaskId,
      user.userId,
    );
    return new ApiResponse<void>(null);
  }

  @Put(':taskId/subtask/:subtaskId/status')
  async updateSubtaskStatus(
    @Request() req,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() { status }: { status: string },
  ): Promise<ApiResponse<WorkspaceTask>> {
    const user = req.userInfo as UserDto;
    const task = await this.workspaceTaskService.updateSubtaskStatus(
      taskId,
      subtaskId,
      user.userId,
      status,
    );
    return new ApiResponse<WorkspaceTask>(task);
  }
}
