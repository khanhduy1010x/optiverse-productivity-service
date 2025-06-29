"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NoteGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const note_service_1 = require("./note.service");
const common_1 = require("@nestjs/common");
let NoteGateway = NoteGateway_1 = class NoteGateway {
    constructor(noteService) {
        this.noteService = noteService;
        this.logger = new common_1.Logger(NoteGateway_1.name);
        this.clientData = new Map();
    }
    afterInit() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveUsers();
        }, 5 * 60 * 1000);
    }
    handleConnection(client) {
        this.clientData.set(client.id, {
            noteIds: new Set(),
            lastActive: Date.now(),
        });
    }
    handleDisconnect(client) {
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
    cleanupInactiveUsers() {
        const now = Date.now();
        const inactiveThreshold = 30 * 60 * 1000;
        this.clientData.forEach((data, clientId) => {
            if (now - data.lastActive > inactiveThreshold) {
                this.clientData.delete(clientId);
            }
        });
    }
    async handleJoinNote(data, client) {
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
        }
        catch (err) {
            client.emit('note_error', {
                noteId: data.noteId,
                error: 'Không tìm thấy ghi chú',
            });
        }
    }
    handleLeaveNote(data, client) {
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
    normalizeContent(content) {
        if (content.endsWith('&#8203;') ||
            content.endsWith('\u200B') ||
            content.endsWith('&nbsp;') ||
            content.endsWith('\u00A0')) {
            return content;
        }
        return content;
    }
    async handleNoteUpdate(data, client) {
        const roomName = `note:${data.noteId}`;
        const clientInfo = this.clientData.get(client.id);
        if (clientInfo) {
            clientInfo.lastActive = Date.now();
        }
        try {
            let contentToSave = this.normalizeContent(data.content);
            const dto = {
                content: contentToSave,
            };
            await this.noteService.updateNote(data.noteId, dto);
            client.to(roomName).emit('note_update', {
                noteId: data.noteId,
                content: contentToSave,
            });
        }
        catch (err) {
            client.emit('note_error', {
                noteId: data.noteId,
                error: 'Không thể lưu ghi chú',
            });
        }
    }
    handleTyping(data, client) {
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
    handleStopTyping(data, client) {
        const roomName = `note:${data.noteId}`;
        client.to(roomName).emit('stop_typing', {
            noteId: data.noteId,
            userId: client.id,
        });
    }
    handleNoteDeleted(data, client) {
        const roomName = `note:${data.noteId}`;
        this.logger.log(`Broadcasting note_deleted event for noteId: ${data.noteId}`);
        client.to(roomName).emit('note_deleted', {
            noteId: data.noteId,
        });
        this.server.emit('folder_structure_changed');
    }
    handleNoteRenamed(data, client) {
        const roomName = `note:${data.noteId}`;
        this.logger.log(`Broadcasting note_renamed event for noteId: ${data.noteId}`);
        client.to(roomName).emit('note_renamed', {
            noteId: data.noteId,
            newTitle: data.newTitle,
        });
        this.server.emit('folder_structure_changed');
    }
    handleFolderDeleted(data, client) {
        this.logger.log(`Broadcasting folder_deleted event for folderId: ${data.folderId}`);
        this.server.emit('folder_deleted', {
            folderId: data.folderId,
        });
        setTimeout(() => {
            this.server.emit('folder_structure_changed');
        }, 100);
    }
    handleFolderStructureChanged(client) {
        this.logger.log('Broadcasting folder_structure_changed event');
        client.broadcast.emit('folder_structure_changed');
    }
    handleNoteShared(data, client) {
        this.logger.log(`Broadcasting note_shared event for noteId: ${data.noteId} with user: ${data.sharedWithUserId}`);
        this.server.emit('note_shared_with_user', {
            noteId: data.noteId,
            userId: data.sharedWithUserId,
        });
    }
    handleFolderShared(data, client) {
        this.logger.log(`Broadcasting folder_shared event for folderId: ${data.folderId} with user: ${data.sharedWithUserId}`);
        this.server.emit('folder_shared_with_user', {
            folderId: data.folderId,
            userId: data.sharedWithUserId,
        });
    }
    async beforeApplicationShutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.server?.disconnectSockets(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }
};
exports.NoteGateway = NoteGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NoteGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_note'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NoteGateway.prototype, "handleJoinNote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_note'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleLeaveNote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('note_update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NoteGateway.prototype, "handleNoteUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleStopTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('note_deleted'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleNoteDeleted", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('note_renamed'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleNoteRenamed", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('folder_deleted'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleFolderDeleted", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('folder_structure_changed'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleFolderStructureChanged", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('note_shared'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleNoteShared", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('folder_shared'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NoteGateway.prototype, "handleFolderShared", null);
exports.NoteGateway = NoteGateway = NoteGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        path: '/socket.io',
    }),
    __metadata("design:paramtypes", [note_service_1.NoteService])
], NoteGateway);
//# sourceMappingURL=note.gateway.js.map