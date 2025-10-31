import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
  Patch,
} from '@nestjs/common';
import { RecordingService } from './recording.service';
import { ApiResponse } from 'src/common/api-response';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { LiveRoomService } from './live-room.service';
import { WorkspacePermissionService } from '../workspace/workspace-permission.service';
import { UserDto } from 'src/user-dto/user.dto';
import { WebhookReceiver } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LiveRoomMember,
  LiveRoomMemberDocument,
  MemberRole,
  MemberStatus,
} from './schemas/live-room-member.schema';
import {
  LiveRoomRecord,
  LiveRoomRecordDocument,
  RecordingStatus,
} from './schemas/live-room-record.schema';
import { SpeechGateway } from '../speech/speech.gateway';

@Controller('focus-room')
export class RecordingController {
  private webhookReceiver: WebhookReceiver;

  constructor(
    private readonly recordingService: RecordingService,
    private readonly liveRoomService: LiveRoomService,
    private readonly workspacePermissionService: WorkspacePermissionService,
    private readonly configService: ConfigService,
    @InjectModel(LiveRoomMember.name)
    private readonly memberModel: Model<LiveRoomMemberDocument>,
    @InjectModel(LiveRoomRecord.name)
    private readonly liveRoomRecordModel: Model<LiveRoomRecordDocument>,
    // inject SpeechGateway to emit socket events when recording starts/stops
    private readonly speechGateway: SpeechGateway,
  ) {
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
  }

  @Post(':roomId/recording/start')
  @HttpCode(HttpStatus.OK)
  async startRecording(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<{ egressId: string; message: string }>> {
    try {
      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      // Check permission: ROOM_ADMIN or room host
      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      const result = await this.recordingService.startRecording(
        room._id ? room._id.toString() : '',
        user.userId,
      );

      // Emit to speech namespace so front-end clients can show recording UI/timer
      try {
        if (this.speechGateway && this.speechGateway.server) {
          this.speechGateway.server
            .to(`speech-room-${roomId}`)
            .emit('recordingStarted', {
              roomId,
              startedBy: user.userId,
              startedAt: new Date(),
              egressId: result?.egressId,
            });
        }
      } catch (err) {
        console.warn(
          'Failed to emit recordingStarted event:',
          err?.message || err,
        );
      }

      return new ApiResponse({
        egressId: result.egressId,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post(':roomId/recording/stop')
  @HttpCode(HttpStatus.OK)
  async stopRecording(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      // Check permission: ROOM_ADMIN or room host
      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      const result = await this.recordingService.stopRecording(
        room._id ? room._id.toString() : '',
      );

      // Emit recording stopped event
      try {
        if (this.speechGateway && this.speechGateway.server) {
          this.speechGateway.server
            .to(`speech-room-${roomId}`)
            .emit('recordingStopped', {
              roomId,
              stoppedAt: new Date(),
            });
        }
      } catch (err) {
        console.warn(
          'Failed to emit recordingStopped event:',
          err?.message || err,
        );
      }

      return new ApiResponse(result);
    } catch (error) {
      console.log('❌ Error stopping recording:', error);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Get(':roomId/recording/status')
  @HttpCode(HttpStatus.OK)
  async getRecordingStatus(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      // Check if user can manage room
      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      const recordings = await this.recordingService.listRecordingStatus(
        room.room_sid as string,
      );

      return new ApiResponse(recordings);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Get(':roomId/records')
  @HttpCode(HttpStatus.OK)
  async getAllRecordsByRoom(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      // Check if user can manage room
      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      const records = await this.liveRoomRecordModel
        .find({ room_id: room._id, status: RecordingStatus.ENDED })
        .select(
          '_id title started_at ended_at egress_id gcp_url isSummarized summarizedContent',
        )
        .sort({ started_at: -1 })
        .lean();

      const formatDuration = (ms: number | null) => {
        if (ms == null || Number.isNaN(ms)) return null;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600)
          .toString()
          .padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60)
          .toString()
          .padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60)
          .toString()
          .padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      const payload = (records || []).map((r: any) => {
        const started = r.started_at ? new Date(r.started_at) : null;
        const ended = r.ended_at ? new Date(r.ended_at) : null;
        const durationMs =
          started && ended ? ended.getTime() - started.getTime() : null;
        return {
          _id: r._id,
          title: r.title,
          egress_id: r.egress_id,
          gcp_url: r.gcp_url,
          started_at: started,
          ended_at: ended,
          durationMs,
          duration: durationMs != null ? formatDuration(durationMs) : null,
          isSummarized: r.isSummarized || false,
          summarizedContent: r.summarizedContent || null,
        };
      });

      return new ApiResponse(payload);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Get('/public/records/:recordId/signed-url')
  @HttpCode(HttpStatus.OK)
  async getSignedUrlForRecord(
    @Param('recordId') recordId: string,
    @Query('mode') mode: 'stream' | 'download' = 'stream',
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      if (!recordId) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // normalize mode
      const normalizedMode = mode === 'download' ? 'download' : 'stream';

      const url = await this.recordingService.getSignedUrlForRecord(
        recordId,
        normalizedMode,
      );
      return new ApiResponse({ url });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Patch(':recordId/title')
  @HttpCode(HttpStatus.OK)
  async updateRecordingTitle(
    @Request() req,
    @Param('recordId') recordId: string,
    @Body() body: { title: string },
  ): Promise<ApiResponse<{ message: string; title: string }>> {
    try {
      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      // Get record to validate it exists and get room_id
      const record = await this.liveRoomRecordModel.findById(recordId).lean();
      if (!record) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // Check if user has permission to access this room's recordings
      const room = await this.liveRoomService.getRoomById(
        record.room_id.toString(),
      );
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      // Validate title
      const title = body.title?.trim();
      if (!title) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // Update title using service method
      const updatedRecord = await this.recordingService.updateRecordingTitle(
        recordId,
        title,
      );

      return new ApiResponse({
        message: 'Recording title updated successfully',
        title: updatedRecord.title,
      });
    } catch (error) {
      console.error('❌ Error updating recording title:', error);
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post(':recordId/summarize')
  @HttpCode(HttpStatus.OK)
  async summarizeRecording(
    @Request() req,
    @Param('recordId') recordId: string,
    @Body() body: { type?: number; meetingPurpose?: string },
  ): Promise<ApiResponse<{ summary: string }>> {
    try {
      if (!recordId) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // Get record to validate it exists and get room_id
      const record = await this.liveRoomRecordModel.findById(recordId).lean();
      if (!record) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // // Check if already summarized
      if (record.isSummarized && record.summarizedContent) {
        return new ApiResponse({ summary: record.summarizedContent });
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      // Check if user has permission to access this room's recordings
      const room = await this.liveRoomService.getRoomById(
        record.room_id.toString(),
      );
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      const canManage = room.workspace_id
        ? await this.workspacePermissionService.canManageRoom(
            room.workspace_id.toString(),
            user.userId,
          )
        : false;

      const isHost = room.host_id.toString() === user.userId;

      if (!canManage && !isHost) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
      }

      // Validate and default type
      const summaryType =
        body.type && [1, 2, 3, 4].includes(body.type) ? body.type : 1;
      const meetingPurpose = body.meetingPurpose?.trim() || '';

      // Mark as summarized before calling AI
      await this.liveRoomRecordModel.findByIdAndUpdate(recordId, {
        $set: { isSummarized: true, updatedAt: new Date() },
      });

      // Call summarize service with type and meeting purpose
      const summary = await this.recordingService.summarizeRecording(
        recordId,
        summaryType,
        meetingPurpose,
      );

      // Save summarized content to record
      await this.liveRoomRecordModel.findByIdAndUpdate(recordId, {
        $set: { summarizedContent: summary, updatedAt: new Date() },
      });

      return new ApiResponse({ summary });
    } catch (error) {
      console.error('❌ Summarize error:', error);
      // Reset isSummarized flag on error
      try {
        await this.liveRoomRecordModel.findByIdAndUpdate(recordId, {
          $set: { isSummarized: false, updatedAt: new Date() },
        });
      } catch (resetError) {
        console.error('❌ Failed to reset isSummarized flag:', resetError);
      }

      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post('public/webhook/livekit')
  @HttpCode(HttpStatus.OK)
  async handleLiveKitWebhook(@Req() req: RawBodyRequest<Request>) {
    try {
      const signature = req.headers['authorization'] as string;
      const rawBody = req.body?.toString();
      if (!rawBody) {
        console.error('❌ Missing raw body');
        return { success: false, message: 'Missing raw body buffer' };
      }

      const event = await this.webhookReceiver.receive(rawBody, signature);
      console.log('✅ Verified webhook:', JSON.stringify(event, null, 2));
      console.log('--------------------------------');
      console.log(event.egressInfo);
      // Process membership updates for participant events
      const evtType = (event as any)?.event as string;
      const roomName = (event as any)?.egressInfo?.roomName as
        | string
        | undefined; // our DB room _id string
      const identity = (event as any)?.participant?.identity as
        | string
        | undefined; // our user_id string
      console.log(roomName, evtType);
      if (evtType) {
        const roomObjectId = new Types.ObjectId(event?.room?.name);
        const userObjectId = new Types.ObjectId(event?.participant?.identity);

        if (evtType === 'participant_joined') {
          // Upsert member as JOINED
          await this.memberModel.findOneAndUpdate(
            { room_id: roomObjectId, user_id: userObjectId },
            {
              $setOnInsert: {
                role: MemberRole.MEMBER,
                createdAt: new Date(),
              },
              $set: {
                status: MemberStatus.JOINED,
                joined_at: new Date(),
                updatedAt: new Date(),
                room_id: roomObjectId,
                user_id: userObjectId,
              },
            },
            { upsert: true, new: true },
          );
          console.log(
            `✅ Processed member event ${evtType} for user ${identity} in room ${roomName}`,
          );
        }

        if (
          evtType === 'participant_left' ||
          evtType === 'participant_disconnected'
        ) {
          // Remove member record on leave as requested

          await this.memberModel.deleteOne({
            room_id: roomObjectId,
            user_id: userObjectId,
          });
        }
        console.log(
          `✅ Processed member event ${evtType} for user ${identity} in room ${roomName}`,
        );
      }

      // Handle egress ended events from LiveKit (egress_ended)
      try {
        if (evtType === 'egress_ended') {
          const egressInfo = (event as any)?.egressInfo || {};
          const egressId = egressInfo?.egressId || (event as any)?.id || '';

          const rawStarted =
            egressInfo?.file?.startedAt || egressInfo?.startedAt;
          const rawEnded = egressInfo?.file?.endedAt || egressInfo?.endedAt;

          const parseEgressTs = (v: any): Date | undefined => {
            if (!v) return undefined;
            const n = Number(v);
            if (Number.isNaN(n)) return undefined;
            let ms: number;
            // Heuristics: LiveKit sends nanoseconds or similar large ints; handle ns/us/ms/s
            if (n > 1e14) {
              // nanoseconds -> ms
              ms = Math.floor(n / 1e6);
            } else if (n > 1e12) {
              // microseconds -> ms
              ms = Math.floor(n / 1e3);
            } else if (n > 1e11) {
              // already ms
              ms = Math.floor(n);
            } else {
              // seconds -> ms
              ms = Math.floor(n * 1000);
            }
            return new Date(ms);
          };

          const startedAt = parseEgressTs(rawStarted);
          const endedAt = parseEgressTs(rawEnded);

          try {
            // 🔍 Check if record already exists by egress_id
            const existingRecord = await this.liveRoomRecordModel.findOne({
              egress_id: egressId,
            });

            if (existingRecord) {
              // 📝 Update existing record with webhook data
              console.log(
                `📝 Record exists for egress ${egressId}, updating with webhook data...`,
              );

              const fileOutputs = egressInfo?.roomComposite?.fileOutputs;
              const filepath =
                egressInfo?.roomComposite?.fileOutputs?.[0]?.filepath ??
                egressInfo?.fileResults?.[0]?.filename ??
                egressInfo?.file?.filename ??
                egressInfo?.file?.location ??
                existingRecord.gcp_url; // keep existing if not found

              await this.liveRoomRecordModel.findOneAndUpdate(
                { egress_id: egressId },
                {
                  $set: {
                    gcp_url: filepath,
                    started_at: startedAt || existingRecord.started_at,
                    ended_at: endedAt,
                    status: 'ENDED',
                    updatedAt: new Date(),
                  },
                },
                { new: true },
              );

              console.log(
                `✅ Updated LiveRoomRecord for egress ${egressId} with filepath: ${filepath}`,
              );
            } else {
              // ➕ Create new record if doesn't exist
              console.log(
                `➕ Record not found for egress ${egressId}, creating new...`,
              );

              const fileOutputs = egressInfo?.roomComposite?.fileOutputs;
              const filepath =
                egressInfo?.roomComposite?.fileOutputs?.[0]?.filepath ??
                egressInfo?.fileResults?.[0]?.filename ??
                egressInfo?.file?.filename ??
                egressInfo?.file?.location ??
                '';

              console.log('🎯 Extracted filepath =', filepath);
              console.log('🧩 fileOutputs[0] =', fileOutputs?.[0]);
              console.log('🧩 file.filename =', egressInfo?.file?.filename);

              if (!filepath) {
                console.warn(
                  '⚠️ egress_ended webhook: no filepath/filename found in egressInfo:',
                  JSON.stringify(egressInfo, null, 2),
                );
              }

              await this.liveRoomRecordModel.create({
                room_id: new Types.ObjectId(roomName),
                egress_id: egressId,
                gcp_url: filepath,
                status: 'ENDED',
                started_at: startedAt,
                ended_at: endedAt,
              });

              console.log(`💾 Created LiveRoomRecord for egress ${egressId}`);
            }
          } catch (err) {
            console.error('❌ Failed to handle egress_ended webhook:', err);
          }
        }
      } catch (err) {
        console.error('❌ Error processing egress_ended webhook:', err);
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Webhook verification failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}
