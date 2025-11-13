import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../note.schema';

@Injectable()
export class WorkspaceNoteRepository {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  /**
   * Create new note in workspace
   */
  async createNote(noteData: {
    workspace_id: string | Types.ObjectId;
    user_id: string | Types.ObjectId;
    title: string;
    content?: string;
    folder_id?: string | Types.ObjectId;
    create_by?: string | Types.ObjectId;
  }): Promise<Note> {
    const newNote = new this.noteModel({
      workspace_id: new Types.ObjectId(noteData.workspace_id),
      user_id: new Types.ObjectId(noteData.user_id),
      title: noteData.title,
      content: noteData.content || '',
      folder_id: noteData.folder_id
        ? new Types.ObjectId(noteData.folder_id)
        : undefined,
      create_by: noteData.create_by
        ? new Types.ObjectId(noteData.create_by)
        : new Types.ObjectId(noteData.user_id),
    });
    return newNote.save();
  }

  /**
   * Get all notes in a workspace
   */
  async findByWorkspaceId(
    workspaceId: string | Types.ObjectId,
    limit = 10,
    skip = 0,
  ): Promise<Note[]> {
    return this.noteModel
      .find({ workspace_id: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get total count of notes in workspace
   */
  async countByWorkspaceId(
    workspaceId: string | Types.ObjectId,
  ): Promise<number> {
    return this.noteModel
      .countDocuments({ workspace_id: new Types.ObjectId(workspaceId) })
      .exec();
  }

  /**
   * Get note by ID
   */
  async findById(noteId: string | Types.ObjectId): Promise<Note | null> {
    return this.noteModel.findById(noteId).exec();
  }

  /**
   * Update note
   */
  async updateNote(
    noteId: string | Types.ObjectId,
    updateData: Partial<Note>,
  ): Promise<Note | null> {
    return this.noteModel
      .findByIdAndUpdate(noteId, updateData, { new: true })
      .exec();
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string | Types.ObjectId): Promise<Note | null> {
    return this.noteModel.findByIdAndDelete(noteId).exec();
  }

  /**
   * Check if note belongs to workspace
   */
  async isNoteInWorkspace(
    noteId: string | Types.ObjectId,
    workspaceId: string | Types.ObjectId,
  ): Promise<boolean> {
    const note = await this.noteModel
      .findOne({
        _id: new Types.ObjectId(noteId),
        workspace_id: new Types.ObjectId(workspaceId),
      })
      .exec();
    return !!note;
  }

  /**
   * Find note by name in specific folder within workspace
   */
  async findByNameInFolder(
    workspaceId: string | Types.ObjectId,
    title: string,
    folderId: string | Types.ObjectId | null,
  ): Promise<Note | null> {
    const query: any = {
      workspace_id: new Types.ObjectId(workspaceId),
      title: title,
    };

    if (folderId) {
      query.folder_id = new Types.ObjectId(folderId);
    } else {
      query.$or = [{ folder_id: { $exists: false } }, { folder_id: null }];
    }

    return this.noteModel.findOne(query).exec();
  }
}
