import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './note.schema';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }])],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository],
  exports: [NoteService],
})
export class NoteModule {}
