import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { TaskTagService } from './task-tag.service';
import { TaskTagResponse } from './dto/response/TaskTagResponse.dto';
import { CreateTaskTagRequest } from './dto/request/CreateTaskTagRequest.dto';

import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Task Tag')
@ApiBearerAuth('access-token')
@ApiExtraModels(ApiResponseWrapper, TaskTagResponse)
@Controller('/task-tag')
export class TaskTagController {
  constructor(private readonly taskTagService: TaskTagService) {}

  @ApiBody({ type: CreateTaskTagRequest })
  @ApiOkResponse({
    description: 'Create task successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseWrapper) },
        {
          type: 'object',
          properties: {
            data: { $ref: getSchemaPath(TaskTagResponse) },
          },
        },
      ],
    },
  })
  @Post('')
  async createTaskTag(
    @Body() createTaskTagDto: CreateTaskTagRequest,
  ): Promise<ApiResponseWrapper<TaskTagResponse>> {
    const taskTag = await this.taskTagService.createTaskTag(createTaskTagDto);
    return new ApiResponseWrapper<TaskTagResponse>(taskTag);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete(':id')
  async deleteTaskTag(@Param('id') taskTagId: string): Promise<ApiResponseWrapper<void>> {
    await this.taskTagService.deleteTaskTag(taskTagId);
    return new ApiResponseWrapper<void>(null);
  }
}
