import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiResponse } from 'src/common/api-response';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { LiveRoomService } from './live-room.service';
import { LivekitTokenService } from './livekit-token.service';
import { LiveRoomJoinRequestService } from './live-room-join-request.service';
import { CreateLiveRoomDto } from './dto/create-live-room.dto';
import { UpdateLiveRoomDto } from './dto/update-live-room.dto';
import { LiveRoom } from './schemas/live-room.schema';
import { LiveRoomMember } from './schemas/live-room-member.schema';
import { UserDto } from 'src/user-dto/user.dto';
import { WorkspacePermissionService } from '../workspace/workspace-permission.service';

@Controller('focus-room')
export class LiveRoomController {
  constructor(
    private readonly liveRoomService: LiveRoomService,
    private readonly livekitTokenService: LivekitTokenService,
    private readonly joinRequestService: LiveRoomJoinRequestService,
    private readonly workspacePermissionService: WorkspacePermissionService,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(LiveRoomMember.name)
    private readonly liveRoomMemberModel: Model<LiveRoomMember>,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Request() req,
    @Body() createRoomDto: CreateLiveRoomDto,
  ): Promise<ApiResponse<LiveRoom>> {
    const user = req.userInfo as UserDto;
    const room = await this.liveRoomService.createRoom(
      user.userId,
      createRoomDto,
    );
    return new ApiResponse<LiveRoom>(room);
  }

  @Get('permissions/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async getUserPermissions(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
  ): Promise<
    ApiResponse<{
      hasPermission: boolean;
      actions: string[];
      is_owner: boolean;
      message: string;
    }>
  > {
    const user = req.userInfo as UserDto;
    const permissions = await this.liveRoomService.getUserLiveRoomPermissions(
      user.userId,
      workspaceId,
    );
    return new ApiResponse(permissions);
  }

  @Get('workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async getRoomsByWorkspace(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      if (!workspaceId) {
        throw new AppException(ErrorCode.INVALID_OBJECT_ID);
      }

      const user = req.userInfo as UserDto;
      const rooms = await this.liveRoomService.getRoomsByWorkspace(
        workspaceId,
        user?.userId,
      );

      if (!rooms || rooms.length === 0) {
        return new ApiResponse<any[]>([]);
      }

      // Add isOwner field to each room
      const roomsWithOwnerStatus = rooms.map((room) => ({
        ...room,
        isOwner: room.host_id.toString() === user?.userId,
      }));

      return new ApiResponse<any[]>(roomsWithOwnerStatus);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Get('token')
  @HttpCode(HttpStatus.OK)
  async getJoinToken(
    @Request() req,
    @Query('roomId') roomId: string,
    @Query('password') password?: string,
    @Query('joinType') joinType?: 'password' | 'request',
  ): Promise<
    ApiResponse<{
      token?: string;
      requiresPassword?: boolean;
      message?: string;
    }>
  > {
    try {
      if (!roomId) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      if (room.access_type === 'public') {
        const isOwner = room.host_id.toString() === user.userId;
        const isAdmin = room.workspace_id
          ? await this.workspacePermissionService.isRoomAdmin(
              room.workspace_id.toString(),
              user.userId,
            )
          : false;

        const token = await this.livekitTokenService.generateJoinToken(
          (room._id as any).toString(),
          isAdmin,
          user,
          isOwner,
        );

        return new ApiResponse({
          token,
          message: 'Token sinh thành công',
        });
      }

      if (room && room.access_type === 'private') {
        // Only host can join their own room directly
        const isHost = room.host_id.toString() === user.userId;

        if (isHost) {
          const isAdmin = room.workspace_id
            ? await this.workspacePermissionService.isRoomAdmin(
                room.workspace_id.toString(),
                user.userId,
              )
            : false;

          const token = await this.livekitTokenService.generateJoinToken(
            (room._id as any).toString(),
            isAdmin,
            user,
            true, // isOwner = true for host
          );

          return new ApiResponse({
            token,
            message: 'Token sinh thành công',
          });
        }

        // Check if user is a member - members can join regardless of password
        const isMember = await this.liveRoomMemberModel.findOne({
          room_id: room._id,
          user_id: new Types.ObjectId(user.userId),
        });

        console.log('🔍 Check member:', {
          roomId: room._id,
          userId: user.userId,
          isMember: !!isMember,
        });

        if (isMember) {
          const isAdmin = room.workspace_id
            ? await this.workspacePermissionService.isRoomAdmin(
                room.workspace_id.toString(),
                user.userId,
              )
            : false;

          const token = await this.livekitTokenService.generateJoinToken(
            (room._id as any).toString(),
            isAdmin,
            user,
            false, // isOwner = false for member
          );

          return new ApiResponse({
            token,
            message: 'Token sinh thành công',
          });
        }

        // If not host/member and room has password
        if (room.password) {
          // If password provided, check it
          if (password && password === room.password) {
            const isAdmin = room.workspace_id
              ? await this.workspacePermissionService.isRoomAdmin(
                  room.workspace_id.toString(),
                  user.userId,
                )
              : false;

            const token = await this.livekitTokenService.generateJoinToken(
              (room._id as any).toString(),
              isAdmin,
              user,
              false, // isOwner = false for password user
            );

            return new ApiResponse({
              token,
              message: 'Token sinh thành công',
            });
          }

          if (password && password !== room.password) {
            throw new AppException(ErrorCode.ROOM_PASSWORD_INCORRECT);
          }

          // No password provided, create join request
          if (!password) {
            await this.joinRequestService.createJoinRequest(
              room._id as any,
              user.userId,
            );

            this.eventEmitter.emit('focus-room.join-request.created', {
              roomId: room._id,
              userId: user.userId,
              workspaceId: room.workspace_id,
              timestamp: new Date(),
            });

            throw new AppException(ErrorCode.ROOM_JOIN_REQUEST_PENDING);
          }
        }

        // No password and not a member - deny access (must request)
        await this.joinRequestService.createJoinRequest(
          room._id as any,
          user.userId,
        );

        this.eventEmitter.emit('focus-room.join-request.created', {
          roomId: room._id,
          userId: user.userId,
          workspaceId: room.workspace_id,
          timestamp: new Date(),
        });

        throw new AppException(ErrorCode.ROOM_JOIN_REQUEST_PENDING);
      }

      throw new AppException(ErrorCode.ROOM_ACCESS_DENIED);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Get(':roomId/join-requests/pending')
  @HttpCode(HttpStatus.OK)
  async getPendingRequests(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      if (!roomId) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
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

      const requests = await this.joinRequestService.getPendingRequests(
        room._id as any,
      );

      return new ApiResponse(requests);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post(':roomId/join-requests/approve')
  @HttpCode(HttpStatus.OK)
  async approveJoinRequest(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { user_id: string },
  ): Promise<ApiResponse<any>> {
    try {
      if (!roomId || !body.user_id) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
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

      // Find pending request for this user and room
      const pendingRequests = await this.joinRequestService.getPendingRequests(
        room._id as any,
      );
      const requestToApprove = pendingRequests.find(
        (r) =>
          r.user_id._id?.toString() === body.user_id ||
          r.user_id.toString() === body.user_id,
      );

      if (!requestToApprove) {
        throw new AppException(ErrorCode.ROOM_ACCESS_DENIED);
      }

      const result = await this.joinRequestService.approveRequest(
        requestToApprove._id,
        user.userId,
      );

      this.eventEmitter.emit('focus-room.join-request.approved', {
        roomId: room._id,
        requestId: requestToApprove._id,
        targetUserId: body.user_id,
        approvedBy: user.userId,
        workspaceId: room.workspace_id,
        timestamp: new Date(),
      });

      return new ApiResponse({
        message: 'Request approved successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post(':roomId/join-requests/reject')
  @HttpCode(HttpStatus.OK)
  async rejectJoinRequest(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { user_id: string },
  ): Promise<ApiResponse<any>> {
    try {
      if (!roomId || !body.user_id) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
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

      // Find pending request for this user and room
      const pendingRequests = await this.joinRequestService.getPendingRequests(
        room._id as any,
      );
      const requestToReject = pendingRequests.find(
        (r) =>
          r.user_id._id?.toString() === body.user_id ||
          r.user_id.toString() === body.user_id,
      );

      if (!requestToReject) {
        throw new AppException(ErrorCode.ROOM_ACCESS_DENIED);
      }

      const result = await this.joinRequestService.rejectRequest(
        requestToReject._id,
        user.userId,
      );

      this.eventEmitter.emit('focus-room.join-request.rejected', {
        roomId: room._id,
        requestId: requestToReject._id,
        targetUserId: body.user_id,
        rejectedBy: user.userId,
        workspaceId: room.workspace_id,
        timestamp: new Date(),
      });

      return new ApiResponse({
        message: 'Request rejected successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Put(':roomId')
  @HttpCode(HttpStatus.OK)
  async updateRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() updateRoomDto: UpdateLiveRoomDto,
  ): Promise<
    ApiResponse<{
      message: string;
      data: any;
    }>
  > {
    try {
      if (!roomId) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const updatedRoom = await this.liveRoomService.updateRoom(
        roomId,
        user.userId,
        updateRoomDto,
      );

      return new ApiResponse({
        message: 'Cập nhật phòng thành công',
        data: updatedRoom,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Post(':roomId/kick')
  @HttpCode(HttpStatus.OK)
  async kickParticipant(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { user_id: string },
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!roomId || !body.user_id) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      const room = await this.liveRoomService.getRoomById(roomId);
      if (!room) {
        throw new AppException(ErrorCode.ROOM_NOT_FOUND);
      }

      // Only host and workspace managers can kick participants
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

      // Can't kick yourself
      if (body.user_id === user.userId) {
        throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
      }

      // Remove member from room
      await this.liveRoomService.kickParticipant(roomId, body.user_id);

      return new ApiResponse({
        message: `Participant ${body.user_id} kicked from room successfully`,
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.OK)
  async deleteRoom(
    @Request() req,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!roomId) {
        throw new AppException(ErrorCode.INVALID_ROOM_ID);
      }

      const user = req.userInfo as UserDto;
      if (!user?.userId) {
        throw new AppException(ErrorCode.ROOM_USER_NOT_AUTHENTICATED);
      }

      await this.liveRoomService.deleteRoom(roomId, user.userId);

      return new ApiResponse({
        message: 'Xóa phòng thành công',
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(ErrorCode.UNCATEGORIZED_CODE);
    }
  }
}
