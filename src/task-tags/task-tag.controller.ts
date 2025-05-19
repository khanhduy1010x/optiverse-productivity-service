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
  
}
