import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteFolder, NoteFolderSchema } from './note-folder.schema';
import { NoteFolderController } from './note-folder.controller';
import { NoteFolderService } from './note-folder.service';
import { NoteFolderRepository } from './note-folder.repository';
import { NoteService } from '../notes/note.service';
import { NoteModule } from '../notes/note.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NoteFolder.name, schema: NoteFolderSchema }]),
    NoteModule,
  ],
  controllers: [NoteFolderController],
  providers: [NoteFolderService, NoteFolderRepository],
  exports: [NoteFolderService],
})
export class NoteFolderModule {}
