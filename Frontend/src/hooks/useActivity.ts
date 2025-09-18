import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activityService,
  type IActivityFilters,
  type IActivityItem,
} from "../services/Activity/activity.service";

export const useActivities = (filters: IActivityFilters = {}) => {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: () => activityService.getActivities(filters),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useRecentActivities = (limit: number = 20) => {
  return useQuery({
    queryKey: ["activities", "recent", limit],
    queryFn: () => activityService.getRecentActivities(limit),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2,
  });
};

export const useUserActivities = (
  userId: number,
  filters: IActivityFilters = {}
) => {
  return useQuery({
    queryKey: ["activities", "user", userId, filters],
    queryFn: () => activityService.getUserActivities(userId, filters),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useWorkspaceActivities = (
  workspaceId: number,
  filters: IActivityFilters = {}
) => {
  return useQuery({
    queryKey: ["activities", "workspace", workspaceId, filters],
    queryFn: () => activityService.getWorkspaceActivities(workspaceId, filters),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useActivityStats = (
  filters: {
    startDate?: string;
    endDate?: string;
    workspaceId?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ["activities", "stats", filters],
    queryFn: () => activityService.getActivityStats(filters),
    staleTime: 1000 * 60 * 10,
  });
};

export const useClearUserActivities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activityService.clearUserActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useActivityUpdates = (
  onNewActivity?: (activity: IActivityItem) => void
) => {
  const queryClient = useQueryClient();

  const addActivity = (newActivity: IActivityItem) => {
    queryClient.setQueryData(
      ["activities", "recent"],
      (oldData: IActivityItem[] | undefined) => {
        if (!oldData) return [newActivity];
        return [newActivity, ...oldData.slice(0, 19)];
      }
    );

    onNewActivity?.(newActivity);

    queryClient.invalidateQueries({ queryKey: ["activities"] });
  };

  return { addActivity };
};
