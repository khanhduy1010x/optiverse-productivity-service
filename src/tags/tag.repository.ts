import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag } from './tag.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';

@Injectable()
export class TagRepository {
  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<Tag>) {}

  async getAllTagsByUserID(userId: string): Promise<Tag[]> {
    return await this.tagModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate({ path: 'tasks', populate: { path: 'task' } })
      .exec();
  }

  async getTagByID(tagId: string): Promise<Tag> {
    return await this.tagModel
      .findById(new Types.ObjectId(tagId))
      .populate({ path: 'tasks', populate: { path: 'task' } })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async createTag(userId: string, createTagDto: CreateTagRequest): Promise<Tag> {
    const newTag = new this.tagModel({
      ...createTagDto,
      user_id: new Types.ObjectId(userId),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await newTag.save();
  }

  async updateTag(tagId: string, updateTagDto: UpdateTagRequest): Promise<Tag> {
    return await this.tagModel
      .findByIdAndUpdate(new Types.ObjectId(tagId), updateTagDto, { new: true })
      .populate({ path: 'tasks', populate: { path: 'task' } })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteTag(tagId: string): Promise<Tag> {
    const tag = await this.tagModel.findByIdAndDelete(tagId).exec();
    if (!tag) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    return tag;
  }
}
