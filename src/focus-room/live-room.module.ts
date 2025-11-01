import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveRoomController } from './live-room.controller';
import { LiveRoomService } from './live-room.service';
import { LiveRoomRepository } from './live-room.repository';
import { LiveRoomJoinRequestService } from './live-room-join-request.service';
import { LiveRoom, LiveRoomSchema } from './schemas/live-room.schema';
import {
  LiveRoomMember,
  LiveRoomMemberSchema,
} from './schemas/live-room-member.schema';
import {
  LiveRoomJoinRequest,
  LiveRoomJoinRequestSchema,
} from './schemas/live-room-join-request.schema';
import {
  LiveRoomRecord,
  LiveRoomRecordSchema,
} from './schemas/live-room-record.schema';
import { ConfigModule } from '@nestjs/config';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { UserHttpClient } from '../http-axios/user-http.client';
import { LivekitTokenService } from './livekit-token.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';

@Module({
  imports: [
    ConfigModule,
    WorkspaceModule,
    AxiosClientModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: LiveRoom.name, schema: LiveRoomSchema },
      { name: LiveRoomMember.name, schema: LiveRoomMemberSchema },
      { name: LiveRoomJoinRequest.name, schema: LiveRoomJoinRequestSchema },
      { name: LiveRoomRecord.name, schema: LiveRoomRecordSchema },
      { name: 'Workspace', schema: null },
    ]),
  ],
  controllers: [LiveRoomController],
  providers: [
    LiveRoomService,
    LiveRoomRepository,
    LiveRoomJoinRequestService,
    UserHttpClient,
    LivekitTokenService,
    RecordingService,
  ],
  exports: [
    LiveRoomService,
    LiveRoomRepository,
    LiveRoomJoinRequestService,
    RecordingService,
  ],
})
export class LiveRoomModule {}
