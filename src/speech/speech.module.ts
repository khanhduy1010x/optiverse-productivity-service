import { Module } from '@nestjs/common';
import { SpeechGateway } from './speech.gateway';
import { SpeechService } from './speech.service';
import { SpeechRepository } from './speech.repository';
import { SpeechController } from './speech.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { UserHttpClient } from '../http-axios/user-http.client';
import {
  SpeechMessage,
  SpeechMessageSchema,
} from '../focus-room/schemas/live-room-speech-message.schema';
import { NoteModule } from '../notes/note.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpeechMessage.name, schema: SpeechMessageSchema },
    ]),
    AxiosClientModule,
    NoteModule,
  ],
  controllers: [SpeechController],
  providers: [SpeechGateway, SpeechService, SpeechRepository, UserHttpClient],
  exports: [SpeechService, SpeechGateway],
})
export class SpeechModule {}
