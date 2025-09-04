import api from "../api";
import type {
  IWorkspace,
  ICreateWorkspaceRequest,
  IUpdateWorkspaceRequest,
  IWorkspaceName,
  IJoinWorkspaceRequest,
  IInviteUserRequest,
  IWorkspaceMemberResponse,
  IUpdateMemberRoleRequest,
  IRemoveMemberRequest,
} from "../../types/workspace.types";

export const workspaceService = {
  async getWorkspacesFromUser(): Promise<IWorkspaceName[]> {
    const response = await api.get("/workspace");
    return response.data;
  },

  async getWorkspaceSummary(id: string): Promise<IWorkspace> {
    const response = await api.get(`/workspace/${id}`);
    return response.data;
  },

  async createWorkspace(
    workspace: ICreateWorkspaceRequest
  ): Promise<IWorkspace> {
    const response = await api.post("/workspace", workspace);
    return response.data;
  },

  async updateWorkspace(
    id: string,
    updates: IUpdateWorkspaceRequest
  ): Promise<IWorkspace> {
    const response = await api.put(`/workspace/${id}`, updates);
    return response.data;
  },

  async deleteWorkspace(id: string): Promise<void> {
    await api.delete(`/workspace/${id}`);
  },

  // Workspace Sharing Methods
  async joinWorkspaceByInviteCode(data: IJoinWorkspaceRequest): Promise<void> {
    await api.post(`/workspace/0/join`, data);
  },

  async inviteUserByEmail(workspaceId: number, data: IInviteUserRequest): Promise<void> {
    await api.post(`/workspace/${workspaceId}/invite`, data);
  },

  async getWorkspaceMembers(workspaceId: number): Promise<IWorkspaceMemberResponse[]> {
    const response = await api.get(`/workspace/${workspaceId}/members`);
    return response.data;
  },

  async updateMemberRole(data: IUpdateMemberRoleRequest): Promise<void> {
    await api.put('/workspace/member/role', data);
  },

  async removeMember(data: IRemoveMemberRequest): Promise<void> {
    await api.delete('/workspace/member', { data });
  },

  async getInviteCode(workspaceId: number): Promise<string> {
    const response = await api.get(`/workspace/${workspaceId}/invite-code`);
    return response.data;
  },

  async regenerateInviteCode(workspaceId: number): Promise<string> {
    const response = await api.post(`/workspace/${workspaceId}/invite-code/regenerate`);
    return response.data;
  },
};
