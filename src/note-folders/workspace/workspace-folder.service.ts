import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceFolderRepository } from './workspace-folder.repository';
import { WorkspacePermissionService } from '../../workspace/workspace-permission.service';

@Injectable()
export class WorkspaceFolderService {
  private readonly logger = new Logger(WorkspaceFolderService.name);

  constructor(
    private readonly workspaceFolderRepository: WorkspaceFolderRepository,
    private readonly workspacePermissionService: WorkspacePermissionService,
  ) {}

  /**
   * Get all folders in workspace
   * NOTE_USER: Can view
   * NOTE_ADMIN: Can view all
   */
  async getWorkspaceFolders(workspaceId: string, userId: string) {
    try {
      // Check user permission in workspace
      const permissions =
        await this.workspacePermissionService.getUserPermissions(
          workspaceId,
          userId,
        );

      if (
        !permissions &&
        !(await this.workspacePermissionService.isWorkspaceOwner(
          workspaceId,
          userId,
        ))
      ) {
        throw new ForbiddenException(
          'You do not have access to this workspace',
        );
      }

      // Get folders
      const [folders, total] = await Promise.all([
        this.workspaceFolderRepository.findByWorkspaceId(workspaceId),
        this.workspaceFolderRepository.countByWorkspaceId(workspaceId),
      ]);

      return {
        data: folders,
        total,
      };
    } catch (error) {
      this.logger.error(`Error getting workspace folders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new folder - Only NOTE_ADMIN allowed
   */
  async createFolder(
    workspaceId: string,
    userId: string,
    createData: { name: string; parent_folder_id?: string },
  ) {
    try {
      // Check permission - must be NOTE_ADMIN
      const canCreateFolder =
        await this.workspacePermissionService.hasPermission(
          workspaceId,
          userId,
          'NOTE_ADMIN',
        );

      if (!canCreateFolder) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can create folders. You have NOTE_USER permission.',
        );
      }

      // Validate folder name
      if (!createData.name || createData.name.trim().length === 0) {
        throw new BadRequestException('Folder name is required');
      }

      // If parent_folder_id provided, verify it exists and belongs to workspace
      if (createData.parent_folder_id) {
        const parentExists =
          await this.workspaceFolderRepository.isFolderInWorkspace(
            createData.parent_folder_id,
            workspaceId,
          );

        if (!parentExists) {
          throw new BadRequestException(
            'Parent folder not found in this workspace',
          );
        }
      }

      // Create folder
      const newFolder = await this.workspaceFolderRepository.createFolder({
        workspace_id: workspaceId,
        user_id: userId,
        name: createData.name.trim(),
        parent_folder_id: createData.parent_folder_id || undefined,
      });

      return newFolder;
    } catch (error) {
      this.logger.error(`Error creating folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update folder - Only NOTE_ADMIN allowed
   */
  async updateFolder(
    workspaceId: string,
    folderId: string,
    userId: string,
    updateData: { name?: string },
  ) {
    try {
      // Check permission - must be NOTE_ADMIN
      const canUpdateFolder =
        await this.workspacePermissionService.hasPermission(
          workspaceId,
          userId,
          'NOTE_ADMIN',
        );

      if (!canUpdateFolder) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can update folders. You have NOTE_USER permission.',
        );
      }

      // Verify folder belongs to workspace
      const isFolderInWorkspace =
        await this.workspaceFolderRepository.isFolderInWorkspace(
          folderId,
          workspaceId,
        );

      if (!isFolderInWorkspace) {
        throw new BadRequestException('Folder not found in this workspace');
      }

      // Update folder
      const updatedFolder = await this.workspaceFolderRepository.updateFolder(
        folderId,
        {
          name: updateData.name ? updateData.name.trim() : undefined,
        },
      );

      return updatedFolder;
    } catch (error) {
      this.logger.error(`Error updating folder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete folder and all its children - Only NOTE_ADMIN allowed
   * Deletes:
   * - The folder itself
   * - All child folders recursively
   * - All notes in the folder and child folders
   */
  async deleteFolder(workspaceId: string, folderId: string, userId: string) {
    try {
      // Check permission - must be NOTE_ADMIN
      const canDeleteFolder =
        await this.workspacePermissionService.hasPermission(
          workspaceId,
          userId,
          'NOTE_ADMIN',
        );

      if (!canDeleteFolder) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can delete folders. You have NOTE_USER permission.',
        );
      }

      // Verify folder belongs to workspace
      const isFolderInWorkspace =
        await this.workspaceFolderRepository.isFolderInWorkspace(
          folderId,
          workspaceId,
        );

      if (!isFolderInWorkspace) {
        throw new BadRequestException('Folder not found in this workspace');
      }

      // Delete folder and all children
      const deletedCount =
        await this.workspaceFolderRepository.deleteFolderAndChildren(folderId);

      return {
        message: `Folder and ${deletedCount} items deleted successfully`,
        deletedCount,
      };
    } catch (error) {
      this.logger.error(`Error deleting folder: ${error.message}`);
      throw error;
    }
  }
}
