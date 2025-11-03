import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Types, Model } from 'mongoose';
import { RoomServiceClient } from 'livekit-server-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { LiveRoomDocument, AccessType } from './schemas/live-room.schema';
import { LiveRoomRepository } from './live-room.repository';
import { CreateLiveRoomDto } from './dto/create-live-room.dto';
import { WorkspacePermissionService } from '../workspace/workspace-permission.service';
import { UserHttpClient } from '../http-axios/user-http.client';
import { LiveRoomJoinRequestService } from './live-room-join-request.service';
import { LiveRoomMember } from './schemas/live-room-member.schema';

@Injectable()
export class LiveRoomService {
  private roomClient: RoomServiceClient;

  constructor(
    private liveRoomRepository: LiveRoomRepository,
    private workspacePermissionService: WorkspacePermissionService,
    private userHttpClient: UserHttpClient,
    private joinRequestService: LiveRoomJoinRequestService,
    @InjectModel(LiveRoomMember.name)
    private readonly liveRoomMemberModel: Model<LiveRoomMember>,
  ) {
    const liveKitUrl = process.env.LIVEKIT_URL || 'http://localhost:7880';
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.roomClient = new RoomServiceClient(liveKitUrl, apiKey, apiSecret);
  }

  async createRoom(
    userId: string,
    createRoomDto: CreateLiveRoomDto,
  ): Promise<LiveRoomDocument> {
    const {
      name,
      workspace_id,
      access_type = AccessType.PUBLIC,
      password,
      description,
    } = createRoomDto;

    if (workspace_id) {
      await this.validateUserWorkspacePermission(userId, workspace_id);
    }

    const roomId = randomBytes(6).toString('hex');
    const now = new Date();

    const liveRoom = await this.liveRoomRepository.create({
      name,
      workspace_id: workspace_id ? new Types.ObjectId(workspace_id) : undefined,
      host_id: new Types.ObjectId(userId),
      room_sid: roomId,
      access_type,
      password: password || undefined,
      is_recording: false,
      record_count: 0,
      description: description || undefined,
      created_at: now,
      updated_at: now,
    });

    // ✅ Tạo phòng thật trên LiveKit server
    try {
      const createdRoom = await this.roomClient.createRoom({
        name: (liveRoom._id as Types.ObjectId).toString(),
        emptyTimeout: 300,
        maxParticipants: 20,
        metadata: JSON.stringify({
          workspace_id,
          created_by: userId,
        }),
      });

      await this.liveRoomRepository.updateRoomSid(
        liveRoom._id as Types.ObjectId,
        createdRoom.sid,
      );

      return (await this.liveRoomRepository.findById(
        liveRoom._id as Types.ObjectId,
      ))!;
    } catch (error) {
      console.error('❌ Failed to create LiveKit room:', error);
      return liveRoom;
    }
  }

  private async validateUserWorkspacePermission(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    // Check if user is workspace owner
    const isWorkspaceOwner =
      await this.workspacePermissionService.isWorkspaceOwner(
        workspaceId,
        userId,
      );

    if (isWorkspaceOwner) {
      return; // Owner can always create rooms
    }

    const permission = await this.workspacePermissionService.getUserPermissions(
      workspaceId,
      userId,
    );

    if (!permission) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo phòng trong workspace này',
      );
    }

    // Only ROOM_ADMIN can create rooms
    const hasPermission = (permission.actions || []).includes('ROOM_ADMIN');

    if (!hasPermission) {
      throw new ForbiddenException('Bạn cần quyền ROOM_ADMIN để tạo phòng');
    }
  }

  async getRoomById(roomId: string): Promise<LiveRoomDocument | null> {
    return this.liveRoomRepository.findById(roomId);
  }

  async getRoomsByWorkspace(
    workspaceId: string,
    userId?: string,
  ): Promise<any[]> {
    const rooms = await this.liveRoomRepository.findByWorkspaceId(workspaceId);

    // Lấy thông tin host cho từng room
    const hostIds = [...new Set(rooms.map((room) => room.host_id.toString()))];
    const hostsData = await this.userHttpClient.getUsersByIds(hostIds);

    // Map host info vào rooms với access status
    const roomsWithAccess = await Promise.all(
      rooms.map(async (room) => {
        let userAccessStatus = 'denied';

        if (userId) {
          // Host can always access their own room
          if (room.host_id.toString() === userId) {
            userAccessStatus = 'allowed';
          } else if (room.access_type === 'public') {
            userAccessStatus = 'allowed';
          } else if (room.access_type === 'private') {
            // Check join request status for private rooms
            const requestStatus =
              await this.joinRequestService.getUserRequestStatus(
                room._id as Types.ObjectId,
                userId,
              );

            if (requestStatus === 'accepted') {
              userAccessStatus = 'allowed';
            } else if (requestStatus === 'pending') {
              userAccessStatus = 'pending';
            } else {
              userAccessStatus = room.password ? 'password_required' : 'denied';
            }
          }
        }

        // Lấy số lượng members trong room
        const memberCount = await this.liveRoomMemberModel.countDocuments({
          room_id: room._id,
        });

        return {
          _id: room._id,
          name: room.name,
          workspace_id: room.workspace_id,
          host_id: room.host_id,
          hostUser:
            hostsData.find((h) => h.user_id === room.host_id.toString()) ||
            null,
          room_sid: room.room_sid,
          access_type: room.access_type,
          have_password: !!room.password,
          description: room.description,
          is_recording: room.is_recording,
          record_count: room.record_count,
          userAccessStatus,
          memberCount,
          created_at: room.created_at,
          updated_at: room.updated_at,
        };
      }),
    );

    return roomsWithAccess;
  }

  async getRoomsByHost(hostId: string): Promise<LiveRoomDocument[]> {
    return this.liveRoomRepository.findByHostId(hostId);
  }

  async getUserLiveRoomPermissions(
    userId: string,
    workspaceId: string,
  ): Promise<{
    hasPermission: boolean;
    actions: string[];
    is_owner: boolean;
    message: string;
  }> {
    try {
      const isOwner = await this.workspacePermissionService.isWorkspaceOwner(
        workspaceId,
        userId,
      );

      if (isOwner) {
        return {
          hasPermission: true,
          actions: ['ROOM_ADMIN'],
          is_owner: true,
          message: 'Lấy quyền thành công (Owner)',
        };
      }

      const permission =
        await this.workspacePermissionService.getUserPermissions(
          workspaceId,
          userId,
        );

      if (!permission) {
        return {
          hasPermission: false,
          actions: [],
          is_owner: false,
          message: 'User không có quyền trong live_room module',
        };
      }

      const actions = (permission.actions || []).includes('ROOM_ADMIN')
        ? ['ROOM_ADMIN']
        : ['ROOM_USER'];

      return {
        hasPermission: true,
        actions,
        is_owner: false,
        message: 'Lấy quyền thành công',
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lấy quyền: ${error.message}`);
    }
  }
  async kickParticipant(roomName: string, identity: string) {
    try {
      await this.roomClient.removeParticipant(roomName, identity);
      console.log(`Kicked participant ${identity} from room ${roomName}`);
    } catch (err) {
      console.error('Error kicking participant:', err);
      throw err;
    }
  }

  async updateRoom(
    roomId: string,
    userId: string,
    updateData: {
      name?: string;
      access_type?: AccessType;
      new_password?: string;
      old_password?: string;
      description?: string;
      remove_password?: boolean;
    },
  ): Promise<LiveRoomDocument> {
    const room = await this.liveRoomRepository.findById(roomId);
    if (!room) {
      throw new ForbiddenException('Phòng không tồn tại');
    }

    // Only host can update room
    if (room.host_id.toString() !== userId) {
      throw new ForbiddenException(
        'Chỉ chủ phòng mới có thể cập nhật thông tin phòng',
      );
    }

    const updatePayload: any = {};

    // Update name if provided
    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name;
    }

    // Update description if provided
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description;
    }

    // Handle access_type change with password logic
    if (updateData.access_type !== undefined) {
      const oldType = room.access_type;
      const newType = updateData.access_type;

      updatePayload.access_type = newType;

      // Chuyển từ private sang public -> LUÔN xóa password
      if (oldType === AccessType.PRIVATE && newType === AccessType.PUBLIC) {
        // Always remove password when switching to public
        updatePayload.password = '';
      }

      // Chuyển sang private với password mới (Public → Private hoặc Private → Private)
      if (newType === AccessType.PRIVATE && updateData.new_password) {
        updatePayload.password = updateData.new_password;
      }
    }

    // Handle password removal (phải là private và có password)
    if (updateData.remove_password === true) {
      if (room.access_type !== AccessType.PRIVATE) {
        throw new ForbiddenException(
          'Chỉ có thể xóa password cho phòng private',
        );
      }
      if (!room.password) {
        throw new ForbiddenException('Phòng này không có password');
      }
      updatePayload.password = '';
    }

    // Handle password change/add (chỉ cho private)
    // Skip if we're just changing access_type (đã xử lý ở trên)
    if (updateData.new_password !== undefined && !updateData.access_type) {
      if (room.access_type !== AccessType.PRIVATE) {
        throw new ForbiddenException(
          'Chỉ có thể thêm/đổi password cho phòng private',
        );
      }

      // Case 1: Room has NO password yet -> ADD PASSWORD
      if (!room.password) {
        // Just set the new password directly
        updatePayload.password = updateData.new_password;
      } else {
        // Case 2: Room has password -> CHANGE PASSWORD (require verification)
        // Verify old password
        if (!updateData.old_password) {
          throw new ForbiddenException('Vui lòng nhập password cũ');
        }

        if (updateData.old_password !== room.password) {
          throw new ForbiddenException('Password cũ không chính xác');
        }

        updatePayload.password = updateData.new_password;
      }
    }

    // Update timestamp
    updatePayload.updated_at = new Date();

    // Perform update
    const updatedRoom = await this.liveRoomRepository.update(
      roomId,
      updatePayload,
    );

    if (!updatedRoom) {
      throw new ForbiddenException('Không thể cập nhật phòng');
    }

    return updatedRoom;
  }

  async deleteRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.liveRoomRepository.findById(roomId);
    if (!room) {
      throw new ForbiddenException('Phòng không tồn tại');
    }

    // Only host can delete room
    if (room.host_id.toString() !== userId) {
      throw new ForbiddenException('Chỉ chủ phòng mới có thể xóa phòng');
    }

    // Delete room from database

    // Delete room from LiveKit server
    try {
      if (room.room_sid) {
        await this.roomClient.deleteRoom(roomId);
        await this.liveRoomRepository.delete(roomId);
        console.log(`Deleted LiveKit room: ${room.room_sid}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete LiveKit room:', error);
      // Continue anyway - room is already deleted from DB
    }

    // Clean up related data (members)
    await this.liveRoomMemberModel.deleteMany({ room_id: room._id });
  }
}
