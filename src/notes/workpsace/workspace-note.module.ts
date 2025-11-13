import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from '../note.schema';
import { WorkspaceNoteController } from './workspace-note.controller';
import { WorkspaceNoteService } from './workspace-note.service';
import { WorkspaceNoteRepository } from './workspace-note.repository';
import { WorkspaceModule } from '../../workspace/workspace.module';
import { NoteModule } from '../note.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => NoteModule),
  ],
  controllers: [WorkspaceNoteController],
  providers: [WorkspaceNoteService, WorkspaceNoteRepository],
  exports: [WorkspaceNoteService, WorkspaceNoteRepository],
})
export class WorkspaceNoteModule {}
