import { Injectable } from '@nestjs/common';
import { SpeechRepository } from './speech.repository';
import { SpeechMessage } from '../focus-room/schemas/live-room-speech-message.schema';
import { UserHttpClient } from '../http-axios/user-http.client';
import { SpeechMessageDto } from './dto/speech-message.dto';

@Injectable()
export class SpeechService {
  constructor(
    private readonly speechRepository: SpeechRepository,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  async getMessagesByRoomId(roomId: string): Promise<SpeechMessageDto[]> {
    const messages = await this.speechRepository.getMessagesByRoomId(roomId);
    return await this.enrichMessagesWithUserData(messages);
  }

  async getMessagesByRoomIdPaginated(
    roomId: string,
    limit?: number,
    skip?: number,
  ): Promise<{ data: SpeechMessageDto[]; total: number }> {
    const result = await this.speechRepository.getMessagesByRoomIdPaginated(
      roomId,
      limit,
      skip,
    );
    const enrichedData = await this.enrichMessagesWithUserData(result.data);
    return {
      data: enrichedData,
      total: result.total,
    };
  }

  private async enrichMessagesWithUserData(
    messages: SpeechMessage[],
  ): Promise<SpeechMessageDto[]> {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Extract unique user IDs
    const userIds = Array.from(
      new Set(
        messages
          .map((msg: any) => msg.user_id?.toString?.() || msg.user_id)
          .filter(Boolean),
      ),
    ) as string[];

    // Fetch user data
    let userMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const users = await this.userHttpClient.getUsersByIds(userIds);
        userMap = new Map(users.map((u) => [u.user_id, u]));
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    }

    // Enrich messages with user data
    return messages.map((msg: any) => {
      const userId = msg.user_id?.toString?.() || msg.user_id;
      const user = userMap.get(userId);

      return {
        _id: msg._id,
        room_id: msg.room_id,
        user_id: msg.user_id,
        speaker_name: user?.full_name || msg.speaker_name,
        text: msg.text,
        createdAt: msg.createdAt,
        avatar_url: user?.avatar_url,
        user_email: user?.email,
      } as SpeechMessageDto;
    });
  }
}
