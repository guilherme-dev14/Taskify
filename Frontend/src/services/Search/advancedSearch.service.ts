import api from "../api";
import type { ITask, ITasksResponse } from "../../types/task.types";

export interface IAdvancedSearchFilters {
  searchTerm?: string;
  workspaceIds?: number[];
  statuses?: ITask["status"][];
  priorities?: ITask["priority"][];
  assignedToIds?: number[];
  categoryIds?: number[];
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  hasAttachments?: boolean;
  isOverdue?: boolean;
  hasSubtasks?: boolean;
}

export const advancedSearchService = {
  async search(
    filters: IAdvancedSearchFilters,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortDir: "asc" | "desc" = "desc"
  ): Promise<ITasksResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await api.post(`/tasks/search?${params.toString()}`, filters);
    return response.data;
  },
};