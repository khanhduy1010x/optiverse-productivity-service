import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as stream from 'stream';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SpeechMessage } from '../focus-room/schemas/live-room-speech-message.schema';
import { NoteService } from '../notes/note.service';

let speech: any;
try {
  // Dùng dynamic import tránh lỗi nếu lib chưa cài
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  speech = require('@google-cloud/speech');
} catch {
  speech = null;
}

@WebSocketGateway({
  namespace: '/speech',
  cors: {
    origin: '*',
  },
  path: '/socket.io',
})
export class SpeechGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private client: any = null;

  constructor(
    @InjectModel(SpeechMessage.name)
    private readonly speechModel: Model<SpeechMessage>,
    private readonly noteService: NoteService,
  ) {
    if (speech) {
      try {
        this.client = new speech.SpeechClient({
          projectId: 'optiverse-475807',
          credentials: {
            client_email:
              'speech-agent-606@optiverse-475807.iam.gserviceaccount.com',
            private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/rCYzVvm/HQfH
sbrCC1yLWtunVms8PSiSayA7bqmrbfRKgd/xoKul78Y/L51hiaEYKtIvDmxSdRCJ
Ykzr0iFSkMmtbr3BXju6cZziPNe+IiAtXZj1nztMvea/VPqiEpzKvl1FnKX1dAhf
6L/DxEioCYT8aovHtPzccBAPbhqurk7McjQBodbAU0pH92wb73oGTNPidTNsz4uw
d+U9VDMQQK5J/dQwcYDxSdmYBwFNFAgisTkZm+KHzdfKJvlt6BXjp/7shgAwSPG+
CVxDJ5YuWrZbmRsOzE70H27aKWr6x+69koae/eq9juZbi1OK/khUF4W78msIC0+q
fmvXkdnhAgMBAAECggEACKFwyukEr+VXv1cyaKBoV2IM9/j9NSYv2H/4YJS4ER8P
W/eDJPcuI3erfpbfSFARL+xlsHa+y+u3hegmPIwmsfgRDL0q0DU1DU0mWk2RDV+u
ATzwsUatPeRjKoRiEMAzzTFLM+I82tORuPfbAq6o8uAS2+bUSnbM2AQ3xOoZS3o7
1CjQQSUv8OzKozMGCDvhyKKPuOXyi0qUhSN3jY4/MyXYv7YO+yQHVs7/KZplMpcJ
LWi7yonYMNsf1Ttn1gxyA+kB6gMG8qQ5Vm+dDTBm56+lcO333kOkdjgMVqKbm06w
NXC4H9nHe66w1R9MBTXVu1ThRTjMQDCP/QqysevtQQKBgQDt6MMIAYxmwAitt9LK
/4tuzwyRdLtaaaUkmxc2OQLqb09NdLpnyQZh3tei55k4eUfNFbqB6jFl+dybv5M+
ZS35+OzgijyHiPNYYJD6knWT7W4MlmeUpmbgaWFkdzry4QfxErIXL8cp705DsEJh
+G2z9/CULN0hQFeV9/VLdkEnCQKBgQDOP1LVbVnKCcU6Rpu3pMUHcNK/6paWtubA
+y4ikPUArbDuiNplRe6X16/lQ/FQrfRUV9ZA68hJfAtfk/gCCwt5qcDFz2yFm7Hn
Naf3F15JYZTcYepoSQj61EMnY3TpOvMg9rPiJ9OnyBQASfCemGO8E7/VAl5KeaSd
ibQXN7U6GQKBgBJzuiS10gjqHgIzPrMl7M+UWXoynpFdnkRfjwZSl6pNJc5xHkAM
dGVE3l6xLc4Wgf4jEEshOeGZ5oVh726odE9uAhlMP3OXqKATJUt57oqhoKZzR+dc
nKANLFOZd8X8tBv7gjqQJxdWizBuzEdC+Gc79LnZXPFGR0THbYwDyPvZAoGAJXMi
G1brwt/bTCWeCM6GaD94RRjXly5G4Cu7yNMBacogIm//F/yGwlOLwNmBa+DqSJZa
dRdbGtzHQ+eeVOCkiMbmFgT/85K9zvnTMe6wVCq/2PR+l8kLNGBugSxyAheOJiIl
r58Ds6eE2jiS1HlfQrtjTc5MSMGlvmVOqhiXc6ECgYEAw/RGFa3Rsm3LnO73hrmI
Bm6DXSO///kMvxiuZ+yKTYmyzbAx7ErLAfw+Xj9+gTzxwo27/Okc1FSSqTBkx/Vx
KuOPXhID3WSz7SD+eM/IKspwpPE6gJJDiDWR9VQIvlEzFjHTVgdO2CJ58UI3GW9U
gTEcp7imntaphWzGTxiq6J4=
-----END PRIVATE KEY-----\n`,
          },
        });

        console.log('✅ Google Speech client initialized');
      } catch (e) {
        console.error('❌ Failed to initialize Google Speech client:', e);
      }
    } else {
      console.warn(
        '⚠️ @google-cloud/speech not installed — SpeechGateway disabled.',
      );
    }
  }

  private connections = new Map<
    Socket,
    {
      audioStream: stream.PassThrough;
      recognizeStream: any;
      roomId?: string;
      userId?: string;
      speakerName?: string;
      restartAttempts?: number;
      lastRestartTime?: number;
    }
  >();

  // Configuration for stream restart
  private readonly MAX_RESTART_ATTEMPTS = 3;
  private readonly RESTART_DELAY_MS = 1000;
  private readonly RESTART_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly STREAM_IDLE_TIMEOUT_MS = 4 * 60 * 1000; // Close stream after 4 minutes of no audio (save $$$)
  private inactivityTimers = new Map<Socket, NodeJS.Timeout>();

  async handleConnection(client: Socket) {
    console.log('🔌 Speech: client connected', client.id);
    this.connections.set(client, {
      audioStream: new stream.PassThrough(),
      recognizeStream: new stream.PassThrough(),
    });
  }

  async handleDisconnect(client: Socket) {
    console.log('❌ Speech: client disconnected', client.id);
    // ⏱️ Clear inactivity timer
    const timer = this.inactivityTimers.get(client);
    if (timer) {
      clearTimeout(timer);
      this.inactivityTimers.delete(client);
    }

    const s = this.connections.get(client);
    if (s) {
      try {
        s.audioStream.end();
        s.recognizeStream.end();
      } catch (e) {
        console.error('Stream cleanup failed:', e);
      }
      this.connections.delete(client);
    }
  }

  /**
   * Helper method to setup and attach event listeners to recognize stream
   */
  private setupRecognizeStreamListeners(
    client: Socket,
    recognizeStream: any,
    room_id: string,
    user_id: string,
    speaker_name: string = '',
  ) {
    // ⏱️ Start inactivity timer - close stream if no audio for 4 minutes (save $$$)
    this.resetInactivityTimer(client, room_id, user_id, speaker_name);

    recognizeStream
      .on('error', (err: any) => {
        console.error(
          `💥 Speech stream error for ${client.id}:`,
          err?.message || err,
        );

        // Check if error is recoverable (timeout/deadline/inactivity)
        const isRecoverable =
          err.code === 13 || // INTERNAL error (often timeout)
          err.code === 4 || // DEADLINE_EXCEEDED
          err.message?.includes('Deadline') ||
          err.message?.includes('timeout') ||
          err.message?.includes('Timeout') ||
          err.message?.includes('Audio Timeout') ||
          err.message?.includes('Stream removed') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('Long duration elapsed');

        if (isRecoverable) {
          console.log(
            `🔁 Recoverable error detected (${err?.message}), attempting restart...`,
          );
          this.restartRecognizeStream(client, room_id, user_id, speaker_name);
        } else {
          console.error(`❌ Non-recoverable error, terminating stream`);
          client.emit('streamError', {
            error: 'Speech stream encountered an error',
            message: err?.message || 'Unknown error',
          });
        }
      })
      .on('data', async (data: any) => {
        // 🔄 Reset inactivity timer when receiving audio
        this.resetInactivityTimer(client, room_id, user_id, speaker_name);

        const result = data.results?.[0];
        const transcript = result?.alternatives?.[0]?.transcript;
        const isFinal = !!result?.isFinal;

        if (transcript) {
          client.emit('transcription', { text: transcript, isFinal });

          if (isFinal) {
            try {
              const savedMessage = await this.speechModel.create({
                room_id: new Types.ObjectId(room_id),
                user_id: new Types.ObjectId(user_id),
                speaker_name: speaker_name || user_id,
                text: transcript,
              });
              console.log('💾 Speech message persisted:', savedMessage._id);

              // 📢 Broadcast to all clients in the room
              this.server.to(`speech-room-${room_id}`).emit('speechMessage', {
                _id: savedMessage._id,
                room_id,
                user_id,
                speaker_name: speaker_name || user_id,
                text: transcript,
                createdAt: new Date(),
              });
              console.log(
                `📢 Broadcast speechMessage to room speech-room-${room_id}`,
              );

              // Reset restart attempts on successful transcription
              const conn = this.connections.get(client);
              if (conn) {
                conn.restartAttempts = 0;
              }
            } catch (err) {
              console.error('❌ Failed to save speech message:', err);
            }
          }
        }
      });
  }

  /**
   * Reset inactivity timer - if no audio for 4 minutes, close stream to save money
   */
  private resetInactivityTimer(
    client: Socket,
    room_id: string,
    user_id: string,
    speaker_name: string = '',
  ) {
    // Clear existing timer
    const existingTimer = this.inactivityTimers.get(client);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      console.log(
        `⏱️ Stream idle for 4 minutes, closing to save costs for ${client.id}`,
      );
      const conn = this.connections.get(client);
      if (conn) {
        try {
          if (conn.audioStream && conn.recognizeStream) {
            conn.audioStream.unpipe(conn.recognizeStream);
          }
          if (conn.recognizeStream) {
            conn.recognizeStream.destroy();
          }
          conn.recognizeStream = null;
          conn.audioStream = new stream.PassThrough();
          this.connections.set(client, conn);
        } catch (e) {
          console.warn('⚠️ Error closing idle stream:', e);
        }
      }

      client.emit('streamClosed', {
        reason: 'inactivity',
        message:
          'Stream closed after 4 minutes of inactivity. Will reconnect on next audio.',
      });
    }, this.STREAM_IDLE_TIMEOUT_MS);

    this.inactivityTimers.set(client, timer);
  }

  /**
   * Restart the recognize stream gracefully
   */
  private async restartRecognizeStream(
    client: Socket,
    room_id: string,
    user_id: string,
    speaker_name: string = '',
  ) {
    const conn = this.connections.get(client);
    if (!conn) {
      console.warn(
        `⚠️ Connection not found for client ${client.id}, cannot restart`,
      );
      return;
    }

    // ⏱️ Clear inactivity timer before restart
    const existingTimer = this.inactivityTimers.get(client);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Check restart attempts
    if (!conn.restartAttempts) {
      conn.restartAttempts = 0;
    }

    // Check if too many restart attempts recently
    const now = Date.now();
    if (
      conn.lastRestartTime &&
      now - conn.lastRestartTime < this.RESTART_TIMEOUT_MS &&
      conn.restartAttempts >= this.MAX_RESTART_ATTEMPTS
    ) {
      console.error(
        `❌ Too many restart attempts (${conn.restartAttempts}/${this.MAX_RESTART_ATTEMPTS}) in the last 5 minutes`,
      );
      client.emit('streamError', {
        error: 'Speech stream failed to recover after multiple attempts',
        code: 'MAX_RETRIES_EXCEEDED',
      });
      return;
    }

    // Reset attempts counter if timeout has passed
    if (
      !conn.lastRestartTime ||
      now - conn.lastRestartTime > this.RESTART_TIMEOUT_MS
    ) {
      conn.restartAttempts = 0;
      conn.lastRestartTime = now;
    }

    conn.restartAttempts++;

    console.log(
      `🔄 Attempting to restart recognize stream (attempt ${conn.restartAttempts}/${this.MAX_RESTART_ATTEMPTS})...`,
    );

    // Close old stream gracefully
    try {
      if (conn.audioStream && conn.recognizeStream) {
        conn.audioStream.unpipe(conn.recognizeStream);
      }
      if (conn.recognizeStream) {
        conn.recognizeStream.destroy();
      }
    } catch (err) {
      console.warn('⚠️ Error closing old stream:', err);
    }

    // Wait before creating new stream
    await new Promise((resolve) => setTimeout(resolve, this.RESTART_DELAY_MS));

    try {
      // Create new recognize stream
      const newRecognizeStream = this.client.streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'vi-VN',
          enableAutomaticPunctuation: true,
          interimResults: true,
        },
        interimResults: true,
      });

      // Setup listeners on new stream
      this.setupRecognizeStreamListeners(
        client,
        newRecognizeStream,
        room_id,
        user_id,
        speaker_name,
      );

      // Re-pipe audio to new stream
      conn.audioStream.pipe(newRecognizeStream);
      conn.recognizeStream = newRecognizeStream;

      console.log(
        `✅ Recognize stream restarted successfully for ${client.id}`,
      );
      client.emit('streamRestarted', {
        attempt: conn.restartAttempts,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('❌ Failed to restart recognize stream:', err);
      client.emit('streamError', {
        error: 'Failed to restart speech stream',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    payload: { room_id: string; user_id: string; speaker_name?: string },
  ) {
    const { room_id, user_id, speaker_name } = payload || {};

    if (!room_id || !user_id) {
      console.warn('⚠️ joinRoom missing room_id or user_id', payload);
      return client.emit('joinRoomError', 'Missing room_id or user_id');
    }

    console.log(`✅ ${client.id} joined room ${room_id} by ${user_id}`);

    try {
      // 🔁 Setup recognize stream for this client
      const recognizeStream = this.client.streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'vi-VN',
          alternativeLanguageCodes: ['en-US'],
          enableAutomaticPunctuation: true,
          interimResults: true,
        },
        interimResults: true,
      });

      // Setup listeners
      this.setupRecognizeStreamListeners(
        client,
        recognizeStream,
        room_id,
        user_id,
        speaker_name,
      );

      const audioStream = new stream.PassThrough();
      audioStream.pipe(recognizeStream);

      this.connections.set(client, {
        audioStream,
        recognizeStream,
        roomId: room_id,
        userId: user_id,
        speakerName: speaker_name,
        restartAttempts: 0,
        lastRestartTime: Date.now(),
      });

      // Join Socket.IO room for broadcasting
      client.join(`speech-room-${room_id}`);

      client.emit('joinRoomSuccess', { room_id, user_id });
    } catch (err) {
      console.error('❌ Failed to setup speech stream:', err);
      client.emit('joinRoomError', {
        error: 'Failed to initialize speech stream',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  @SubscribeMessage('audioChunk')
  handleAudioChunk(client: Socket, payload: { chunk: string }) {
    let conn = this.connections.get(client);

    // 🧩 Nếu chưa có stream thì khởi tạo ngay khi có audio đầu tiên
    if (!conn?.recognizeStream) {
      console.log(
        '🎙️ First audio chunk received, initializing recognition stream...',
      );
      const recognizeStream = this.client.streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'vi-VN',
          alternativeLanguageCodes: ['en-US'],
          enableAutomaticPunctuation: true,
          interimResults: true,
        },
        interimResults: true,
      });

      const audioStream = new stream.PassThrough();
      audioStream.pipe(recognizeStream);

      this.setupRecognizeStreamListeners(
        client,
        recognizeStream,
        conn?.roomId!,
        conn?.userId!,
        conn?.speakerName!,
      );
      conn = { ...conn, recognizeStream, audioStream };
      this.connections.set(client, conn);
    }

    if (!conn || !payload?.chunk) return;
    try {
      const buf = Buffer.from(payload.chunk, 'base64');
      conn.audioStream.write(buf);
    } catch (e) {
      console.error('Failed to write audio chunk:', e);
    }
  }

  // 📝 ===== NOTE ROOM HANDLERS =====

  /**
   * Create a new note in the live room
   * Emits: noteCreated (broadcast to room)
   */
  @SubscribeMessage('createNoteInRoom')
  async handleCreateNoteInRoom(
    client: Socket,
    payload: {
      title: string;
      content?: string;
      live_room_id: string;
      user_id: string;
    },
  ) {
    try {
      const { title, content, live_room_id, user_id } = payload;

      if (!title || !live_room_id || !user_id) {
        return client.emit('createNoteInRoomError', {
          error: 'Missing required fields: title, live_room_id, user_id',
        });
      }

      console.log(
        `📝 Creating note "${title}" in room ${live_room_id} by user ${user_id}`,
      );

      const noteResponse = await this.noteService.createNoteInRoom(
        { title, live_room_id },
        user_id,
      );

      console.log(`✅ Note created: ${noteResponse.note._id}`);

      // 📢 Broadcast to all users in both speech room AND note room
      this.server.to(`speech-room-${live_room_id}`).emit('noteCreated', {
        _id: noteResponse.note._id,
        title: noteResponse.note.title,
        content: noteResponse.note.content,
        live_room_id,
        user_id,
        createdAt: new Date(),
      });

      // 📢 Also broadcast to note room (for NotesPanel users)
      this.server.to(`note-room-${live_room_id}`).emit('noteCreated', {
        _id: noteResponse.note._id,
        title: noteResponse.note.title,
        content: noteResponse.note.content,
        live_room_id,
        user_id,
        createdAt: new Date(),
      });

      // ✅ Emit success to client
      client.emit('createNoteInRoomSuccess', {
        _id: noteResponse.note._id,
        title: noteResponse.note.title,
        content: noteResponse.note.content,
        live_room_id,
      });
    } catch (err) {
      console.error('❌ Failed to create note in room:', err);
      client.emit('createNoteInRoomError', {
        error: 'Failed to create note',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  /**
   * Get all notes for a specific room
   */
  @SubscribeMessage('getNotesByRoom')
  async handleGetNotesByRoom(
    client: Socket,
    payload: { live_room_id: string },
  ) {
    try {
      const { live_room_id } = payload;

      if (!live_room_id) {
        return client.emit('getNotesByRoomError', {
          error: 'Missing required field: live_room_id',
        });
      }

      console.log(`📚 Fetching notes for room ${live_room_id}`);

      const notes = await this.noteService.getNotesByRoomId(live_room_id);

      console.log(`✅ Found ${notes.length} notes in room ${live_room_id}`);

      client.emit('getNotesByRoomSuccess', {
        live_room_id,
        notes: notes.map((note) => ({
          _id: note._id,
          title: note.title,
          content: note.content,
          user_id: note.user_id,
        })),
      });
    } catch (err) {
      console.error('❌ Failed to get notes by room:', err);
      client.emit('getNotesByRoomError', {
        error: 'Failed to fetch notes',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  /**
   * Update a note in the room (broadcasts to all users)
   */
  @SubscribeMessage('updateNoteInRoom')
  async handleUpdateNoteInRoom(
    client: Socket,
    payload: {
      note_id: string;
      title?: string;
      content?: string;
      live_room_id: string;
    },
  ) {
    try {
      const { note_id, title, content, live_room_id } = payload;

      if (!note_id || !live_room_id) {
        return client.emit('updateNoteInRoomError', {
          error: 'Missing required fields: note_id, live_room_id',
        });
      }

      console.log(`✏️ Updating note ${note_id} in room ${live_room_id}`);

      const updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title;
      if (content !== undefined) updatePayload.content = content;

      const updatedNote = await this.noteService.updateNote(
        note_id,
        updatePayload,
      );

      console.log(`✅ Note ${note_id} updated`);

      // 📢 Broadcast to both speech room and note room
      this.server.to(`speech-room-${live_room_id}`).emit('noteUpdated', {
        _id: updatedNote.note._id,
        title: updatedNote.note.title,
        content: updatedNote.note.content,
        live_room_id,
        updatedAt: new Date(),
      });

      this.server.to(`note-room-${live_room_id}`).emit('noteUpdated', {
        _id: updatedNote.note._id,
        title: updatedNote.note.title,
        content: updatedNote.note.content,
        live_room_id,
        updatedAt: new Date(),
      });

      // ✅ Emit success to client
      client.emit('updateNoteInRoomSuccess', {
        _id: updatedNote.note._id,
        title: updatedNote.note.title,
        content: updatedNote.note.content,
      });
    } catch (err) {
      console.error('❌ Failed to update note in room:', err);
      client.emit('updateNoteInRoomError', {
        error: 'Failed to update note',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  /**
   * Delete a note from the room (broadcasts to all users)
   */
  @SubscribeMessage('deleteNoteInRoom')
  async handleDeleteNoteInRoom(
    client: Socket,
    payload: { note_id: string; live_room_id: string },
  ) {
    try {
      const { note_id, live_room_id } = payload;

      if (!note_id || !live_room_id) {
        return client.emit('deleteNoteInRoomError', {
          error: 'Missing required fields: note_id, live_room_id',
        });
      }

      console.log(`🗑️ Deleting note ${note_id} from room ${live_room_id}`);

      await this.noteService.deleteNote(note_id);

      console.log(`✅ Note ${note_id} deleted`);

      // 📢 Broadcast to both speech room and note room
      this.server.to(`speech-room-${live_room_id}`).emit('noteDeleted', {
        _id: note_id,
        live_room_id,
        deletedAt: new Date(),
      });

      this.server.to(`note-room-${live_room_id}`).emit('noteDeleted', {
        _id: note_id,
        live_room_id,
        deletedAt: new Date(),
      });

      // ✅ Emit success to client
      client.emit('deleteNoteInRoomSuccess', { note_id });
    } catch (err) {
      console.error('❌ Failed to delete note in room:', err);
      client.emit('deleteNoteInRoomError', {
        error: 'Failed to delete note',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  /**
   * Rename a note in the room (broadcasts to all users)
   */
  @SubscribeMessage('renameNoteInRoom')
  async handleRenameNoteInRoom(
    client: Socket,
    payload: {
      note_id: string;
      new_title: string;
      live_room_id: string;
    },
  ) {
    try {
      const { note_id, new_title, live_room_id } = payload;

      if (!note_id || !new_title || !live_room_id) {
        return client.emit('renameNoteInRoomError', {
          error: 'Missing required fields: note_id, new_title, live_room_id',
        });
      }

      console.log(
        `✏️ Renaming note ${note_id} to "${new_title}" in room ${live_room_id}`,
      );

      const renamedNote = await this.noteService.updateNote(note_id, {
        title: new_title,
      });

      console.log(`✅ Note ${note_id} renamed`);

      // 📢 Broadcast to both speech room and note room
      this.server.to(`speech-room-${live_room_id}`).emit('noteRenamed', {
        _id: renamedNote.note._id,
        title: renamedNote.note.title,
        live_room_id,
        renamedAt: new Date(),
      });

      this.server.to(`note-room-${live_room_id}`).emit('noteRenamed', {
        _id: renamedNote.note._id,
        title: renamedNote.note.title,
        live_room_id,
        renamedAt: new Date(),
      });

      // ✅ Emit success to client
      client.emit('renameNoteInRoomSuccess', {
        _id: renamedNote.note._id,
        title: renamedNote.note.title,
      });
    } catch (err) {
      console.error('❌ Failed to rename note in room:', err);
      client.emit('renameNoteInRoomError', {
        error: 'Failed to rename note',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  // 🏠 ===== ROOM MANAGEMENT =====

  /**
   * Join note room - for receiving real-time note events
   * Client calls this when opening notes panel
   */
  @SubscribeMessage('joinNoteRoom')
  async handleJoinNoteRoom(client: Socket, payload: { live_room_id: string }) {
    const { live_room_id } = payload;

    if (!live_room_id) {
      return client.emit('joinNoteRoomError', {
        error: 'Missing live_room_id',
      });
    }

    try {
      const roomName = `note-room-${live_room_id}`;
      client.join(roomName);

      console.log(`👤 Client ${client.id} joined note room ${roomName}`);

      // ✅ Emit success
      client.emit('joinNoteRoomSuccess', {
        live_room_id,
        message: `Joined note room successfully`,
      });

      // 📢 Broadcast to room that a user joined
      this.server.to(roomName).emit('userJoinedNoteRoom', {
        user_id: client.id,
        live_room_id,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('❌ Failed to join note room:', err);
      client.emit('joinNoteRoomError', {
        error: 'Failed to join note room',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }

  /**
   * Leave note room - when user closes notes panel
   */
  @SubscribeMessage('leaveNoteRoom')
  async handleLeaveNoteRoom(client: Socket, payload: { live_room_id: string }) {
    const { live_room_id } = payload;

    if (!live_room_id) {
      return client.emit('leaveNoteRoomError', {
        error: 'Missing live_room_id',
      });
    }

    try {
      const roomName = `note-room-${live_room_id}`;
      client.leave(roomName);

      console.log(`👋 Client ${client.id} left note room ${roomName}`);

      // ✅ Emit success
      client.emit('leaveNoteRoomSuccess', {
        live_room_id,
        message: `Left note room`,
      });

      // 📢 Broadcast to room that a user left
      this.server.to(roomName).emit('userLeftNoteRoom', {
        user_id: client.id,
        live_room_id,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('❌ Failed to leave note room:', err);
      client.emit('leaveNoteRoomError', {
        error: 'Failed to leave note room',
        message: (err as any)?.message || 'Unknown error',
      });
    }
  }
}
