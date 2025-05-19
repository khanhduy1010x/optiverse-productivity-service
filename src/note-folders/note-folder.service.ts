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
  
}
