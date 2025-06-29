import { Model } from 'mongoose';
import { Tag } from './tag.schema';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';
export declare class TagRepository {
    private readonly tagModel;
    constructor(tagModel: Model<Tag>);
    getAllTagsByUserID(userId: string): Promise<Tag[]>;
    getTagByID(tagId: string): Promise<Tag>;
    createTag(userId: string, createTagDto: CreateTagRequest): Promise<Tag>;
    updateTag(tagId: string, updateTagDto: UpdateTagRequest): Promise<Tag>;
    deleteTag(tagId: string): Promise<Tag>;
}
