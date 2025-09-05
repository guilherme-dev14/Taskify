import { useQuery } from "@tanstack/react-query";
import {
  analyticsService,
  type IAnalyticsFilters,
} from "../services/Analytics/analytics.service";

export const useProductivityMetrics = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "productivity", filters],
    queryFn: () => analyticsService.getProductivityMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });
};

export const useAnalyticsOverview = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => analyticsService.getAnalyticsOverview(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
};

export const useDistributionData = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "distribution", filters],
    queryFn: () => analyticsService.getDistributionData(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
};

// Combined hook for dashboard analytics
export const useDashboardAnalytics = (filters: IAnalyticsFilters = {}) => {
  const productivityMetrics = useProductivityMetrics(filters);
  const analyticsOverview = useAnalyticsOverview(filters);
  const distribution = useDistributionData(filters);
  return {
    productivityMetrics,
    analyticsOverview,
    distribution,
    isLoading:
      productivityMetrics.isLoading ||
      analyticsOverview.isLoading ||
      distribution.isLoading,
    isError:
      productivityMetrics.isError ||
      analyticsOverview.isError ||
      distribution.isError,
    refetchAll: () => {
      productivityMetrics.refetch();
      analyticsOverview.refetch();
      distribution.refetch();
    },
  };
};
