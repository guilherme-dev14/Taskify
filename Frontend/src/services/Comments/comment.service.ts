import api from "../api";

export interface IComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  task: {
    id: string;
    title: string;
  };
  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ICreateCommentRequest {
  content: string;
}

export interface IUpdateCommentRequest {
  content: string;
}

export interface ICommentsResponse {
  content: IComment[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const commentService = {
  async createComment(
    taskId: string,
    data: ICreateCommentRequest
  ): Promise<IComment> {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  async getComments(taskId: string): Promise<IComment[]> {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async getCommentsPaginated(
    taskId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDir: "asc" | "desc" = "desc"
  ): Promise<ICommentsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await api.get(
      `/tasks/${taskId}/comments/paginated?${params.toString()}`
    );
    return response.data;
  },

  async updateComment(
    taskId: string,
    commentId: string,
    data: IUpdateCommentRequest
  ): Promise<IComment> {
    const response = await api.put(
      `/tasks/${taskId}/comments/${commentId}`,
      data
    );
    return response.data;
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};