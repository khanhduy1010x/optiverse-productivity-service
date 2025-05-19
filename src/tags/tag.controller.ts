import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.schema';
import { TagResponse } from './dto/response/TagResponse.dto';
import { CreateTaskRequest } from '../tasks/dto/request/CreateTaskRequest.dto';
import { UpdateTaskRequest } from '../tasks/dto/request/UpdateTaskRequest.dto';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';

@ApiTags('Tag')
@ApiBearerAuth('access-token')
@ApiExtraModels(ApiResponseWrapper, TagResponse)
@Controller('/tag')
export class TagController {
  
}
