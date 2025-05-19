import { Injectable } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { Note } from './note.schema';
import { CreateNoteRequest } from './dto/request/CreateNoteRequest.dto';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { NoteResponse } from './dto/response/NoteResponse.dto';

@Injectable()
export class NoteService {
  
}
