import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceFolderRepository } from './workspace-folder.repository';
import { WorkspacePermissionService } from '../../workspace/workspace-permission.service';
import { NoteGateway } from '../../notes/note.gateway';

@Injectable()
export class WorkspaceFolderService {
  private readonly logger = new Logger(WorkspaceFolderService.name);

  constructor(
    private readonly workspaceFolderRepository: WorkspaceFolderRepository,
    private readonly workspacePermissionService: WorkspacePermissionService,
    @Inject(forwardRef(() => NoteGateway))
    private readonly noteGateway: NoteGateway,
  ) {}

  /**
   * Validate folder name with Windows-like rules
   */
  private validateFolderName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Folder name is required');
    }

    const trimmedName = name.trim();

    // Check length limit (30 characters)
    if (trimmedName.length > 30) {
      throw new BadRequestException(
        'Folder name must be 30 characters or less',
      );
    }

    // Windows-like forbidden characters: < > : " | ? * \ /
    const forbiddenChars = /[<>:"|?*\\/]/;
    if (forbiddenChars.test(trimmedName)) {
      throw new BadRequestException(
        'Folder name cannot contain the following characters: < > : " | ? * \\ /',
      );
    }

    // Cannot start or end with space or dot
    if (
      trimmedName.startsWith('.') ||
      trimmedName.endsWith('.') ||
      trimmedName.startsWith(' ') ||
      trimmedName.endsWith(' ')
    ) {
      throw new BadRequestException(
        'Folder name cannot start or end with a space or dot',
      );
    }

    // Windows reserved names
    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ];
    if (reservedNames.includes(trimmedName.toUpperCase())) {
      throw new BadRequestException(
        `Folder name cannot be a reserved Windows name: ${trimmedName}`,
      );
    }
  }

  /**
   * Check if folder name already exists in the same parent folder
   */
  private async checkFolderNameConflict(
    workspaceId: string,
    name: string,
    parentFolderId?: string,
    excludeId?: string,
  ): Promise<void> {
    const existingFolder =
      await this.workspaceFolderRepository.findByNameInParent(
        workspaceId,
        name.trim(),
        parentFolderId || null,
      );

    if (existingFolder && existingFolder._id.toString() !== excludeId) {
      throw new BadRequestException(
        `A folder with the name "${name.trim()}" already exists in this location`,
      );
    }
  }

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
      this.validateFolderName(createData.name);

      // Check for name conflicts in the same parent folder
      await this.checkFolderNameConflict(
        workspaceId,
        createData.name,
        createData.parent_folder_id,
      );

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

      // Emit WebSocket event to notify other users in workspace
      this.noteGateway.emitWorkspaceFolderCreated(workspaceId, {
        folderId: newFolder._id.toString(),
        name: newFolder.name,
        createdBy: userId,
        parentFolderId: createData.parent_folder_id,
      });

      // Also emit workspace structure changed event
      this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
        changedBy: userId,
        eventType: 'folder_created',
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

      // Validate folder name if being updated
      if (updateData.name) {
        this.validateFolderName(updateData.name);

        // Get current folder to check parent_folder_id for conflict checking
        const currentFolder =
          await this.workspaceFolderRepository.findById(folderId);
        if (!currentFolder) {
          throw new BadRequestException('Folder not found');
        }

        // Check for name conflicts in the same parent folder (exclude current folder)
        await this.checkFolderNameConflict(
          workspaceId,
          updateData.name,
          currentFolder.parent_folder_id?.toString(),
          folderId,
        );
      }

      // Update folder
      const updatedFolder = await this.workspaceFolderRepository.updateFolder(
        folderId,
        {
          name: updateData.name ? updateData.name.trim() : undefined,
        },
      );

      // Emit WebSocket event if name was changed (rename)
      if (updateData.name) {
        this.noteGateway.emitWorkspaceFolderRenamed(workspaceId, {
          folderId: folderId,
          newName: updateData.name.trim(),
          renamedBy: userId,
        });

        // Also emit workspace structure changed event for rename
        this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
          changedBy: userId,
          eventType: 'folder_renamed',
        });
      }

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

      // Emit WebSocket event to notify other users in workspace
      this.noteGateway.emitWorkspaceFolderDeleted(workspaceId, {
        folderId: folderId,
        deletedBy: userId,
      });

      // Also emit workspace structure changed event
      this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
        changedBy: userId,
        eventType: 'folder_deleted',
        excludeChanger: true,
      });

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
