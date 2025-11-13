import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NoteFolder, NoteFolderDocument } from '../note-folder.schema';
import { Note, NoteDocument } from '../../notes/note.schema';

@Injectable()
export class WorkspaceFolderRepository {
  constructor(
    @InjectModel(NoteFolder.name)
    private folderModel: Model<NoteFolderDocument>,
    @InjectModel(Note.name)
    private noteModel: Model<NoteDocument>,
  ) {}

  /**
   * Get all folders in a workspace
   */
  async findByWorkspaceId(
    workspaceId: string | Types.ObjectId,
    limit = 10,
    skip = 0,
  ): Promise<NoteFolder[]> {
    return this.folderModel
      .find({ workspace_id: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get total count of folders in workspace
   */
  async countByWorkspaceId(
    workspaceId: string | Types.ObjectId,
  ): Promise<number> {
    return this.folderModel
      .countDocuments({ workspace_id: new Types.ObjectId(workspaceId) })
      .exec();
  }

  /**
   * Get folder by ID
   */
  async findById(
    folderId: string | Types.ObjectId,
  ): Promise<NoteFolder | null> {
    return this.folderModel.findById(folderId).exec();
  }

  /**
   * Get all child folders (direct children)
   */
  async findChildFolders(
    parentFolderId: string | Types.ObjectId,
  ): Promise<NoteFolder[]> {
    return this.folderModel
      .find({ parent_folder_id: new Types.ObjectId(parentFolderId) })
      .exec();
  }

  /**
   * Get all descendant folder IDs recursively
   */
  async findAllDescendants(
    parentFolderId: string | Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const descendants: Types.ObjectId[] = [];
    const queue: Types.ObjectId[] = [new Types.ObjectId(parentFolderId)];

    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = await this.folderModel
        .find({ parent_folder_id: currentId })
        .select('_id')
        .exec();

      for (const child of children) {
        descendants.push(child._id);
        queue.push(child._id);
      }
    }

    return descendants;
  }

  /**
   * Create new folder
   */
  async createFolder(folderData: {
    workspace_id: string | Types.ObjectId;
    user_id?: string | Types.ObjectId;
    name: string;
    parent_folder_id?: string | Types.ObjectId;
  }): Promise<NoteFolder> {
    const newFolder = new this.folderModel({
      workspace_id: new Types.ObjectId(folderData.workspace_id),
      user_id: folderData.user_id
        ? new Types.ObjectId(folderData.user_id)
        : undefined,
      name: folderData.name,
      parent_folder_id: folderData.parent_folder_id
        ? new Types.ObjectId(folderData.parent_folder_id)
        : undefined,
    });
    return newFolder.save();
  }

  /**
   * Update folder
   */
  async updateFolder(
    folderId: string | Types.ObjectId,
    updateData: Partial<NoteFolder>,
  ): Promise<NoteFolder | null> {
    return this.folderModel
      .findByIdAndUpdate(folderId, updateData, { new: true })
      .exec();
  }

  /**
   * Delete folder and all its descendants recursively
   */
  async deleteFolderAndChildren(
    folderId: string | Types.ObjectId,
  ): Promise<number> {
    // Get all descendants
    const descendants = await this.findAllDescendants(folderId);
    const allFoldersToDelete = [new Types.ObjectId(folderId), ...descendants];

    // Delete all notes in these folders
    await this.noteModel.deleteMany({
      folder_id: { $in: allFoldersToDelete },
    });

    // Delete all folders
    const result = await this.folderModel.deleteMany({
      _id: { $in: allFoldersToDelete },
    });

    return result.deletedCount || 0;
  }

  /**
   * Check if folder belongs to workspace
   */
  async isFolderInWorkspace(
    folderId: string | Types.ObjectId,
    workspaceId: string | Types.ObjectId,
  ): Promise<boolean> {
    const folder = await this.folderModel
      .findOne({
        _id: new Types.ObjectId(folderId),
        workspace_id: new Types.ObjectId(workspaceId),
      })
      .exec();
    return !!folder;
  }

  /**
   * Find folder by name in specific parent folder within workspace
   */
  async findByNameInParent(
    workspaceId: string | Types.ObjectId,
    name: string,
    parentFolderId: string | Types.ObjectId | null,
  ): Promise<NoteFolder | null> {
    const query: any = {
      workspace_id: new Types.ObjectId(workspaceId),
      name: name,
    };

    if (parentFolderId) {
      query.parent_folder_id = new Types.ObjectId(parentFolderId);
    } else {
      query.$or = [
        { parent_folder_id: { $exists: false } },
        { parent_folder_id: null },
      ];
    }

    return this.folderModel.findOne(query).exec();
  }
}
