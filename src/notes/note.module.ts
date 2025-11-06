import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './note.schema';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { NoteGateway } from './note.gateway';
import { ShareRepository } from '../shares/share.repository';
import { Share, ShareSchema } from '../shares/share.schema';
import { NoteFolderRepository } from '../note-folders/note-folder.repository';
import {
  NoteFolder,
  NoteFolderSchema,
} from '../note-folders/note-folder.schema';
import { WorkspaceNoteModule } from './workpsace/workspace-note.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Share.name, schema: ShareSchema },
      { name: NoteFolder.name, schema: NoteFolderSchema },
    ]),
    WorkspaceNoteModule,
  ],
  controllers: [NoteController],
  providers: [
    NoteService,
    NoteRepository,
    NoteGateway,
    ShareRepository,
    NoteFolderRepository,
  ],
  exports: [NoteService, NoteRepository, NoteGateway],
})
export class NoteModule {}
