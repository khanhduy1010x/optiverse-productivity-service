export class UserInfoDto {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export class WorkspaceInfoDto {
  id: string;
  name: string;
  description: string;
  hasPassword: boolean;
  memberCount: number;
  owner: UserInfoDto | null;
}

export class JoinRequestResponseDto {
  requestId: string;
  type: 'invite' | 'request';
  message?: string;
  createdAt: Date;
  workspace: WorkspaceInfoDto;
  requester: UserInfoDto | null;
}
