import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NoteService } from './note.service';
import { UpdateNoteRequest } from './dto/request/UpdateNoteRequest.dto';
import { Logger } from '@nestjs/common';

interface ClientData {
  noteIds: Set<string>;
  lastActive: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/socket.io',
})
export class NoteGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(NoteGateway.name);

  constructor(private readonly noteService: NoteService) {}

  @WebSocketServer()
  server: Server;

  private clientData: Map<string, ClientData> = new Map();

  private cleanupInterval: NodeJS.Timeout;

  // Lưu trữ thông tin về người dùng đang xem shared items
  private usersViewingSharedItems: Set<string> = new Set();

  afterInit() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupInactiveUsers();
      },
      5 * 60 * 1000,
    );
  }

  handleConnection(client: Socket) {
    this.clientData.set(client.id, {
      noteIds: new Set(),
      lastActive: Date.now(),
    });
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.forEach((noteId) => {
        const roomName = `note:${noteId}`;
        client.to(roomName).emit('stop_typing', {
          noteId,
          userId: client.id,
        });
      });
    }

    this.clientData.delete(client.id);
  }

  private cleanupInactiveUsers() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000;

    this.clientData.forEach((data, clientId) => {
      if (now - data.lastActive > inactiveThreshold) {
        this.clientData.delete(clientId);
      }
    });
  }

  @SubscribeMessage('join_note')
  async handleJoinNote(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    client.join(roomName);

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.add(data.noteId);
      clientInfo.lastActive = Date.now();
    }

    try {
      const note = await this.noteService.getNotebyId(data.noteId);

      client.emit('note_update', {
        noteId: data.noteId,
        content: note.content,
      });
    } catch (err) {
      client.emit('note_error', {
        noteId: data.noteId,
        error: 'Không tìm thấy ghi chú',
      });
    }
  }

  @SubscribeMessage('leave_note')
  handleLeaveNote(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    client.leave(roomName);

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.noteIds.delete(data.noteId);
      clientInfo.lastActive = Date.now();

      client.to(roomName).emit('stop_typing', {
        noteId: data.noteId,
        userId: client.id,
      });
    }
  }

  private normalizeContent(content: string): string {
    if (
      content.endsWith('&#8203;') ||
      content.endsWith('\u200B') ||
      content.endsWith('&nbsp;') ||
      content.endsWith('\u00A0')
    ) {
      return content;
    }
    return content;
  }

  @SubscribeMessage('note_update')
  async handleNoteUpdate(
    @MessageBody() data: { noteId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;
    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.lastActive = Date.now();
    }

    try {
      let contentToSave = this.normalizeContent(data.content);

      const dto: UpdateNoteRequest = {
        content: contentToSave,
      };

      await this.noteService.updateNote(data.noteId, dto);

      client.to(roomName).emit('note_update', {
        noteId: data.noteId,
        content: contentToSave,
      });
    } catch (err) {
      client.emit('note_error', {
        noteId: data.noteId,
        error: 'Không thể lưu ghi chú',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    const clientInfo = this.clientData.get(client.id);
    if (clientInfo) {
      clientInfo.lastActive = Date.now();
    }

    client.to(roomName).emit('typing', {
      noteId: data.noteId,
      userId: client.id,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @MessageBody() data: { noteId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    client.to(roomName).emit('stop_typing', {
      noteId: data.noteId,
      userId: client.id,
    });
  }

  @SubscribeMessage('note_deleted')
  async handleNoteDeleted(
    @MessageBody() data: { noteId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    client.to(roomName).emit('note_deleted', {
      noteId: data.noteId,
      eventType: 'my_note',
    });

    try {
      const note = await this.noteService.getNotebyId(data.noteId);

      const ownerRoom = `user:${note.user_id.toString()}`;

      this.server.to(ownerRoom).emit('folder_structure_changed', {
        eventType: 'my_note',
        isSharedView: false,
      });

      const shareInfo = await this.noteService.getShareInfoForNote(data.noteId);

      if (
        shareInfo &&
        shareInfo.shared_with &&
        shareInfo.shared_with.length > 0
      ) {
        for (const sharedUser of shareInfo.shared_with) {
          const userRoom = `user:${sharedUser.user_id.toString()}`;
          this.server.to(userRoom).emit('note_deleted', {
            noteId: data.noteId,
            eventType: 'shared_note',
          });
          this.server.to(userRoom).emit('folder_structure_changed', {
            eventType: 'shared_note',
            isSharedView: true,
          });
        }
      }
    } catch (err) {
      this.logger.error(`Error getting note info: ${err.message}`);
    }
  }

  @SubscribeMessage('note_renamed')
  async handleNoteRenamed(
    @MessageBody() data: { noteId: string; newTitle: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `note:${data.noteId}`;

    client.to(roomName).emit('note_renamed', {
      noteId: data.noteId,
      newTitle: data.newTitle,
      eventType: 'my_note',
    });

    try {
      const note = await this.noteService.getNotebyId(data.noteId);

      const ownerRoom = `user:${note.user_id.toString()}`;
      this.server.to(ownerRoom).emit('folder_structure_changed', {
        eventType: 'my_note',
        isSharedView: false,
      });

      const shareInfo = await this.noteService.getShareInfoForNote(data.noteId);

      if (
        shareInfo &&
        shareInfo.shared_with &&
        shareInfo.shared_with.length > 0
      ) {
        for (const sharedUser of shareInfo.shared_with) {
          const userRoom = `user:${sharedUser.user_id.toString()}`;

          const userInNoteRoom = this.isUserInRoom(
            sharedUser.user_id.toString(),
            roomName,
          );

          if (!userInNoteRoom) {
            const isViewingSharedItems = this.isUserViewingSharedItems(
              sharedUser.user_id.toString(),
            );
            if (isViewingSharedItems) {
              this.server.to(userRoom).emit('note_renamed', {
                noteId: data.noteId,
                newTitle: data.newTitle,
                eventType: 'shared_note',
              });
              this.server.to(userRoom).emit('folder_structure_changed', {
                eventType: 'shared_note',
                isSharedView: true,
              });
            }
          }
        }
      }
    } catch (err) {
      this.logger.error(`Error getting note info: ${err.message}`);
    }
  }

  private isUserInRoom(userId: string, roomName: string): boolean {
    const userRoom = `user:${userId}`;
    const socketsInUserRoom = this.server.sockets.adapter.rooms.get(userRoom);
    const socketsInNoteRoom = this.server.sockets.adapter.rooms.get(roomName);

    if (!socketsInUserRoom || !socketsInNoteRoom) return false;

    for (const socketId of socketsInUserRoom) {
      if (socketsInNoteRoom.has(socketId)) {
        return true;
      }
    }

    return false;
  }

  @SubscribeMessage('viewing_shared_items')
  handleViewingSharedItems(@MessageBody() payload: any): void {
    try {
      const { userId, isViewing } = payload;
      if (!userId) return;

      console.log(
        `User ${userId} ${isViewing ? 'started' : 'stopped'} viewing shared items`,
      );

      // Cập nhật trạng thái xem shared items
      if (isViewing) {
        this.usersViewingSharedItems.add(userId);
      } else {
        this.usersViewingSharedItems.delete(userId);
      }
    } catch (error) {
      console.error('Error handling viewing shared items:', error.message);
    }
  }

  /**
   * Kiểm tra xem người dùng có đang xem shared items không
   * @param userId ID của người dùng
   * @returns true nếu người dùng đang xem shared items, ngược lại false
   */
  private isUserViewingSharedItems(userId: string): boolean {
    return this.usersViewingSharedItems.has(userId);
  }

  @SubscribeMessage('folder_deleted')
  async handleFolderDeleted(
    @MessageBody() data: { folderId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Broadcasting folder_deleted event for folderId: ${data.folderId}`,
    );

    try {
      const ownerRoom = `user:${data.userId.toString()}`;

      this.server.to(ownerRoom).emit('folder_deleted', {
        folderId: data.folderId,
        eventType: 'my_note',
      });

      setTimeout(() => {
        this.server.to(ownerRoom).emit('folder_structure_changed', {
          eventType: 'my_note',
          isSharedView: false,
        });
      }, 100);

      const shareInfo = await this.noteService.getFolderShareInfo(
        data.folderId,
      );

      if (
        shareInfo &&
        shareInfo.shared_with &&
        shareInfo.shared_with.length > 0
      ) {
        for (const sharedUser of shareInfo.shared_with) {
          const userRoom = `user:${sharedUser.user_id.toString()}`;
          this.server.to(userRoom).emit('folder_deleted', {
            folderId: data.folderId,
            eventType: 'shared_note',
          });
          setTimeout(() => {
            this.server.to(userRoom).emit('folder_structure_changed', {
              eventType: 'shared_note',
              isSharedView: true,
            });
          }, 100);
        }
      }
    } catch (err) {
      this.logger.error(`Error in folder_deleted: ${err.message}`);
    }
  }

  @SubscribeMessage('folder_renamed')
  async handleFolderRenamed(
    @MessageBody() data: { folderId: string; newName: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Broadcasting folder_renamed event for folderId: ${data.folderId}`,
    );

    try {
      const ownerRoom = `user:${data.userId.toString()}`;

      this.server.to(ownerRoom).emit('folder_renamed', {
        folderId: data.folderId,
        newName: data.newName,
        eventType: 'my_note',
      });

      this.server.to(ownerRoom).emit('folder_structure_changed', {
        eventType: 'my_note',
        isSharedView: false,
      });

      const shareInfo = await this.noteService.getFolderShareInfo(
        data.folderId,
      );

      if (
        shareInfo &&
        shareInfo.shared_with &&
        shareInfo.shared_with.length > 0
      ) {
        for (const sharedUser of shareInfo.shared_with) {
          const userRoom = `user:${sharedUser.user_id.toString()}`;
          this.server.to(userRoom).emit('folder_renamed', {
            folderId: data.folderId,
            newName: data.newName,
            eventType: 'shared_note',
          });
          this.server.to(userRoom).emit('folder_structure_changed', {
            eventType: 'shared_note',
            isSharedView: true,
          });
        }
      }
    } catch (err) {
      this.logger.error(`Error in folder_renamed: ${err.message}`);
    }
  }

  @SubscribeMessage('folder_structure_changed')
  handleFolderStructureChanged(@MessageBody() payload: any): void {
    try {
      const { userId } = payload;
      if (!userId) return;

      // Kiểm tra người dùng có đang xem shared items không
      const isViewingShared = this.usersViewingSharedItems.has(userId);
      console.log(
        `User ${userId} folder_structure_changed (viewing shared: ${isViewingShared})`,
      );

      // Gửi sự kiện đến phòng của người dùng với context rõ ràng
      this.server.to(`user:${userId}`).emit('folder_structure_changed', {
        isSharedView: isViewingShared,
        eventType: isViewingShared ? 'shared_note' : 'my_note',
      });
    } catch (error) {
      console.error('Error handling folder structure changed:', error.message);
    }
  }

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId) return;

    const roomName = `user:${data.userId.toString()}`;
    client.join(roomName);
    this.logger.log(`User ${data.userId} joined room ${roomName}`);
  }

  @SubscribeMessage('leave_user_room')
  handleLeaveUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId) return;

    const roomName = `user:${data.userId.toString()}`;
    client.leave(roomName);
    this.logger.log(`User ${data.userId} left room ${roomName}`);
  }

  @SubscribeMessage('note_shared')
  handleNoteShared(
    @MessageBody()
    data: { noteId: string; sharedWithUserId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Broadcasting note_shared event for noteId: ${data.noteId} with user: ${data.sharedWithUserId}`,
    );

    const userRoom = `user:${data.sharedWithUserId.toString()}`;

    const noteRoom = `note:${data.noteId}`;

    const socketsInUserRoom = this.server.sockets.adapter.rooms.get(userRoom);

    if (socketsInUserRoom) {
      for (const socketId of socketsInUserRoom) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(noteRoom);
          this.logger.log(
            `Added user ${data.sharedWithUserId} to note room ${noteRoom}`,
          );

          const clientInfo = this.clientData.get(socketId);
          if (clientInfo) {
            clientInfo.noteIds.add(data.noteId);
            clientInfo.lastActive = Date.now();
          }
        }
      }
    }

    this.server.to(userRoom).emit('note_shared_with_user', {
      noteId: data.noteId,
      userId: data.sharedWithUserId,
      eventType: 'shared_note',
    });

    this.server.to(userRoom).emit('folder_structure_changed', {
      eventType: 'shared_note',
      isSharedView: true,
    });
  }

  @SubscribeMessage('folder_shared')
  handleFolderShared(
    @MessageBody()
    data: { folderId: string; sharedWithUserId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Broadcasting folder_shared event for folderId: ${data.folderId} with user: ${data.sharedWithUserId}`,
    );

    const userRoom = `user:${data.sharedWithUserId.toString()}`;

    this.server.to(userRoom).emit('folder_shared_with_user', {
      folderId: data.folderId,
      userId: data.sharedWithUserId,
      eventType: 'shared_note',
    });

    this.server.to(userRoom).emit('folder_structure_changed', {
      eventType: 'shared_note',
      isSharedView: true,
    });
  }

  @SubscribeMessage('note_user_removed')
  async handleNoteUserRemoved(
    @MessageBody()
    data: { noteId: string; removedUserId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const removedUserRoom = `user:${data.removedUserId}`;

    // Kiểm tra người dùng có đang xem shared items không
    const isViewingShared = this.isUserViewingSharedItems(data.removedUserId);

    this.logger.log(
      `User ${data.removedUserId} was removed from note ${data.noteId} (viewing shared: ${isViewingShared})`,
    );

    // Gửi permission_changed event với shouldRefreshShared=true như khi thay đổi quyền
    this.server.to(removedUserRoom).emit('permission_changed', {
      resourceId: data.noteId,
      permission: 'none', // Không còn quyền truy cập
      shouldRefreshShared: true,
      eventType: 'shared_note',
    });

    // Thêm sự kiện folder_structure_changed để đảm bảo UI được cập nhật
    this.server.to(removedUserRoom).emit('folder_structure_changed', {
      isSharedView: true,
      eventType: 'shared_note',
      removedFromShare: true,
    });
  }

  @SubscribeMessage('folder_user_removed')
  async handleFolderUserRemoved(
    @MessageBody()
    data: { folderId: string; removedUserId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const removedUserRoom = `user:${data.removedUserId}`;

    // Kiểm tra người dùng có đang xem shared items không
    const isViewingShared = this.isUserViewingSharedItems(data.removedUserId);

    this.logger.log(
      `User ${data.removedUserId} was removed from folder ${data.folderId} (viewing shared: ${isViewingShared})`,
    );

    // Gửi permission_changed event với shouldRefreshShared=true như khi thay đổi quyền
    this.server.to(removedUserRoom).emit('permission_changed', {
      resourceId: data.folderId,
      permission: 'none', // Không còn quyền truy cập
      shouldRefreshShared: true,
      eventType: 'shared_note',
    });

    // Thêm sự kiện folder_structure_changed để đảm bảo UI được cập nhật
    this.server.to(removedUserRoom).emit('folder_structure_changed', {
      isSharedView: true,
      eventType: 'shared_note',
      removedFromShare: true,
    });
  }

  async beforeApplicationShutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.server?.disconnectSockets(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
}
