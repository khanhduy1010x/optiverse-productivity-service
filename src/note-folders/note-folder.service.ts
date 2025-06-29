import { Injectable } from '@nestjs/common';
import { NoteFolderRepository } from './note-folder.repository';
import {
  NoteFolder,
  NoteFolderTree,
  NoteWithType,
  RootItem,
} from './note-folder.schema';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';
import { NoteFolderResponse } from './dto/response/NoteFolderResponse.dto';
import { NoteRepository } from '../notes/note.repository';
import { NoteService } from '../notes/note.service';
import { Note } from 'src/notes/note.schema';
import { ShareRepository } from '../shares/share.repository';
import { UserHttpClient } from '../http-axios/user-http.client';

@Injectable()
export class NoteFolderService {
  constructor(
    private readonly noteFolderRepository: NoteFolderRepository,
    private readonly noteService: NoteService,
    private readonly noteRepository: NoteRepository,
    private readonly shareRepository: ShareRepository,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  async getFolderById(folderId: string): Promise<NoteFolderTree | null> {
    const folder = await this.noteFolderRepository.getNoteFolderById(folderId);

    if (folder === null) {
      return folder;
    }

    const allSubfolders =
      await this.noteFolderRepository.getAllSubfolders(folderId);

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

    const allSubfolders =
      await this.noteFolderRepository.getAllSubfolders(folderId);
    const folderIds = [
      folderId,
      ...allSubfolders.map((folder) => folder._id.toString()),
    ];
    let fileIds = allSubfolders.flatMap((folder) => {
      const files = folder['files']?.map((file) => file._id.toString());
      return files;
    });
    const currentFileIdsInThisFolder = folder['files']?.map((file) =>
      file._id.toString(),
    );

    fileIds = [...currentFileIdsInThisFolder, ...fileIds];

    await this.noteService.deleteManyByIds(fileIds);
    await this.noteFolderRepository.deleteManyByIds(folderIds);
  }

  async retrieveAllFolderInRoot(
    user_id: string,
  ): Promise<NoteFolderTree[] | null> {
    const allFolders =
      await this.noteFolderRepository.getNoteFoldersByUserID(user_id);
    if (!allFolders || allFolders.length === 0) return null;
    const folderTrees: NoteFolderTree[] = [];
    for (const root of allFolders) {
      const allSubfolders = await this.noteFolderRepository.getAllSubfolders(
        root._id.toString(),
      );
      const tree = this.buildFolderTree([root, ...allSubfolders]);
      if (tree) {
        folderTrees.push(tree);
      }
    }
    return folderTrees;
  }

  async retrieveAllFolderInRootforWeb(user_id: string): Promise<RootItem[]> {
    const allFolders =
      await this.noteFolderRepository.getNoteFoldersByUserID(user_id);
    const allSubfolders: NoteFolder[] = [];
    if (allFolders && allFolders.length > 0) {
      for (const root of allFolders) {
        const subfolders = await this.noteFolderRepository.getAllSubfolders(
          root._id.toString(),
        );
        allSubfolders.push(...subfolders);
      }
    }
    const rootNotes = await this.noteRepository.getNoteInRootByUserID(user_id);
    const result: RootItem[] = [];
    const folderTrees = this.buildFolderTreesForWeb([
      ...allFolders,
      ...allSubfolders,
    ]);
    result.push(...folderTrees);

    if (rootNotes && rootNotes.length > 0) {
      const notesWithType: NoteWithType[] = rootNotes.map((note) => ({
        ...note,
        type: 'file' as const,
      }));
      result.push(...notesWithType);
    }

    await this.enrichItemsWithShareInfo(result);

    return result.length > 0 ? result : [];
  }

  private buildFolderTreesForWeb(flatList: NoteFolder[]): NoteFolderTree[] {
    const folderMap: Map<string, NoteFolderTree> = new Map();
    const roots: NoteFolderTree[] = [];

    flatList.forEach((folder) => {
      const folderTree: NoteFolderTree = {
        ...folder,
        subfolders: [],
        type: 'folder' as const,
      };
      folderMap.set(folder._id.toString(), folderTree);
      if (!folder.parent_folder_id) {
        roots.push(folderTree);
      }
    });
    flatList.forEach((folder) => {
      if (folder.parent_folder_id) {
        const parent = folderMap.get(folder.parent_folder_id.toString());
        if (parent) {
          parent.subfolders.push(folderMap.get(folder._id.toString())!);
        }
      }
    });
    return roots;
  }

  async enrichItemsWithShareInfo(items: RootItem[]): Promise<void> {
    // Tạo một map để lưu trữ thông tin người dùng đã lấy được
    const userInfoMap = new Map<string, any>();

    // Danh sách các userIds cần lấy thông tin
    const userIdsToFetch = new Set<string>();

    // Thu thập tất cả các userId từ các mục được chia sẻ
    for (const item of items) {
      const resourceType = item.type === 'folder' ? 'folder' : 'note';
      const shareInfo = await this.shareRepository.findShareByResourceId(
        resourceType,
        item._id.toString(),
      );

      if (shareInfo) {
        // Thêm owner_id vào danh sách cần lấy thông tin
        userIdsToFetch.add(shareInfo.owner_id.toString());

        // Thêm tất cả người được chia sẻ vào danh sách cần lấy thông tin
        for (const sharedUser of shareInfo.shared_with) {
          userIdsToFetch.add(sharedUser.user_id.toString());
        }
      }
    }

    // Lấy thông tin người dùng từ UserHttpClient nếu có userId cần lấy
    if (userIdsToFetch.size > 0) {
      const userIds = Array.from(userIdsToFetch);
      try {
        const usersInfo = await this.userHttpClient.getUsersByIds(userIds);

        // Lưu thông tin người dùng vào map để sử dụng sau
        for (const userInfo of usersInfo) {
          userInfoMap.set(userInfo.user_id.toString(), {
            id: userInfo.user_id,
            name: userInfo.full_name,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
          });
        }
      } catch (error) {
        console.error('Error fetching user information:', error.message);
      }
    }

    // Xử lý từng mục để thêm thông tin chia sẻ
    for (const item of items) {
      const resourceType = item.type === 'folder' ? 'folder' : 'note';
      const shareInfo = await this.shareRepository.findShareByResourceId(
        resourceType,
        item._id.toString(),
      );

      if (shareInfo) {
        // Thêm thông tin chia sẻ vào mục
        item.isShared = true;

        // Lấy thông tin owner từ map
        const ownerInfo = userInfoMap.get(shareInfo.owner_id.toString());
        if (ownerInfo) {
          item.owner_info = ownerInfo;
        }

        // Thêm thông tin người được chia sẻ với thông tin chi tiết từ userInfoMap
        item.sharedWith = shareInfo.shared_with.map((user) => {
          const userInfo = userInfoMap.get(user.user_id.toString());
          return {
            user_id: user.user_id.toString(),
            permission: user.permission,
            shared_at: user.shared_at,
            user_info: userInfo || null,
          };
        });
      }

      if (item.type === 'folder') {
        if (item.subfolders && item.subfolders.length > 0) {
          await this.enrichItemsWithShareInfo(item.subfolders);
        }

        if (item.files && item.files.length > 0) {
          for (const file of item.files) {
            const fileShareInfo =
              await this.shareRepository.findShareByResourceId(
                'note',
                file._id.toString(),
              );

            if (fileShareInfo) {
              file.isShared = true;

              // Lấy thông tin owner từ map
              const ownerInfo = userInfoMap.get(
                fileShareInfo.owner_id.toString(),
              );
              if (ownerInfo) {
                file.owner_info = ownerInfo;
              }

              // Thêm thông tin người được chia sẻ với thông tin chi tiết từ userInfoMap
              file.sharedWith = fileShareInfo.shared_with.map((user) => {
                const userInfo = userInfoMap.get(user.user_id.toString());
                return {
                  user_id: user.user_id.toString(),
                  permission: user.permission,
                  shared_at: user.shared_at,
                  user_info: userInfo || null,
                };
              });
            }
          }
        }
      }
    }
  }

  async getShareInfoForFolder(folderId: string) {
    return await this.shareRepository.findShareByResourceId('folder', folderId);
  }
}
