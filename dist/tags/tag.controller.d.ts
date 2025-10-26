import { TagService } from './tag.service';
import { Tag } from './tag.schema';
import { TagResponse } from './dto/response/TagResponse.dto';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';
import { ApiResponse as ApiResponseWrapper } from 'src/common/api-response';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    getAllTagsUser(req: any): Promise<ApiResponseWrapper<Tag[]>>;
    getTagById(tagId: string): Promise<ApiResponseWrapper<TagResponse>>;
    createTag(req: any, createTagDto: CreateTagRequest): Promise<ApiResponseWrapper<TagResponse>>;
    updateTag(tagId: string, updateTagDto: UpdateTagRequest): Promise<ApiResponseWrapper<TagResponse>>;
    deleteTag(tagId: string): Promise<ApiResponseWrapper<void>>;
}
