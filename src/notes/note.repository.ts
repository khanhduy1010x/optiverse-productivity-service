import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './note.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { CreateNoteRoomRequest } from './dto/request/CreateNoteRoomRequest.dto';

@Injectable()
export class NoteRepository {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
  ) {}

  async getNotesByUserID(userId: string): Promise<Note[]> {
    return await this.noteModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [{ folder_id: null }, { folder_id: { $exists: false } }],
        // Exclude workspace notes and live room notes
        workspace_id: { $exists: false },
        live_room_id: { $exists: false },
      })
      .exec();
  }

  async getNotesByFolderID(folderId: string): Promise<Note[]> {
    return await this.noteModel
      .find({
        folder_id: new Types.ObjectId(folderId),
        // Exclude workspace notes and live room notes
        workspace_id: { $exists: false },
        live_room_id: { $exists: false },
      })
      .exec();
  }

  async getNotesByRoomId(roomId: string): Promise<Note[]> {
    return await this.noteModel
      .find({ live_room_id: new Types.ObjectId(roomId) })
      .exec();
  }

  async createNote(
    createNoteDto: CreateNoteRequest,
    userId: string,
  ): Promise<Note> {
    const newNote = new this.noteModel({
      ...createNoteDto,
      user_id: new Types.ObjectId(userId),
      folder_id: createNoteDto.folder_id
        ? new Types.ObjectId(createNoteDto.folder_id)
        : null,
    });
    return await newNote.save();
  }

  async createNoteInRoom(
    createNoteDto: CreateNoteRoomRequest,
    userId: string,
    folderId?: string,
  ): Promise<Note> {
    const newNote = new this.noteModel({
      title: createNoteDto.title,
      content: '',
      user_id: new Types.ObjectId(userId),
      folder_id: folderId ? new Types.ObjectId(folderId) : null,
      live_room_id: new Types.ObjectId(createNoteDto.live_room_id),
      create_by: new Types.ObjectId(userId),
    });
    return await newNote.save();
  }

  async updateNote(
    noteId: string,
    updateNoteDto: UpdateNoteRequest,
  ): Promise<Note> {
    const update: any = { ...updateNoteDto };

    if ('folder_id' in updateNoteDto) {
      const folder_id = updateNoteDto.folder_id;

      if (typeof folder_id === 'string') {
        update.folder_id = new Types.ObjectId(folder_id);
      }
    }

    return await this.noteModel
      .findByIdAndUpdate(new Types.ObjectId(noteId), update, { new: true })
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }

  async deleteNote(noteId: string): Promise<void> {
    const result = await this.noteModel.deleteOne({ _id: noteId }).exec();
    if (result.deletedCount === 0) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
  }

  async deleteManyByIds(ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const result = await this.noteModel.deleteMany({
      _id: { $in: objectIds },
    });
  }
  async getNoteInRootByUserID(userId: string): Promise<Note[]> {
    return await this.noteModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [{ folder_id: null }, { folder_id: { $exists: false } }],
        // Exclude workspace notes and live room notes
        workspace_id: { $exists: false },
        live_room_id: { $exists: false },
      })
      .lean()
      .exec();
  }
  async getNoteByID(id: string): Promise<Note> {
    return await this.noteModel
      .findById(id)
      .lean()
      .orFail(new AppException(ErrorCode.NOT_FOUND));
  }
}
