import { Injectable } from '@nestjs/common';
import { NoteFolderRepository } from './note-folder.repository';
import { NoteFolder, NoteFolderTree } from './note-folder.schema';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
import { NoteFolderResponse } from './dto/response/NoteFolderResponse.dto';
import { NoteRepository } from '../notes/note.repository';
import { NoteService } from '../notes/note.service';

@Injectable()
export class NoteFolderService {
  constructor(
    private readonly noteFolderRepository: NoteFolderRepository,
    private readonly noteService: NoteService,
  ) {}

  async getFolderById(folderId: string): Promise<NoteFolderTree | null> {
    const folder = await this.noteFolderRepository.getNoteFolderById(folderId);

    if (folder === null) {
      return folder;
    }

    const allSubfolders = await this.noteFolderRepository.getAllSubfolders(folderId);

    const responseFolder = this.buildFolderTree([folder, ...allSubfolders]);

    return responseFolder;
  }

  buildFolderTree(flatList: NoteFolder[]): NoteFolderTree | null {
    const folderMap: Map<string, NoteFolderTree> = new Map();
    let root: NoteFolderTree | null = null;

    flatList.forEach((folder) => {
      const folderTree: NoteFolderTree = { ...folder, subfolders: [] };
      folderMap.set(folder._id.toString(), folderTree);
    });

    flatList.forEach((folder: NoteFolderTree) => {
      if (!folder.parent_folder_id) {
        if (!root) {
          root = folderMap.get(folder._id.toString())!;
        }
        return;
      }

      const parent = folderMap.get(folder.parent_folder_id.toString());
      if (parent) {
        parent.subfolders.push(folderMap.get(folder._id.toString())!);
      }
    });

    return root;
  }

  async getNoteFoldersByUserID(userId: string): Promise<NoteFolder[]> {
    return await this.noteFolderRepository.getNoteFoldersByUserID(userId);
  }

  async createNoteFolder(
    createNoteFolderDto: CreateNoteFolderRequest,
    userId: string,
  ): Promise<NoteFolderResponse> {
    const noteFolder = await this.noteFolderRepository.createNoteFolder(
      createNoteFolderDto,
      userId,
    );
    return new NoteFolderResponse(noteFolder);
  }

  async updateNoteFolder(
    noteFolderId: string,
    updateNoteFolderDto: UpdateNoteFolderRequest,
  ): Promise<NoteFolderResponse> {
    const noteFolder = await this.noteFolderRepository.updateNoteFolder(
      noteFolderId,
      updateNoteFolderDto,
    );
    return new NoteFolderResponse(noteFolder);
  }

  async deleteNoteFolder(folderId: string): Promise<void> {
    const folder = await this.noteFolderRepository.getNoteFolderById(folderId);

    if (folder === null) {
      return;
    }

    const allSubfolders = await this.noteFolderRepository.getAllSubfolders(folderId);
    const folderIds = [folderId, ...allSubfolders.map((folder) => folder._id.toString())];
    let fileIds = allSubfolders.flatMap((folder) => {
      const files = folder['files']?.map((file) => file._id.toString());
      return files;
    });
    const currentFileIdsInThisFolder = folder['files']?.map((file) => file._id.toString());

    fileIds = [...currentFileIdsInThisFolder, ...fileIds];

    await this.noteService.deleteManyByIds(fileIds);
    await this.noteFolderRepository.deleteManyByIds(folderIds);
  }

  async retrieveAllFolderInRoot(user_id: string): Promise<NoteFolderTree[] | null> {
    const allFolders = await this.noteFolderRepository.getNoteFoldersByUserID(user_id);
    if (!allFolders || allFolders.length === 0) return null;
    const folderTrees: NoteFolderTree[] = [];
    for (const root of allFolders) {
      const allSubfolders = await this.noteFolderRepository.getAllSubfolders(root._id.toString());
      const tree = this.buildFolderTree([root, ...allSubfolders]);
      if (tree) {
        folderTrees.push(tree);
      }
    }
    return folderTrees;
  }
}
