import { useQuery } from "@tanstack/react-query";
import {
  analyticsService,
  type IAnalyticsFilters,
} from "../services/Analytics/analytics.service";

export const useProductivityMetrics = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "productivity", filters],
    queryFn: () => analyticsService.getProductivityMetrics(filters),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 15,
  });
};

export const useAnalyticsOverview = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => analyticsService.getAnalyticsOverview(filters),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  });
};

export const useDistributionData = (filters: IAnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "distribution", filters],
    queryFn: () => analyticsService.getDistributionData(filters),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  });
};

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
