import type {
  ICategoryResponse,
  ICreateCategory,
  IUpdateCategory,
} from "../../types/category.types";
import api from "../api";

export const categoryService = {
  async createCategory(data: ICreateCategory): Promise<ICategoryResponse> {
    const response = await api.post("/category", data);
    return response.data;
  },

  async getCategoryById(categoryId: string): Promise<ICategoryResponse> {
    const response = await api.get(`/category/${categoryId}`);
    return response.data;
  },

  async getAllCategoriesFromWorkspace(
    workspaceId: string
  ): Promise<ICategoryResponse[]> {
    const response = await api.get(`/category/workspace/${workspaceId}`);
    return response.data;
  },

  async deleteCategory(categoryId: string) {
    const response = await api.delete(`/category/${categoryId}`);
    return response.data;
  },

  async updateCategory(
    data: IUpdateCategory
  ): Promise<ICategoryResponse> {
    const response = await api.put("/category", data);
    return response.data;
  },
};
