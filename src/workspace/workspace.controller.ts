import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JoinWorkspaceDto } from './dto/join-workspace.dto';
import { JoinWorkspaceWithPasswordDto } from './dto/join-workspace-with-password.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InviteMultipleUsersDto } from './dto/invite-multiple-users.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { UpdateMemberRoleDto as NewUpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto';
import { ManageMemberPermissionsDto } from './dto/manage-member-permissions.dto';
import { WorkspaceDetailDto } from './dto/workspace-detail.dto';
import { JoinRequestResponseDto } from './dto/join-request-response.dto';
import { WorkspaceSearchResponseDto } from './dto/workspace-search-response.dto';
import {
  UpdateMemberRoleDto,
  UpdateMemberStatusDto,
} from './dto/update-member.dto';
import { Workspace } from './workspace.schema';
import { WorkspaceMember } from './workspace-member.schema';
import { WorkspaceJoinRequest } from './workspace-join-request.schema';
import { ApiResponse } from 'src/common/api-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/user-dto/user.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';

@ApiTags('workspace')
@ApiBearerAuth('access-token')
@Controller('/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ========== Workspace Endpoints ==========
  @Post('')
  async createWorkspace(
    @Request() req,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<ApiResponse<Workspace>> {
    const user = req.userInfo as UserDto;
    console.log('Creating workspace for user:', createWorkspaceDto.memberIds);
    console.log('Creating workspace for user:', user.userId);
    console.log('User membership info:', req.userInfo?.membership);
    const workspace = await this.workspaceService.createWorkspace(
      user.userId,
      createWorkspaceDto,
      user,
    );
    return new ApiResponse<Workspace>(workspace);
  }

  @Get('creation-limits')
  async getWorkspaceLimits(@Request() req): Promise<
    ApiResponse<{
      current: number;
      max: number;
      canCreateMore: boolean;
      membershipLevel: string;
      packageName?: string;
    }>
  > {
    const user = req.userInfo as UserDto;
    const limits = await this.workspaceService.getWorkspaceLimits(user);
    return new ApiResponse(limits);
  }

  @Get('my-workspaces')
  async getMyWorkspaces(@Request() req): Promise<
    ApiResponse<{
      owner_workspace: Array<{
        role: string;
        status: string;
        joined_at: Date;
        locked: boolean;
        workspace: any;
      }>;
      member_workspace: Array<{
        role: string;
        status: string;
        joined_at: Date;
        locked: boolean;
        workspace: any;
      }>;
    }>
  > {
    const user = req.userInfo as UserDto;
    const workspaces = await this.workspaceService.getMyWorkspaces(user.userId);
    return new ApiResponse<{
      owner_workspace: Array<{
        role: string;
        status: string;
        joined_at: Date;
        locked: boolean;
        workspace: any;
      }>;
      member_workspace: Array<{
        role: string;
        status: string;
        joined_at: Date;
        locked: boolean;
        workspace: any;
      }>;
    }>(workspaces);
  }

  @Get('my-requests')
  async getMyRequests(
    @Request() req,
  ): Promise<ApiResponse<JoinRequestResponseDto[]>> {
    const user = req.userInfo as UserDto;
    const requests = await this.workspaceService.getMyRequests(user.userId);
    return new ApiResponse<JoinRequestResponseDto[]>(requests);
  }

  @Get('my-invitations')
  async getMyInvitations(@Request() req): Promise<ApiResponse<any>> {
    console.log('🟩 Controller called');
    try {
      const user = req.userInfo;
      console.log('🟦 user:', user);
      const invitations = await this.workspaceService.getMyInvitations(
        user.userId,
      );
      console.log('🟨 Invitations found:', invitations.length);
      return new ApiResponse(invitations);
    } catch (err) {
      console.error('❌ Controller caught error:', err);
      throw err;
    }
  }

  @Get('search/:inviteCode')
  async searchWorkspaceByInviteCode(
    @Request() req,
    @Param('inviteCode') inviteCode: string,
  ): Promise<ApiResponse<WorkspaceSearchResponseDto>> {
    const user = req.userInfo as UserDto;
    const workspace = await this.workspaceService.searchWorkspaceByInviteCode(
      inviteCode,
      user.userId,
    );
    return new ApiResponse<WorkspaceSearchResponseDto>(workspace);
  }

  @Get(':id')
  async getWorkspaceById(
    @Request() req,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<WorkspaceDetailDto>> {
    const user = req.userInfo as UserDto;
    const workspaceDetail = await this.workspaceService.getWorkspaceDetail(
      workspaceId,
      user.userId,
    );
    return new ApiResponse<WorkspaceDetailDto>(workspaceDetail);
  }

  @Get(':id/members')
  async getWorkspaceMembers(
    @Request() req,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<WorkspaceMember[]>> {
    const user = req.userInfo as UserDto;
    // Ensure the requester has access to view members
    const hasAccess = await this.workspaceService.verifyUserAccess(
      workspaceId,
      user.userId,
    );
    if (!hasAccess) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const members =
      await this.workspaceService.getWorkspaceMembers(workspaceId);
    return new ApiResponse<WorkspaceMember[]>(members);
  }

  @Get(':id/basic')
  async getWorkspaceBasicInfo(
    @Request() req,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<Workspace>> {
    const user = req.userInfo as UserDto;
    const workspace = await this.workspaceService.getWorkspaceBasicInfo(
      workspaceId,
      user.userId,
    );
    return new ApiResponse<Workspace>(workspace);
  }

  @Get(':id/verify-access')
  async verifyWorkspaceAccess(
    @Request() req,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<{ hasAccess: boolean }>> {
    const user = req.userInfo as UserDto;
    const hasAccess = await this.workspaceService.verifyUserAccess(
      workspaceId,
      user.userId,
    );
    return new ApiResponse<{ hasAccess: boolean }>({ hasAccess });
  }

  @Put(':id')
  async updateWorkspace(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<ApiResponse<Workspace>> {
    const user = req.userInfo as UserDto;
    const workspace = await this.workspaceService.updateWorkspace(
      workspaceId,
      user.userId,
      updateWorkspaceDto,
    );
    return new ApiResponse<Workspace>(workspace);
  }

  @Post(':id/leave')
  async leaveWorkspace(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: { newOwnerId?: string },
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.leaveWorkspace(
      workspaceId,
      user.userId,
      body.newOwnerId,
    );
    return new ApiResponse<void>();
  }

  @Delete(':id')
  async deleteWorkspace(
    @Request() req,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.deleteWorkspace(workspaceId, user.userId);
    return new ApiResponse<void>();
  }

  // ========== Join Request Endpoints ==========
  @Post('join-with-request')
  async requestJoinWorkspace(
    @Request() req,
    @Body() joinWorkspaceDto: JoinWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceJoinRequest>> {
    const user = req.userInfo as UserDto;
    const request = await this.workspaceService.requestJoinWorkspace(
      user.userId,
      joinWorkspaceDto,
    );
    return new ApiResponse<WorkspaceJoinRequest>(request);
  }

  @Delete('join-requests/:requestId')
  async cancelJoinRequest(
    @Request() req,
    @Param('requestId') requestId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.cancelJoinRequest(user.userId, requestId);
    return new ApiResponse<void>();
  }

  @Post('invitations/:requestId/accept')
  async acceptInvitation(
    @Request() req,
    @Param('requestId') requestId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.acceptInvitation(user.userId, requestId);
    return new ApiResponse<void>();
  }

  @Post('invitations/:requestId/reject')
  async rejectInvitation(
    @Request() req,
    @Param('requestId') requestId: string,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.rejectInvitation(user.userId, requestId);
    return new ApiResponse<void>();
  }

  @Post(':id/join-requests/approve')
  async approveJoinRequest(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: { userId: string },
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.approveJoinRequest(
      workspaceId,
      user.userId,
      body.userId,
    );
    return new ApiResponse<void>();
  }

  @Post(':id/join-requests/reject')
  async rejectJoinRequest(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: { userId: string },
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.rejectJoinRequest(
      workspaceId,
      user.userId,
      body.userId,
    );
    return new ApiResponse<void>();
  }

  @Post('join-with-password')
  async joinWorkspaceWithPassword(
    @Request() req,
    @Body() joinDto: JoinWorkspaceWithPasswordDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.joinWorkspaceWithPassword(user.userId, joinDto);
    return new ApiResponse<void>();
  }

  @Post(':id/ban-user')
  async banUser(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: BanUserDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.banUser(
      workspaceId,
      user.userId,
      body.requestId,
      body.userId,
    );
    return new ApiResponse<void>();
  }

  @Post(':id/unban-user')
  async unbanUser(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: UnbanUserDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.unbanUser(
      workspaceId,
      user.userId,
      body.userId,
      body.action,
    );
    return new ApiResponse<void>();
  }

  @Post(':id/update-member-role')
  async updateMemberRole(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: NewUpdateMemberRoleDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.updateMemberRole(
      workspaceId,
      user.userId,
      body.userId,
      body.role,
    );
    return new ApiResponse<void>();
  }

  @Post(':id/update-member-permissions')
  async updateMemberPermissions(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: UpdateMemberPermissionsDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.updateMemberPermissions(
      workspaceId,
      user.userId,
      body.userId,
      body.permissions,
    );
    return new ApiResponse<void>();
  }

  @Post(':id/manage-member-permissions')
  async manageMemberPermissions(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: ManageMemberPermissionsDto,
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    console.log('Managing permissions for user:', body.userId);
    await this.workspaceService.manageMemberPermissions(
      workspaceId,
      user.userId,
      body.userId,
      body.permissions,
      body.action || 'set',
    );
    return new ApiResponse<void>();
  }

  @Post(':id/remove-member')
  async removeMember(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: { userId: string },
  ): Promise<ApiResponse<void>> {
    const user = req.userInfo as UserDto;
    await this.workspaceService.removeMemberFromWorkspace(
      workspaceId,
      user.userId,
      body.userId,
    );
    return new ApiResponse<void>();
  }

  @Post('public/lock-workspaces/:userId')
  async lockUserWorkspacesExceptFirst(@Param('userId') userId: string): Promise<
    ApiResponse<{
      total: number;
      locked: number;
      preserved: { workspaceId: string; workspaceName: string };
    }>
  > {
    const result =
      await this.workspaceService.lockUserWorkspacesExceptFirst(userId);
    return new ApiResponse(result);
  }

  @Post(':id/invite-multiple-users')
  async inviteMultipleUsers(
    @Request() req,
    @Param('id') workspaceId: string,
    @Body() body: InviteMultipleUsersDto,
  ): Promise<
    ApiResponse<{
      successful: Array<{ email: string; requestId: string }>;
      failed: Array<{ email: string; reason: string }>;
      summary: { total: number; successful: number; failed: number };
    }>
  > {
    const user = req.userInfo as UserDto;
    const result = await this.workspaceService.inviteMultipleUsersToWorkspace(
      workspaceId,
      user.userId,
      body.userIds,
      body.message,
    );
    return new ApiResponse(result);
  }
}
