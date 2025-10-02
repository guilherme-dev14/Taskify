/* eslint-disable @typescript-eslint/no-explicit-any */
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
  IWorkspaceInvitation,
  IInvitationResponse,
} from "../../types/workspace.types";
import { categoryService } from "../Category/category.service";
import type { ITaskStatus } from "../../types/task.types";
export interface IWorkspacesResponse {
  content: IWorkspaceName[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const workspaceService = {
  async getWorkspacesFromUser(
    page: number = 0,
    size: number = 6
  ): Promise<IWorkspacesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await api.get(`/workspace?${params.toString()}`);
    return response.data;
  },

  async getWorkspaceSummary(id: string): Promise<IWorkspace> {
    const response = await api.get(`/workspace/${id}`);
    return response.data;
  },

  async getWorkspacesFromUserList(): Promise<IWorkspaceName[]> {
    const response = await api.get("/workspace/list");
    return response.data;
  },

  async createWorkspace(
    workspace: ICreateWorkspaceRequest
  ): Promise<IWorkspace> {
    const response = await api.post("/workspace", workspace);
    return response.data;
  },

  async updateWorkspace(updates: IUpdateWorkspaceRequest): Promise<IWorkspace> {
    const response = await api.put(`/workspace`, updates);
    return response.data;
  },

  async deleteWorkspace(id: string): Promise<void> {
    try {
      console.log(`Attempting to delete workspace with ID: ${id}`);

      try {
        const response = await api.delete(`/workspace/${id}`);
        console.log(`Successfully deleted workspace ${id}:`, response.status);
        return;
      } catch (firstError: any) {
        if (firstError.response?.status === 500) {
          console.log(
            `Delete failed with 500, might be due to categories. Trying to clean up categories first...`
          );

          try {
            const categories =
              await categoryService.getAllCategoriesFromWorkspace(id);
            console.log(
              `Found ${categories.length} categories to delete before workspace deletion`
            );

            for (const category of categories) {
              try {
                await categoryService.deleteCategory(category.id.toString());
                console.log(
                  `Deleted category ${category.id}: ${category.name}`
                );
              } catch (catError) {
                console.warn(
                  `Failed to delete category ${category.id}:`,
                  catError
                );
              }
            }

            const response = await api.delete(`/workspace/${id}`);
            console.log(
              `Successfully deleted workspace ${id} after cleaning up categories:`,
              response.status
            );
            return;
          } catch (cleanupError) {
            console.warn(
              `Category cleanup failed, throwing original error:`,
              cleanupError
            );
          }
        }

        throw firstError;
      }
    } catch (error: any) {
      console.error(`Failed to delete workspace ${id}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
  },

  async joinWorkspaceByInviteCode(data: IJoinWorkspaceRequest): Promise<void> {
    await api.post(`/workspace/join`, data);
  },

  async inviteUserByUsername(
    workspaceId: number,
    data: IInviteUserRequest
  ): Promise<void> {
    await api.post(`/workspace/${workspaceId}/inviteUsername`, data);
  },

  async inviteUserByEmail(
    workspaceId: number,
    data: IInviteUserRequest
  ): Promise<void> {
    await api.post(`/workspace/${workspaceId}/invite`, data);
  },

  async getWorkspaceMembers(
    workspaceId: number
  ): Promise<IWorkspaceMemberResponse[]> {
    const response = await api.get(`/workspace/${workspaceId}/members`);
    return response.data;
  },
  async getWorkspaceStatuses(
    workspaceId: string | number
  ): Promise<ITaskStatus[]> {
    const response = await api.get(`/workspaces/${workspaceId}/statuses`);
    return response.data;
  },
  async updateMemberRole(data: IUpdateMemberRoleRequest): Promise<void> {
    await api.put("/workspace/member/role", data);
  },

  async removeMember(data: IRemoveMemberRequest): Promise<void> {
    await api.delete("/workspace/member", { data });
  },

  async getInviteCode(workspaceId: number): Promise<string> {
    const response = await api.get(`/workspace/${workspaceId}/invite-code`);
    return response.data;
  },

  async regenerateInviteCode(workspaceId: number): Promise<string> {
    const response = await api.post(
      `/workspace/${workspaceId}/invite-code/regenerate`
    );
    return response.data;
  },

  async getPendingInvitations(): Promise<IWorkspaceInvitation[]> {
    const response = await api.get("/workspace/invitations/pending");
    return response.data;
  },

  async respondToInvitation(data: IInvitationResponse): Promise<void> {
    await api.post("/workspace/invitations/respond", data);
  },
};
