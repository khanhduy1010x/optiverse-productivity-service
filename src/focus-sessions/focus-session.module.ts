import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FocusSession, FocusSessionSchema } from './focus-session.schema';
import { FocusSessionController } from './focus-session.controller';
import { FocusSessionService } from './focus-session.service';
import { FocusSessionRepository } from './focus-session.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: FocusSession.name, schema: FocusSessionSchema }])],
  controllers: [FocusSessionController],
  providers: [FocusSessionService, FocusSessionRepository],
  exports: [FocusSessionService],
})
export class FocusSessionModule {}
