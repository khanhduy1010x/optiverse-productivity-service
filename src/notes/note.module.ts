import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './note.schema';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { NoteGateway } from './note.gateway';
import { ShareRepository } from '../shares/share.repository';
import { Share, ShareSchema } from '../shares/share.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Share.name, schema: ShareSchema },
    ]),
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository, NoteGateway, ShareRepository],
  exports: [NoteService, NoteRepository, NoteGateway],
})
export class NoteModule {}
