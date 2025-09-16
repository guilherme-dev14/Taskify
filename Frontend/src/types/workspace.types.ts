export interface IWorkspace {
  name: string;
  description: string;
  inviteCode: string;
  createdAt: string;
  ownerName: string;
  memberCount: number;
  taskCount: number;
}

export interface IWorkspaceName {
  id: number | string;
  name: string;
}

export interface IWorkspaceMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface IWorkspaceMemberResponse {
  id: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  isOwner: boolean;
}

export interface ICreateWorkspaceRequest {
  name: string;
  description: string;
}

export interface IUpdateWorkspaceRequest {
  id: number;
  name?: string;
  description?: string;
}

export interface ICreateCategoryRequest {
  name: string;
  workspaceId: string;
}

export interface IJoinWorkspaceRequest {
  inviteCode: string;
}

export interface IInviteUserRequest {
  username: string;
  role: "ADMIN" | "MEMBER";
}

export interface IUpdateMemberRoleRequest {
  workspaceId: number;
  userId: number;
  newRole: "OWNER" | "ADMIN" | "MEMBER";
}

export interface IRemoveMemberRequest {
  workspaceId: number;
  userId: number;
}
