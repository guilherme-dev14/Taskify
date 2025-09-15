import api from "../api";

export interface IChecklistItem {
  id: number;
  text: string;
  completed: boolean;
  orderIndex: number;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate?: string;
}

export interface IAddChecklistItemRequest {
  text: string;
}

export const checklistService = {
  getTaskChecklistItems: async (taskId: string): Promise<IChecklistItem[]> => {
    const response = await api.get(`/checklist-items/task/${taskId}`);
    return response.data;
  },

  addChecklistItem: async (
    taskId: string,
    request: IAddChecklistItemRequest
  ): Promise<IChecklistItem> => {
    const response = await api.post(`/checklist-items/task/${taskId}`, request);
    return response.data;
  },

  toggleChecklistItem: async (itemId: number): Promise<IChecklistItem> => {
    const response = await api.put(`/checklist-items/${itemId}/toggle`);
    return response.data;
  },

  deleteChecklistItem: async (itemId: number): Promise<void> => {
    await api.delete(`/checklist-items/${itemId}`);
  },
};