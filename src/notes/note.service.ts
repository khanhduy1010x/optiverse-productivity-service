import { Injectable } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { Note } from './note.schema';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { NoteResponse } from './dto/response/NoteResponse.dto';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async getNotesByUserId(userId: string): Promise<Note[]> {
    return await this.noteRepository.getNotesByUserID(userId);
  }

  async getNotesByFolderID(folderId: string): Promise<Note[]> {
    return await this.noteRepository.getNotesByFolderID(folderId);
  }

  async createNote(createNoteDto: CreateNoteRequest, userId: string): Promise<NoteResponse> {
    const note = await this.noteRepository.createNote(createNoteDto, userId);
    return new NoteResponse(note);
  }

  async updateNote(noteId: string, updateNoteDto: UpdateNoteRequest): Promise<NoteResponse> {
    const note = await this.noteRepository.updateNote(noteId, updateNoteDto);
    return new NoteResponse(note);
  }

  async deleteNote(noteId: string): Promise<void> {
    return await this.noteRepository.deleteNote(noteId);
  }

  async deleteManyByIds(ids: string[]): Promise<void> {
    return await this.noteRepository.deleteManyByIds(ids);
  }
}
