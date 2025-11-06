import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteFolder, NoteFolderSchema } from '../note-folder.schema';
import { Note, NoteSchema } from '../../notes/note.schema';
import { WorkspaceFolderController } from './workspace-folder.controller';
import { WorkspaceFolderService } from './workspace-folder.service';
import { WorkspaceFolderRepository } from './workspace-folder.repository';
import { WorkspaceModule } from '../../workspace/workspace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NoteFolder.name, schema: NoteFolderSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
    WorkspaceModule,
  ],
  controllers: [WorkspaceFolderController],
  providers: [WorkspaceFolderService, WorkspaceFolderRepository],
  exports: [WorkspaceFolderService, WorkspaceFolderRepository],
})
export class WorkspaceFolderModule {}
