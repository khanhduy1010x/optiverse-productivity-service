import { Injectable, BadRequestException } from '@nestjs/common';
import {
  EgressClient,
  EncodedFileType,
  RoomServiceClient,
  GCPUpload,
  EncodedOutputs,
  EncodedFileOutput,
  EgressStatus,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LiveRoomRecord,
  LiveRoomRecordDocument,
  RecordingStatus,
} from './schemas/live-room-record.schema';
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';

interface RecordingSession {
  egressId: string;
  roomId: string;
  startedAt: Date;
  startedBy: string;
}

@Injectable()
export class RecordingService {
  private egressClient: EgressClient;
  private roomServiceClient: RoomServiceClient;

  // 🔸 Lưu tạm session recording trong bộ nhớ
  private sessions: Map<string, RecordingSession> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectModel(LiveRoomRecord.name)
    private readonly liveRoomRecordModel: Model<LiveRoomRecordDocument>,
  ) {
    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL')!;
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY')!;
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET')!;

    if (!liveKitUrl || !apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured');
    }

    this.egressClient = new EgressClient(liveKitUrl, apiKey, apiSecret);
    this.roomServiceClient = new RoomServiceClient(
      liveKitUrl,
      apiKey,
      apiSecret,
    );
  }

  /**
   * Generate a temporary signed URL (5 minutes) for a stored recording record
   */
  async getSignedUrlForRecord(
    recordId: string,
    mode: 'stream' | 'download' = 'stream',
  ): Promise<string> {
    const rec = await this.liveRoomRecordModel.findById(recordId).lean();
    if (!rec) throw new BadRequestException('Record not found');
    const gcpPath = rec.gcp_url;
    if (!gcpPath) throw new BadRequestException('Missing gcp_url');
    if (gcpPath.startsWith('http')) return gcpPath;

    try {
      const keyFile = {
        type: 'service_account',
        project_id: 'optiverse-475807',
        private_key_id: '011008659ccf9b51c00e168847d1113f30812777',
        private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCh3sFDjBDTIgEJ
yB7IkE3cCP2oRv6ilTCohnNSM/dfusQ0d8ZFUozCTKxp+uoZj7yDVJ6c/t+VUvRw
4CWnH2ZkRAgyXGL2sXWVpWI5qwCZvWbSIqBL+sRIq7431OZoOOciGT3N8yl26W+3
+bJCylwCc/A0j6kHZMPq2L2ERS+5J4dnP7gg4JifzEv4cO6UwVRFnylXeWtVMkfK
N5PYeOlTmVHg2jBSFd9uLXLrcjSDdGDfFUYzwEwbGHPAjQNPJfLpN+rKelS9qRwD
78aQqWkQ95Htbz4wRXVzK8guwGeORY7BTZPDf4kqUNtxSYgHD8zaN2/sj59nuFIq
ImURixNJAgMBAAECggEABvjdcdzgbqT/eXM4DDiBpLFzHOKYni/MjZMOTY31IOzz
qDTj1+GN3uKcPIu1C057IVxYNqKYcR9GbcQ3Kvh5xGYqb4zg1bJgF7GCG8Icqlfo
9rJ3cr5a4lcaFYqN4BMEtZ3JC+FmOaZ6tuhs6rPk/FVlFRvTp9YJxZ2kpW6wzF9G
G6fyaYgBNVu6jsGk+vSlYZLk2DeLQ6OLbkQMKO5Qhk51T0S0nK1MWCo2n3yX+C8l
MqQaLM+ZgQwmamINUvGQ5cZey1RLRYhZdinJGWyIr9l88IgSzkJEQhc7hWjTp8HH
OT3HdY4oLg9FngYomthW7LYr8rdPjAJFo6UlZ9osHwKBgQDWWpZ8iEzS0nnVkqwZ
1zfFghtCCdOidugH4DxEPq+RTbVW644CWDpkonu2kR3sKbPOsMwcvdVY5GT6Sr3Q
xjZ7Zw/NcZbnimabd2gAJ9F2J5iUiUcIJGpeVl/l1EKmY6sjf6DRkBLkzgYHm50a
fPjPvc8SOMe21/vNoS5u9xsn3wKBgQDBUcLYpCHrzEzNUwX0Wf6jCwOCqJ5pCe3F
UdKVTBVcQmG1yYnrYCXIQzeYzLqZU2ig5E06uslKfQ/QeSr0tzJhJyQeOIy728Od
Faj1YfBo5LrkW/qQX2dx81J4v5PzzwNojJlNf8YlWJQSs146Jgy7RB7olmtlm5Z1
0hU5eGJJ1wKBgQDMsS7ZdvMds35Cs9CC0KFii27qLiYaE8BZnQkQBmhzsihD+6bd
mFESvpKy8XsIhX4+F1ii7aipPVksJmmCz3VBfFZ70kfPjbuUJH98/okocoFi/oCF
RvkIYyUqfPq0l6LawErbM+DG+/KIG1L383VKNDBkbzJP6Yp8f7mun2wgMwKBgDbV
VxwV6h009K/klbLKeASNEjDUXSJUE6I9ZCq+yuxBU++5O6qMugrErhdkMqVc2DeS
qik3Y/MB6CNsyvdgoySVcpQz3A9I9YIv6522aveFsVEmmbqrpO7YYpMnW/Lyy/ey
saUe0fgz2MQ5Jkf+FOxlFRNJ3yqR6CqBLU4AzHg/AoGAHlujJs+kFXY4q0CiZGS1
HYuN0n77YE7Cmx17VWvwNwryC2pMWo27WavglabmMUjq8JQsa9Ze4mwJDqeRWkoK
fN+IHHJ4yPCgjubmpUZ+aWE/2//xNyQvff4UVtvGEiOQiFxynmKo6yXZhwh4Vwpd
T8oxRWZBd2oScXq/VZpC33k=
-----END PRIVATE KEY-----`,
        client_email: 'optiverse@optiverse-475807.iam.gserviceaccount.com',
        client_id: '110993163056864291652',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/optiverse%40optiverse-475807.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      };

      const storage = new Storage({
        projectId: keyFile.project_id,
        credentials: {
          client_email: keyFile.client_email,
          private_key: keyFile.private_key,
        },
      });

      const bucketName = 'optiverse-recording';
      const file = storage.bucket(bucketName).file(gcpPath);
      const expires = Date.now() + 5 * 60 * 1000;

      const filename = (gcpPath || '').split('/').pop() || recordId;

      const signedUrlOptions: any = {
        version: 'v4',
        action: 'read',
        expires,
      };

      if (mode === 'download') {
        // force browser to download with a sane filename
        signedUrlOptions.responseDisposition = `attachment; filename="${encodeURIComponent(
          filename,
        )}"`;
      } else {
        // for streaming: set inline disposition so audio tag can play it
        signedUrlOptions.responseDisposition = `inline; filename="${encodeURIComponent(
          filename,
        )}"`;
        // optional: ensure content-type is set for audio
        signedUrlOptions.responseType = 'audio/mpeg';
      }

      const [url] = await file.getSignedUrl(signedUrlOptions);

      return url;
    } catch (err) {
      console.error('❌ Failed to create signed URL:', err);
      return gcpPath;
    }
  } /**
   * 🎬 Start recording a room and save session
   */
  async startRecording(
    roomId: string,
    userId: string,
  ): Promise<{ egressId: string; message: string }> {
    if (!roomId) {
      throw new BadRequestException('Invalid room ID');
    }

    try {
      const gcpUpload = new GCPUpload({
        bucket: process.env.GCP_BUCKET!,
        credentials: JSON.stringify({
          type: 'service_account',
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      const encodedFileOutput = new EncodedFileOutput({
        fileType: EncodedFileType.OGG, // ✅ dùng audio-only container
        filepath: `${roomId}-${Date.now()}.ogg`,
        output: {
          case: 'gcp',
          value: gcpUpload,
        },
      });

      const outputs: EncodedOutputs = { file: encodedFileOutput };

      console.log('🎥 Starting recording for room:', roomId);
      const result = await this.egressClient.startRoomCompositeEgress(
        roomId,
        outputs,
        { layout: 'speaker-light', audioOnly: true },
      );

      // 🔸 Lưu session tạm
      this.sessions.set(roomId, {
        egressId: result.egressId,
        roomId,
        startedAt: new Date(),
        startedBy: userId,
      });

      // 💾 Tạo record ngay lập tức với status RECORDING
      const filepath = `${roomId}-${Date.now()}.mp4`;
      const uniqueTitle = await this.generateUniqueTitle();

      try {
        await this.liveRoomRecordModel.create({
          room_id: new Types.ObjectId(roomId),
          egress_id: result.egressId,
          title: uniqueTitle,
          gcp_url: filepath,
          status: RecordingStatus.RECORDING,
          started_at: new Date(),
        });
        console.log(
          `💾 Created LiveRoomRecord for egress ${result.egressId} with title: ${uniqueTitle} and filepath: ${filepath}`,
        );
      } catch (err) {
        console.error('⚠️ Failed to create LiveRoomRecord on start:', err);
        // Don't throw - continue even if DB save fails
      }

      console.log(
        `✅ Recording started for ${roomId}: egressId=${result.egressId}`,
      );

      return {
        egressId: result.egressId,
        message: `Recording started for ${roomId}`,
      };
    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      throw new BadRequestException(
        `Failed to start recording: ${error.message}`,
      );
    }
  }

  /**
   * ⏹ Stop recording by egressId stored in session
   */
  async stopRecording(roomId: string): Promise<{ message: string }> {
    const session = this.sessions.get(roomId);
    if (!session) {
      console.warn(`⚠️ No session found for room ${roomId}, trying listEgress`);
      const egresses = await this.egressClient.listEgress({ roomName: roomId });
      const current = egresses.find(
        (e) => e.status === EgressStatus.EGRESS_ACTIVE,
      );
      if (!current) {
        throw new BadRequestException(`No active recording for ${roomId}`);
      }
      await this.egressClient.stopEgress(current.egressId);
      return { message: `Recording stopped for ${roomId}` };
    }

    try {
      await this.egressClient.stopEgress(session.egressId);
      this.sessions.delete(roomId);

      // 📝 Update recording status to ENDED
      try {
        const updated = await this.liveRoomRecordModel.findOneAndUpdate(
          { egress_id: session.egressId },
          {
            $set: {
              status: RecordingStatus.ENDED,
              ended_at: new Date(),
              updatedAt: new Date(),
            },
          },
          { new: true },
        );
        console.log(
          `✅ Updated recording ${session.egressId} status to ENDED`,
          updated ? '(record found)' : '(record not found)',
        );
      } catch (err) {
        console.error('⚠️ Failed to update recording status:', err);
        // Don't throw - continue even if DB update fails
      }

      console.log(
        `🛑 Recording stopped for ${roomId} (egressId: ${session.egressId})`,
      );
      return { message: `Recording stopped for ${roomId}` };
    } catch (error: any) {
      console.error(`❌ Failed to stop egress ${session.egressId}:`, error);
      throw new BadRequestException(
        `Failed to stop recording: ${error.message}`,
      );
    }
  }

  /**
   * 📊 List all recordings or by room
   */
  async updateRecordingTitle(recordId: string, title: string) {
    // Validate title is unique (excluding current record)
    const existingWithTitle = await this.liveRoomRecordModel.findOne({
      title,
      _id: { $ne: recordId },
    });

    if (existingWithTitle) {
      throw new Error(
        `Title "${title}" is already in use by another recording`,
      );
    }

    const updatedRecord = await this.liveRoomRecordModel.findByIdAndUpdate(
      recordId,
      { $set: { title, updatedAt: new Date() } },
      { new: true },
    );

    if (!updatedRecord) {
      throw new Error('Recording not found');
    }

    return updatedRecord;
  }

  async listRecordingStatus(roomSid: string): Promise<any[]> {
    try {
      const egresses = await this.egressClient.listEgress({
        roomName: roomSid,
      });
      return egresses.map((e) => ({
        id: e.egressId,
        roomName: e.roomName,
        status: e.status,
        error: e.error,
        startedAt: e.startedAt,
        endedAt: e.endedAt,
        updatedAt: e.updatedAt,
      }));
    } catch (error: any) {
      console.error('❌ Failed to list recording status:', error);
      throw new BadRequestException(
        `Failed to list recording status: ${error.message}`,
      );
    }
  }

  /**
   * Summarize a recording using Google Vertex AI Gemini
   */
  async summarizeRecording(
    recordId: string,
    type: number = 1,
    meetingPurpose: string = '',
  ): Promise<string> {
    try {
      // Get record from DB
      const record = await this.liveRoomRecordModel.findById(recordId).lean();
      if (!record) {
        throw new BadRequestException('Record not found');
      }

      const gcpPath = record.gcp_url;
      if (!gcpPath) {
        throw new BadRequestException('Missing gcp_url');
      }

      console.log(
        '🎬 Summarizing recording:',
        recordId,
        'type:',
        type,
        'purpose:',
        meetingPurpose,
      );

      // Initialize Vertex AI
      const vertexAI = new VertexAI({
        project: 'optiverse-475807',
        location: 'us-central1',
        googleAuthOptions: {
          credentials: {
            client_email: 'optiverse@optiverse-475807.iam.gserviceaccount.com',
            private_key:
              '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCh3sFDjBDTIgEJyB7IkE3cCP2oRv6ilTCohnNSM/dfusQ0d8ZFUozCTKxp+uoZj7yDVJ6c/t+VUvRw4CWnH2ZkRAgyXGL2sXWVpWI5qwCZvWbSIqBL+sRIq7431OZoOOciGT3N8yl26W+3+bJCylwCc/A0j6kHZMPq2L2ERS+5J4dnP7gg4JifzEv4cO6UwVRFnylXeWtVMkfKN5PYeOlTmVHg2jBSFd9uLXLrcjSDdGDfFUYzwEwbGHPAjQNPJfLpN+rKelS9qRwD78aQqWkQ95Htbz4wRXVzK8guwGeORY7BTZPDf4kqUNtxSYgHD8zaN2/sj59nuFIqImURixNJAgMBAAECggEABvjdcdzgbqT/eXM4DDiBpLFzHOKYni/MjZMOTY31IOzzqDTj1+GN3uKcPIu1C057IVxYNqKYcR9GbcQ3Kvh5xGYqb4zg1bJgF7GCG8Icqlfo9rJ3cr5a4lcaFYqN4BMEtZ3JC+FmOaZ6tuhs6rPk/FVlFRvTp9YJxZ2kpW6wzF9GG6fyaYgBNVu6jsGk+vSlYZLk2DeLQ6OLbkQMKO5Qhk51T0S0nK1MWCo2n3yX+C8lMqQaLM+ZgQwmamINUvGQ5cZey1RLRYhZdinJGWyIr9l88IgSzkJEQhc7hWjTp8HHOT3HdY4oLg9FngYomthW7LYr8rdPjAJFo6UlZ9osHwKBgQDWWpZ8iEzS0nnVkqwZ1zfFghtCCdOidugH4DxEPq+RTbVW644CWDpkonu2kR3sKbPOsMwcvdVY5GT6Sr3QxjZ7Zw/NcZbnimabd2gAJ9F2J5iUiUcIJGpeVl/l1EKmY6sjf6DRkBLkzgYHm50afPjPvc8SOMe21/vNoS5u9xsn3wKBgQDBUcLYpCHrzEzNUwX0Wf6jCwOCqJ5pCe3FUdKVTBVcQmG1yYnrYCXIQzeYzLqZU2ig5E06uslKfQ/QeSr0tzJhJyQeOIy728OdFaj1YfBo5LrkW/qQX2dx81J4v5PzzwNojJlNf8YlWJQSs146Jgy7RB7olmtlm5Z10hU5eGJJ1wKBgQDMsS7ZdvMds35Cs9CC0KFii27qLiYaE8BZnQkQBmhzsihD+6bdmFESvpKy8XsIhX4+F1ii7aipPVksJmmCz3VBfFZ70kfPjbuUJH98/okocoFi/oCFRvkIYyUqfPq0l6LawErbM+DG+/KIG1L383VKNDBkbzJP6Yp8f7mun2wgMwKBgDbVVxwV6h009K/klbLKeASNEjDUXSJUE6I9ZCq+yuxBU++5O6qMugrErhdkMqVc2DeSqik3Y/MB6CNsyvdgoySVcpQz3A9I9YIv6522aveFsVEmmbqrpO7YYpMnW/Lyy/eysaUe0fgz2MQ5Jkf+FOxlFRNJ3yqR6CqBLU4AzHg/AoGAHlujJs+kFXY4q0CiZGS1HYuN0n77YE7Cmx17VWvwNwryC2pMWo27WavglabmMUjq8JQsa9Ze4mwJDqeRWkoKfN+IHHJ4yPCgjubmpUZ+aWE/2//xNyQvff4UVtvGEiOQiFxynmKo6yXZhwh4VwpdT8oxRWZBd2oScXq/VZpC33k=\n-----END PRIVATE KEY-----\n',
          },
        },
      });

      const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const mimeType = 'audio/ogg';
      const fileUri = 'gs://optiverse-recording/' + gcpPath;

      // Build the prompt based on type
      const prompt = this.buildSummaryPrompt(type, meetingPurpose);

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }, { fileData: { mimeType, fileUri } }],
          },
        ],
      });

      const summary =
        result?.response?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join(' ')
          ?.trim() || 'Không có nội dung tóm tắt.';

      // Clean up unnecessary newlines and replace with proper HTML formatting
      const cleanedSummary = summary
        .replace(/\n\s*\n/g, '') // Remove multiple newlines
        .replace(/\n/g, '<br/>') // Replace single newlines with <br/>
        .replace(/<br\/>\s*(<\/?(h[1-6]|ul|ol|li|p|div))/gi, '$1') // Remove <br/> before block elements
        .replace(/(<\/?(h[1-6]|ul|ol|li|p|div)[^>]*>)\s*<br\/>/gi, '$1') // Remove <br/> after block elements
        .replace(/\s+/g, ' ') // Normalize multiple spaces
        .trim();

      console.log('✅ Summary generated:', cleanedSummary);
      return cleanedSummary;
    } catch (error: any) {
      console.error('❌ Failed to summarize recording:', error);
      throw new BadRequestException(
        `Failed to summarize recording: ${error.message}`,
      );
    }
  }

  /**
   * Build summary prompt based on type and meeting purpose
   */
  private buildSummaryPrompt(type: number, meetingPurpose: string): string {
    // Sanitize meeting purpose to prevent prompt injection
    const sanitizedPurpose = this.sanitizeMeetingPurpose(meetingPurpose);

    const purposeContext = sanitizedPurpose
      ? `\n\nMeeting Context: ${sanitizedPurpose}\nNote: Use the above context only if it's relevant to the meeting content. If not relevant, ignore it completely.`
      : '';

    // Get today's date for fallback
    const todayDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const basePrompts = {
      1: `You are a professional meeting summarization assistant with multilingual capabilities.

**IMPORTANT LANGUAGE INSTRUCTION**: 
- First, analyze the audio to detect the primary language being spoken.
- Generate your response entirely in the SAME language that is predominantly used in the meeting.
- If multiple languages are detected, use the language that represents the majority of the conversation.
- For mixed-language meetings, prioritize the language used for the main business discussion.

Analyze the following meeting audio and create a comprehensive summary.

Return **only clean HTML** (no markdown or code blocks).
DO NOT wrap your response in code blocks or any markdown formatting.
Start directly with HTML tags like <h1>.
Use proper HTML formatting: use <br/> for line breaks, NOT \\n characters.
Keep HTML compact and clean without excessive whitespace.

Include:
- A full overview with objectives, main discussion points, decisions, and action items.
- Clear headings and bullet lists.
- Maintain professional tone and neutrality.

Use this structure (translate all headings and labels to the detected language):
<h1>Meeting Summary</h1>
<p><strong>Date:</strong> [extracted date if available, if no date mentioned use today: ${todayDate}] | <strong>Duration:</strong> [approximate duration]</p>
<h2>Objectives</h2>
<ul><li>...</li></ul>
<h2>Key Discussion Points</h2>
<ul><li>...</li></ul>
<h2>Decisions Made</h2>
<ul><li>...</li></ul>
<h2>Action Items</h2>
<ul><li>[Person] — [Task] — Deadline: [Date if mentioned]</li></ul>
<h2>Follow-up Notes</h2>
<ul><li>...</li></ul>${purposeContext}`,

      2: `You are a meeting summarization assistant specialized in executive briefings with multilingual capabilities.

**IMPORTANT LANGUAGE INSTRUCTION**: 
- First, analyze the audio to detect the primary language being spoken.
- Generate your response entirely in the SAME language that is predominantly used in the meeting.
- If multiple languages are detected, use the language that represents the majority of the conversation.
- For mixed-language meetings, prioritize the language used for the main business discussion.

Analyze the following meeting audio for management review.

Return only clean, minimal HTML suitable for display.
DO NOT wrap your response in code blocks or any markdown formatting.
Start directly with HTML tags like <h1>.
Use proper HTML formatting: use <br/> for line breaks, NOT \\n characters.
Keep HTML compact and clean without excessive whitespace.

Focus on:
- High-level objectives.
- Key insights and business/strategic decisions.
- Remove casual conversation and detailed task lists.
- Keep it short (5–8 key bullet points total).

Structure (translate all headings and labels to the detected language):
<h1>Executive Brief</h1>
<p><strong>Date:</strong> [extracted if available, if no date mentioned use today: ${todayDate}] | <strong>Duration:</strong> [approximate]</p>
<h2>Key Insights</h2>
<ul><li>...</li></ul>
<h2>Strategic Decisions</h2>
<ul><li>...</li></ul>
<h2>Next Steps</h2>
<ul><li>...</li></ul>${purposeContext}`,

      3: `You are a meeting summarization assistant with multilingual capabilities.

**IMPORTANT LANGUAGE INSTRUCTION**: 
- First, analyze the audio to detect the primary language being spoken.
- Generate your response entirely in the SAME language that is predominantly used in the meeting.
- If multiple languages are detected, use the language that represents the majority of the conversation.
- For mixed-language meetings, prioritize the language used for the main business discussion.

Produce a **Discussion Digest** organized by speaker, clearly summarizing what each participant discussed and the final conclusions.

Return only valid, clean HTML.
DO NOT wrap your response in code blocks or any markdown formatting.
Start directly with HTML tags like <h1>.
Use proper HTML formatting: use <br/> for line breaks, NOT \\n characters.
Keep HTML compact and clean without excessive whitespace.

Emphasize:
- Who said what.
- Main arguments or proposals.
- How the discussion evolved.
- Final takeaway or consensus (if any).

Structure (translate all headings and labels to the detected language):
<h1>Discussion Digest</h1>
<p><strong>Date:</strong> [extracted if available, if no date mentioned use today: ${todayDate}] | <strong>Duration:</strong> [approximate]</p>
<h2>Speaker Contributions</h2>
<ul>
  <li><strong>[Speaker A]:</strong> [summary of key points]</li>
  <li><strong>[Speaker B]:</strong> [summary of key points]</li>
  ...
</ul>
<h2>Conclusions</h2>
<ul><li>...</li></ul>${purposeContext}`,

      4: `You are a meeting summarization assistant specialized in generating action-oriented summaries with multilingual capabilities.

**IMPORTANT LANGUAGE INSTRUCTION**: 
- First, analyze the audio to detect the primary language being spoken.
- Generate your response entirely in the SAME language that is predominantly used in the meeting.
- If multiple languages are detected, use the language that represents the majority of the conversation.
- For mixed-language meetings, prioritize the language used for the main business discussion.

Extract and summarize **only actionable items** from the meeting audio.

Return clean HTML compatible for display (no markdown).
DO NOT wrap your response in code blocks or any markdown formatting.
Start directly with HTML tags like <h1>.
Use proper HTML formatting: use <br/> for line breaks, NOT \\n characters.
Keep HTML compact and clean without excessive whitespace.

Focus on:
- Tasks and deliverables.
- Assigned persons.
- Deadlines or timelines.
- Dependencies or blockers.

Structure (translate all headings and labels to the detected language):
<h1>Action-Oriented Summary</h1>
<p><strong>Date:</strong> [extracted if available, if no date mentioned use today: ${todayDate}] | <strong>Duration:</strong> [approximate]</p>
<h2>Action Items</h2>
<ul>
  <li>[Person] — [Task] — Deadline: [Date if mentioned]</li>
  <li>[Person] — [Task] — Deadline: [Date if mentioned]</li>
</ul>
<h2>Dependencies / Notes</h2>
<ul><li>...</li></ul>${purposeContext}`,
    };

    return basePrompts[type as keyof typeof basePrompts] || basePrompts[1];
  }

  /**
   * Sanitize meeting purpose to prevent prompt injection
   */
  private sanitizeMeetingPurpose(purpose: string): string {
    if (!purpose || typeof purpose !== 'string') {
      return '';
    }

    // Remove potential prompt injection patterns
    const cleaned = purpose
      .replace(/system\s*:/gi, '')
      .replace(/assistant\s*:/gi, '')
      .replace(/user\s*:/gi, '')
      .replace(/\[INST\]/gi, '')
      .replace(/\[\/INST\]/gi, '')
      .replace(/###/g, '')
      .replace(/```/g, '')
      .replace(/<\/?script[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();

    // Limit length to prevent abuse
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  }

  /**
   * Generate a unique title for a recording
   */
  private async generateUniqueTitle(): Promise<string> {
    const baseTitle = 'Untitled recording';

    // Check if base title exists
    const existingRecord = await this.liveRoomRecordModel
      .findOne({ title: baseTitle })
      .lean();
    if (!existingRecord) {
      return baseTitle;
    }

    // Find the highest number used
    const records = await this.liveRoomRecordModel
      .find({ title: { $regex: `^${baseTitle}(\\s\\(\\d+\\))?$` } })
      .select('title')
      .lean();

    let maxNumber = 0;
    for (const record of records) {
      const match = record.title.match(/\((\d+)\)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }

    return `${baseTitle} (${maxNumber + 1})`;
  }
}
