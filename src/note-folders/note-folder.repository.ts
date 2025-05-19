import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { NoteFolder, NoteFolderTree } from './note-folder.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateNoteFolderRequest } from './dto/request/CreateNoteFolderRequest.dto';
import { UpdateNoteFolderRequest } from './dto/request/UpdateNoteFolderRequest.dto';

@Injectable()
export class NoteFolderRepository {
  
}
