import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShareUserDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(['view', 'edit'])
  @IsNotEmpty()
  permission: string;
}

export class ShareResourceRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShareUserDto)
  users: ShareUserDto[];
}
