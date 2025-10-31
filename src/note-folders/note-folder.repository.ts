import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { NoteFolder, NoteFolderTree } from './note-folder.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';

@Injectable()
export class NoteFolderRepository {
  constructor(
    @InjectModel(NoteFolder.name)
    private readonly noteFolderModel: Model<NoteFolder>,
  ) {}

  async getNoteFolderById(id: string): Promise<NoteFolder | null> {
    return await this.noteFolderModel.findById(id).populate('files').lean();
  }

  async getAllSubfolders(parentFolderId: string): Promise<NoteFolder[]> {
    const allSubfolders: NoteFolder[] = [];
    const queue = [parentFolderId];

    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const subfolders = await this.noteFolderModel
        .find({
          parent_folder_id: new mongoose.Types.ObjectId(currentParentId),
        })
        .populate('files')
        .lean();

      if (subfolders) {
        allSubfolders.push(...subfolders);
        queue.push(...subfolders.map((folder) => folder._id.toString()));
      }
    }

    return allSubfolders;
  }

  async getNoteFoldersByUserID(userId: string): Promise<NoteFolder[]> {
    return await this.noteFolderModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [
          { parent_folder_id: null },
          { parent_folder_id: { $exists: false } },
        ],
      })
      .populate('files')
      .lean();
  }

  async getNoteFolderByRoomId(roomId: string): Promise<NoteFolder | null> {
    return await this.noteFolderModel
      .findOne({
        live_room_id: new Types.ObjectId(roomId),
        $or: [
          { parent_folder_id: null },
          { parent_folder_id: { $exists: false } },
        ],
      })
      .populate('files')
      .lean();
  }

  async createNoteFolder(
    createNoteFolderDto: CreateNoteFolderRequest,
    userId: string,
  ): Promise<NoteFolder> {
    const newNoteFolder = new this.noteFolderModel({
      ...createNoteFolderDto,
      user_id: new Types.ObjectId(userId),
      parent_folder_id: createNoteFolderDto.parent_folder_id
        ? new Types.ObjectId(createNoteFolderDto.parent_folder_id)
        : null,
    });
    return await newNoteFolder.save();
  }

  async createNoteFolderForRoom(
    roomId: string,
    userId: string,
  ): Promise<NoteFolder> {
    const newNoteFolder = new this.noteFolderModel({
      name: `Room Notes`,
      user_id: new Types.ObjectId(userId),
      live_room_id: new Types.ObjectId(roomId),
      parent_folder_id: null,
    });
    return await newNoteFolder.save();
  }

  async updateNoteFolder(
    noteFolderId: string,
    updateNoteFolderDto: UpdateNoteFolderRequest,
  ): Promise<NoteFolder> {
    const update: any = { ...updateNoteFolderDto };

    if ('parent_folder_id' in updateNoteFolderDto) {
      const parent_folder_id = updateNoteFolderDto.parent_folder_id;

      if (typeof parent_folder_id === 'string') {
        update.parent_folder_id = new Types.ObjectId(parent_folder_id);
      }
    }

    return await this.noteFolderModel
      .findByIdAndUpdate(noteFolderId, update, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteNoteFolder(noteFolderId: string): Promise<void> {
    const result = await this.noteFolderModel
      .deleteOne({ _id: noteFolderId })
      .exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async deleteManyByIds(ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const result = await this.noteFolderModel.deleteMany({
      _id: { $in: objectIds },
    });
  }
}
