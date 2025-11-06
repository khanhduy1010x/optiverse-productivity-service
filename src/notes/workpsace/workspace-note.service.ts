import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceNoteRepository } from './workspace-note.repository';
import { WorkspacePermissionService } from '../../workspace/workspace-permission.service';

@Injectable()
export class WorkspaceNoteService {
  private readonly logger = new Logger(WorkspaceNoteService.name);

  constructor(
    private readonly workspaceNoteRepository: WorkspaceNoteRepository,
    private readonly workspacePermissionService: WorkspacePermissionService,
  ) {}

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

      // Validate title
      if (!createData.title || createData.title.trim().length === 0) {
        throw new BadRequestException('Note title is required');
      }

      // Create note
      const newNote = await this.workspaceNoteRepository.createNote({
        workspace_id: workspaceId,
        user_id: userId,
        title: createData.title.trim(),
        content: createData.content || '',
        folder_id: createData.folder_id || undefined,
        create_by: userId,
      });

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

      // Update note
      const updatedNote = await this.workspaceNoteRepository.updateNote(
        noteId,
        {
          title: updateData.title,
          content: updateData.content,
        },
      );

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

      // Verify note belongs to workspace
      const isNoteInWorkspace =
        await this.workspaceNoteRepository.isNoteInWorkspace(
          noteId,
          workspaceId,
        );

      if (!isNoteInWorkspace) {
        throw new BadRequestException('Note not found in this workspace');
      }

      // Delete note
      const deletedNote = await this.workspaceNoteRepository.deleteNote(noteId);

      return {
        message: 'Note deleted successfully',
        deletedNote,
      };
    } catch (error) {
      this.logger.error(`Error deleting note: ${error.message}`);
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
