import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteFolder, NoteFolderSchema } from '../note-folder.schema';
import { Note, NoteSchema } from '../../notes/note.schema';
import { WorkspaceFolderController } from './workspace-folder.controller';
import { WorkspaceFolderService } from './workspace-folder.service';
import { WorkspaceFolderRepository } from './workspace-folder.repository';
import { WorkspaceModule } from '../../workspace/workspace.module';
import { NoteModule } from '../../notes/note.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NoteFolder.name, schema: NoteFolderSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => NoteModule),
  ],
  controllers: [WorkspaceFolderController],
  providers: [WorkspaceFolderService, WorkspaceFolderRepository],
  exports: [WorkspaceFolderService, WorkspaceFolderRepository],
})
export class WorkspaceFolderModule {}
