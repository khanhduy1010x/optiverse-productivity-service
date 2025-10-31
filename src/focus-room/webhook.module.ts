import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { RecordingController } from './recording.controller';
import { SpeechModule } from 'src/speech/speech.module';
import { LiveRoomModule } from './live-room.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LiveRoomMember,
  LiveRoomMemberSchema,
} from './schemas/live-room-member.schema';
import {
  LiveRoomRecord,
  LiveRoomRecordSchema,
} from './schemas/live-room-record.schema';

@Module({
  imports: [
    LiveRoomModule,
    WorkspaceModule,
    SpeechModule,
    MongooseModule.forFeature([
      { name: LiveRoomMember.name, schema: LiveRoomMemberSchema },
      { name: LiveRoomRecord.name, schema: LiveRoomRecordSchema },
    ]),
  ],
  controllers: [RecordingController],
})
export class WebhookModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(bodyParser.raw({ type: 'application/webhook+json' }))
      .forRoutes('focus-room/public/webhook/livekit');
  }
}
