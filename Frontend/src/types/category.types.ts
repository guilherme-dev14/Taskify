export interface ICategoryResponse {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
}

export interface ICreateCategory {
  name: string;
  description: string;
  workspaceId: string;
}

export interface IUpdateCategory {
  id: string;
  name?: string;
  description?: string;
}
