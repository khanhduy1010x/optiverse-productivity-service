import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Request ID to ban user from join request',
    required: false,
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiProperty({
    description: 'User ID to ban directly',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
//This is comment to  last commit history
