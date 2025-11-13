export interface UserDetailDto {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  status: string;
  time: Date;
  permissions?: string[]; // Combined workspace and note permissions of this specific member
}

export interface WorkspaceDetailDto {
  name: string;
  description?: string;
  invite_code: string;
  hasPassword: boolean;
  permissions?: string[]; // Add permissions to member information
  owner_id: string; // ID of workspace owner for frontend role detection
  role?: 'owner' | 'admin' | 'member' | null; // Role of the requesting user
  members: {
    active: UserDetailDto[];
    request: UserDetailDto[];
    invite: UserDetailDto[];
    banned: UserDetailDto[];
  };
}
