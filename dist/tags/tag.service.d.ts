import { TagRepository } from './tag.repository';
import { Tag } from './tag.schema';
import { TagResponse } from './dto/response/TagResponse.dto';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';
import { TaskTagService } from '../task-tags/task-tag.service';
export declare class TagService {
    private readonly tagRepository;
    private readonly taskTagService;
    constructor(tagRepository: TagRepository, taskTagService: TaskTagService);
    getAllTagsByUserID(userId: string): Promise<Tag[]>;
    getTagByID(tagId: string): Promise<TagResponse>;
    createTag(userId: string, createTagDto: CreateTagRequest): Promise<TagResponse>;
    updateTag(tagId: string, updateTagDto: UpdateTagRequest): Promise<TagResponse>;
    deleteTag(tagId: string): Promise<void>;
}
