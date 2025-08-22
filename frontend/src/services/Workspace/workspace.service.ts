import api from "../api";
import type { 
  IWorkspace, 
  IWorkspacesResponse, 
  ICreateWorkspaceRequest, 
  IUpdateWorkspaceRequest,
  ICategory,
  ICreateCategoryRequest
} from "../../types/workspace.types";

export const workspaceService = {
  async getWorkspaces(): Promise<IWorkspacesResponse> {
    const response = await api.get("/workspaces");
    return response.data;
  },

  async getWorkspaceById(id: string): Promise<IWorkspace> {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  async createWorkspace(workspace: ICreateWorkspaceRequest): Promise<IWorkspace> {
    const response = await api.post("/workspaces", workspace);
    return response.data;
  },

  async updateWorkspace(id: string, updates: IUpdateWorkspaceRequest): Promise<IWorkspace> {
    const response = await api.put(`/workspaces/${id}`, updates);
    return response.data;
  },

  async deleteWorkspace(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`);
  },

  async getWorkspaceCategories(workspaceId: string): Promise<ICategory[]> {
    const response = await api.get(`/workspaces/${workspaceId}/categories`);
    return response.data;
  },

  async createCategory(category: ICreateCategoryRequest): Promise<ICategory> {
    const response = await api.post(`/workspaces/${category.workspaceId}/categories`, {
      name: category.name,
      color: category.color
    });
    return response.data;
  },

  async deleteCategory(workspaceId: string, categoryId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/categories/${categoryId}`);
  }
};