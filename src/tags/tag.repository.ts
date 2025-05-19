import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag } from './tag.schema';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { CreateTagRequest } from './dto/request/CreateTagRequest.dto';
import { UpdateTagRequest } from './dto/request/UpdateTagRequest.dto';

@Injectable()
export class TagRepository {
  
}
