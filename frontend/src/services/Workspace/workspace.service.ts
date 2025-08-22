import api from "../api";
import type {
  IWorkspace,
  ICreateWorkspaceRequest,
  IUpdateWorkspaceRequest,
  IWorkspaceName,
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
};
