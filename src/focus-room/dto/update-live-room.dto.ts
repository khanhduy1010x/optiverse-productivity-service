import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AccessType } from '../schemas/live-room.schema';

export class UpdateLiveRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AccessType)
  access_type?: AccessType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  new_password?: string;

  @IsOptional()
  @IsString()
  old_password?: string;

  @IsOptional()
  remove_password?: boolean;
}
