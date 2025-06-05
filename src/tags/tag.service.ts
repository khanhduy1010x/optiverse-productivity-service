import { Injectable } from '@nestjs/common';
import { TagRepository } from './tag.repository';
import { Tag } from './tag.schema';
import { TagResponse } from './dto/response/TagResponse.dto';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';
import { TaskTagService } from '../task-tags/task-tag.service';

@Injectable()
export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly taskTagService: TaskTagService,
  ) {}

  async getAllTagsByUserID(userId: string): Promise<Tag[]> {
    return await this.tagRepository.getAllTagsByUserID(userId);
  }

  async getTagByID(tagId: string): Promise<TagResponse> {
    const tag = await this.tagRepository.getTagByID(tagId);
    return new TagResponse(tag);
  }

  async createTag(userId: string, createTagDto: CreateTagRequest): Promise<TagResponse> {
    const tag = await this.tagRepository.createTag(userId, createTagDto);
    return new TagResponse(tag);
  }

  async updateTag(tagId: string, updateTagDto: UpdateTagRequest): Promise<TagResponse> {
    const tag = await this.tagRepository.updateTag(tagId, updateTagDto);
    return new TagResponse(tag);
  }

  async deleteTag(tagId: string): Promise<void> {
    const tag = await this.tagRepository.deleteTag(tagId);

    await this.taskTagService.deleteMany({ tag_id: tag._id });
  }
}
