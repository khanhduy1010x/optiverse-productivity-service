import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteFolder, NoteFolderSchema } from './note-folder.schema';
import { NoteFolderController } from './note-folder.controller';
import { NoteFolderService } from './note-folder.service';
import { NoteFolderRepository } from './note-folder.repository';
import { NoteModule } from '../notes/note.module';
import { ShareRepository } from '../shares/share.repository';
import { Share, ShareSchema } from '../shares/share.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NoteFolder.name, schema: NoteFolderSchema },
      { name: Share.name, schema: ShareSchema },
    ]),
    NoteModule,
  ],
  controllers: [NoteFolderController],
  providers: [NoteFolderService, NoteFolderRepository, ShareRepository],
  exports: [NoteFolderService, NoteFolderRepository],
})
export class NoteFolderModule {}
