import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Share, ShareSchema } from './share.schema';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { ShareRepository } from './share.repository';
import { NoteModule } from '../notes/note.module';
import { NoteFolderModule } from '../note-folders/note-folder.module';
import { AxiosClientModule } from 'src/http-axios/axios-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Share.name, schema: ShareSchema }]),
    NoteModule,
    NoteFolderModule,
    AxiosClientModule,
  ],
  controllers: [ShareController],
  providers: [ShareService, ShareRepository],
  exports: [ShareService, ShareRepository],
})
export class ShareModule {}
