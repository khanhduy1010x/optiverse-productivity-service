import { Injectable, BadRequestException } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { UserDto } from 'src/user-dto/user.dto';
import { NONAME } from 'node:dns';

@Injectable()
export class LivekitTokenService {
  constructor(private readonly configService: ConfigService) {}

  async generateJoinToken(
    roomName: string,
    isAdmin = false,
    user: UserDto,
    isOwner = false,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new BadRequestException('LiveKit credentials missing');
    }

    if (!roomName) {
      throw new BadRequestException('Missing roomName or identity');
    }
    const metadata = JSON.stringify({
      avatarUrl: user.avatar_url,
      isAdmin: isAdmin,
      isOwner: isOwner,
    });
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.userId,
      name: user.fullName,
      metadata: metadata || '',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      roomCreate: isAdmin,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
      hidden: false,
      recorder: false,
    });

    return await at.toJwt();
  }
}
