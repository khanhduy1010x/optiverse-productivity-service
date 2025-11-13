import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceNoteRepository } from './workspace-note.repository';
import { WorkspacePermissionService } from '../../workspace/workspace-permission.service';
import { NoteGateway } from '../note.gateway';

@Injectable()
export class WorkspaceNoteService {
  private readonly logger = new Logger(WorkspaceNoteService.name);

  constructor(
    private readonly workspaceNoteRepository: WorkspaceNoteRepository,
    private readonly workspacePermissionService: WorkspacePermissionService,
    @Inject(forwardRef(() => NoteGateway))
    private readonly noteGateway: NoteGateway,
  ) {}

  /**
   * Validate note/folder name with Windows-like rules
   */
  private validateName(name: string, type: 'note' | 'folder'): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException(
        `${type === 'note' ? 'Note' : 'Folder'} name is required`,
      );
    }

    const trimmedName = name.trim();

    // Check length limit (30 characters)
    if (trimmedName.length > 30) {
      throw new BadRequestException(
        `${type === 'note' ? 'Note' : 'Folder'} name must be 30 characters or less`,
      );
    }

    // Windows-like forbidden characters: < > : " | ? * \ /
    const forbiddenChars = /[<>:"|?*\\/]/;
    if (forbiddenChars.test(trimmedName)) {
      throw new BadRequestException(
        `${type === 'note' ? 'Note' : 'Folder'} name cannot contain the following characters: < > : " | ? * \\ /`,
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
        `${type === 'note' ? 'Note' : 'Folder'} name cannot start or end with a space or dot`,
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
        `${type === 'note' ? 'Note' : 'Folder'} name cannot be a reserved Windows name: ${trimmedName}`,
      );
    }
  }

  /**
   * Check if name already exists in the same folder (check both notes and folders)
   */
  private async checkNameConflict(
    workspaceId: string,
    name: string,
    folderId?: string,
    excludeId?: string,
  ): Promise<void> {
    // Check if a note with this name exists
    const existingNote = await this.workspaceNoteRepository.findByNameInFolder(
      workspaceId,
      name.trim(),
      folderId || null,
    );

    if (existingNote && existingNote._id.toString() !== excludeId) {
      throw new BadRequestException(
        `A note with the name "${name.trim()}" already exists in this location`,
      );
    }

    // Also check if a folder with this name exists (need to import WorkspaceFolderRepository)
    // For now, we'll just check notes. To check folders too, we'd need to inject WorkspaceFolderRepository
  }

  /**
   * Create new note in workspace
   * NOTE_ADMIN: Can create notes
   * NOTE_USER: Cannot create notes
   */
  async createNote(
    workspaceId: string,
    userId: string,
    createData: { title: string; content?: string; folder_id?: string },
  ) {
    try {
      // Check permission - must be NOTE_ADMIN
      const canCreateNote = await this.workspacePermissionService.hasPermission(
        workspaceId,
        userId,
        'NOTE_ADMIN',
      );

      if (!canCreateNote) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can create notes. You have NOTE_USER permission.',
        );
      }

      // Validate note name
      this.validateName(createData.title, 'note');

      // Check for name conflicts in the same folder
      await this.checkNameConflict(
        workspaceId,
        createData.title,
        createData.folder_id,
      );

      // Create note
      const newNote = await this.workspaceNoteRepository.createNote({
        workspace_id: workspaceId,
        user_id: userId,
        title: createData.title.trim(),
        content: createData.content || '',
        folder_id: createData.folder_id || undefined,
        create_by: userId,
      });

      // Emit WebSocket event to notify other users in workspace
      console.log(
        '🔥 About to emit note_created event for workspace:',
        workspaceId,
      );
      this.noteGateway.emitWorkspaceNoteCreated(workspaceId, {
        noteId: newNote._id.toString(),
        title: newNote.title,
        createdBy: userId,
        folderId: createData.folder_id,
      });
      console.log('✅ note_created event emitted for workspace:', workspaceId);

      // Also emit workspace structure changed event
      this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
        changedBy: userId,
        eventType: 'note_created',
      });
      console.log(
        '✅ folder_structure_changed event emitted for workspace:',
        workspaceId,
      );

      return newNote;
    } catch (error) {
      this.logger.error(`Error creating note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all notes in workspace
   * NOTE_USER: Can only view
   * NOTE_ADMIN: Can view all
   */
  async getWorkspaceNotes(workspaceId: string, userId: string) {
    try {
      // Check user permission in workspace
      const permissions =
        await this.workspacePermissionService.getUserPermissions(
          workspaceId,
          userId,
        );

      if (!permissions) {
        throw new ForbiddenException(
          'You do not have access to this workspace',
        );
      }

      // Get notes
      const [notes, total] = await Promise.all([
        this.workspaceNoteRepository.findByWorkspaceId(workspaceId),
        this.workspaceNoteRepository.countByWorkspaceId(workspaceId),
      ]);

      return {
        data: notes,
        total,
      };
    } catch (error) {
      this.logger.error(`Error getting workspace notes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update note - Only NOTE_ADMIN allowed
   */
  async updateNote(
    workspaceId: string,
    noteId: string,
    userId: string,
    updateData: { title?: string; content?: string },
  ) {
    try {
      // Check permission - must be NOTE_ADMIN
      const canUpdateNote = await this.workspacePermissionService.hasPermission(
        workspaceId,
        userId,
        'NOTE_ADMIN',
      );

      if (!canUpdateNote) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can update notes. You have NOTE_USER permission.',
        );
      }

      // Verify note belongs to workspace
      const isNoteInWorkspace =
        await this.workspaceNoteRepository.isNoteInWorkspace(
          noteId,
          workspaceId,
        );

      if (!isNoteInWorkspace) {
        throw new BadRequestException('Note not found in this workspace');
      }

      // Validate title if being updated
      if (updateData.title) {
        this.validateName(updateData.title, 'note');

        // Get current note to check folder_id for conflict checking
        const currentNote = await this.workspaceNoteRepository.findById(noteId);
        if (!currentNote) {
          throw new BadRequestException('Note not found');
        }

        // Check for name conflicts in the same folder (exclude current note)
        await this.checkNameConflict(
          workspaceId,
          updateData.title,
          currentNote.folder_id?.toString(),
          noteId,
        );
      }

      // Update note
      const updatedNote = await this.workspaceNoteRepository.updateNote(
        noteId,
        {
          title: updateData.title,
          content: updateData.content,
        },
      );

      // Emit WebSocket event if title was changed (rename)
      if (updateData.title) {
        this.noteGateway.emitWorkspaceNoteRenamed(workspaceId, {
          noteId: noteId,
          newTitle: updateData.title,
          renamedBy: userId,
        });

        // Also emit workspace structure changed event for rename
        this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
          changedBy: userId,
          eventType: 'note_renamed',
        });
      }

      return updatedNote;
    } catch (error) {
      this.logger.error(`Error updating note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete note - Only NOTE_ADMIN allowed
   */
  async deleteNote(workspaceId: string, noteId: string, userId: string) {
    try {
      this.logger.log(
        `Attempting to delete note ${noteId} in workspace ${workspaceId} by user ${userId}`,
      );

      // Check permission - must be NOTE_ADMIN
      const canDeleteNote = await this.workspacePermissionService.hasPermission(
        workspaceId,
        userId,
        'NOTE_ADMIN',
      );

      if (!canDeleteNote) {
        throw new ForbiddenException(
          'Only NOTE_ADMIN can delete notes. You have NOTE_USER permission.',
        );
      }

      // Get note first to check if it exists and belongs to workspace
      const note = await this.workspaceNoteRepository.findById(noteId);

      if (!note) {
        this.logger.warn(`Note ${noteId} not found when attempting to delete`);
        throw new BadRequestException('Note not found');
      }

      // Check if note belongs to workspace
      if (!note.workspace_id || note.workspace_id.toString() !== workspaceId) {
        this.logger.warn(
          `Note ${noteId} does not belong to workspace ${workspaceId}. Note workspace_id: ${note.workspace_id}`,
        );
        throw new BadRequestException('Note not found in this workspace');
      }

      this.logger.log(
        `Note ${noteId} found and belongs to workspace ${workspaceId}, proceeding with deletion`,
      );

      // Delete note
      const deletedNote = await this.workspaceNoteRepository.deleteNote(noteId);

      if (!deletedNote) {
        this.logger.warn(
          `Note ${noteId} was not deleted (possibly already deleted)`,
        );
        throw new BadRequestException('Note could not be deleted');
      }

      this.logger.log(`Note ${noteId} successfully deleted`);

      // Emit WebSocket event to notify other users in workspace
      this.noteGateway.emitWorkspaceNoteDeleted(workspaceId, {
        noteId: noteId,
        deletedBy: userId,
      });

      // Also emit workspace structure changed event
      this.noteGateway.emitWorkspaceFolderStructureChanged(workspaceId, {
        changedBy: userId,
        eventType: 'note_deleted',
        excludeChanger: true,
      });

      return {
        message: 'Note deleted successfully',
        deletedNote,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting note ${noteId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get note detail with content
   * All workspace members can view
   * NOTE_ADMIN: Can edit
   * NOTE_USER: Can only view
   */
  async getNoteDetail(workspaceId: string, noteId: string, userId: string) {
    try {
      // Verify note belongs to workspace
      const isNoteInWorkspace =
        await this.workspaceNoteRepository.isNoteInWorkspace(
          noteId,
          workspaceId,
        );

      if (!isNoteInWorkspace) {
        throw new BadRequestException('Note not found in this workspace');
      }

      // Get note
      const note = await this.workspaceNoteRepository.findById(noteId);
      if (!note) {
        throw new BadRequestException('Note not found');
      }

      // Check if user has NOTE_ADMIN permission (can edit)
      const isNoteAdmin = await this.workspacePermissionService.hasPermission(
        workspaceId,
        userId,
        'NOTE_ADMIN',
      );

      // Return note with permission info
      return {
        ...JSON.parse(JSON.stringify(note)),
        permission: isNoteAdmin ? 'edit' : 'view',
      };
    } catch (error) {
      this.logger.error(`Error getting note detail: ${error.message}`);
      throw error;
    }
  }
}
