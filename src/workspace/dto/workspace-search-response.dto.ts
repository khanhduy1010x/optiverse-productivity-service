import { ApiProperty } from '@nestjs/swagger';

export class OwnerInfoDto {
  @ApiProperty({ description: 'Owner user ID' })
  user_id: string;

  @ApiProperty({ description: 'Owner email' })
  email: string;

  @ApiProperty({ description: 'Owner full name' })
  full_name: string;

  @ApiProperty({ description: 'Owner avatar URL', required: false })
  avatar_url?: string;
}

export class WorkspaceSearchDto {
  @ApiProperty({ description: 'Workspace ID' })
  id: string;

  @ApiProperty({ description: 'Workspace name' })
  name: string;

  @ApiProperty({ description: 'Workspace description', required: false })
  description?: string;

  @ApiProperty({ description: 'Whether workspace has password protection' })
  hasPassword: boolean;

  @ApiProperty({ description: 'Number of members in workspace' })
  memberCount: number;

  @ApiProperty({
    description: 'Workspace owner information',
    type: OwnerInfoDto,
  })
  owner: OwnerInfoDto;

  @ApiProperty({
    description: 'User status in relation to this workspace',
    enum: [
      'none',
      'member',
      'pending_request',
      'pending_invitation',
      'banned',
      'owner',
    ],
    required: false,
  })
  userStatus?:
    | 'none'
    | 'member'
    | 'pending_request'
    | 'pending_invitation'
    | 'banned'
    | 'owner';
}

export class WorkspaceSearchResponseDto {
  @ApiProperty({ description: 'Found workspace', type: WorkspaceSearchDto })
  workspace: WorkspaceSearchDto;
}
