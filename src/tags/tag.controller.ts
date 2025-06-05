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
  constructor(private readonly tagService: TagService) {}

  @Get('all')
  async getAllTagsUser(@Request() req): Promise<ApiResponseWrapper<Tag[]>> {
    const user = req.userInfo as UserDto;
    const tags = await this.tagService.getAllTagsByUserID(user.userId);
    return new ApiResponseWrapper<Tag[]>(tags);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Get(':id')
  async getTagById(@Param('id') tagId: string): Promise<ApiResponseWrapper<TagResponse>> {
    const tag = await this.tagService.getTagByID(tagId);
    return new ApiResponseWrapper<TagResponse>(tag);
  }

  @ApiBody({ type: CreateTagRequest })
  @Post('')
  async createTag(
    @Request() req,
    @Body() createTagDto: CreateTagRequest,
  ): Promise<ApiResponseWrapper<TagResponse>> {
    const user = req.userInfo as UserDto;
    const tag = await this.tagService.createTag(user.userId, createTagDto);
    return new ApiResponseWrapper<TagResponse>(tag);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({ type: UpdateTagRequest })
  @Put(':id')
  async updateTag(
    @Param('id') tagId: string,
    @Body() updateTagDto: UpdateTagRequest,
  ): Promise<ApiResponseWrapper<TagResponse>> {
    const tag = await this.tagService.updateTag(tagId, updateTagDto);
    return new ApiResponseWrapper<TagResponse>(tag);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @Delete(':id')
  async deleteTag(@Param('id') tagId: string): Promise<ApiResponseWrapper<void>> {
    await this.tagService.deleteTag(tagId);
    return new ApiResponseWrapper<void>(null);
  }
}
