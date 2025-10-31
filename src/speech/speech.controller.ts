import { Controller, Get, Query } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SpeechMessageDto } from './dto/speech-message.dto';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Get('messages')
  @ApiQuery({ name: 'roomId', required: true, description: 'Room ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit results',
    example: 50,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Skip results',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of speech messages with user data',
    type: [SpeechMessageDto],
  })
  async getMessages(
    @Query('roomId') roomId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    if (!roomId) {
      return { error: 'Missing roomId', data: [] };
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;

    const result = await this.speechService.getMessagesByRoomIdPaginated(
      roomId,
      limitNum,
      skipNum,
    );

    return {
      data: result.data,
      total: result.total,
      limit: limitNum,
      skip: skipNum,
    };
  }
}
