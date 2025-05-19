import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskTag, TaskTagSchema } from './task-tag.schema';
import { TaskTagController } from './task-tag.controller';
import { TaskTagService } from './task-tag.service';
import { TaskTagRepository } from './task-tag.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: TaskTag.name, schema: TaskTagSchema }])],
  controllers: [TaskTagController],
  providers: [TaskTagService, TaskTagRepository],
  exports: [TaskTagService],
})
export class TaskTagModule {}
