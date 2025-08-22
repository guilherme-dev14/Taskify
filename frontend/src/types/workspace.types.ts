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
  id: string;
  name: string;
}

export interface IWorkspaceMember {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface ICreateWorkspaceRequest {
  name: string;
  description: string;
}

export interface IUpdateWorkspaceRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface ICreateCategoryRequest {
  name: string;
  workspaceId: string;
}

export interface IWorkspacesResponse {
  workspaces: IWorkspace[];
  total: number;
}
