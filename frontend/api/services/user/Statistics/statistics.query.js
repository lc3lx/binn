import { useQuery } from "@tanstack/react-query";
import {
  getAllocation,
  getDashboardSummary,
  getHashrateSeries,
  getRecentActivity,
  getstatisticsList,
} from "./statistics.api";

export const statisticsQueryKeys = {
  all: ["statistics"],
  list: (params = {}) => ["statistics", JSON.stringify(params)],
  recentActivity: (limit = 10) => ["statistics", "recent-activity", limit],
  dashboardSummary: () => ["statistics", "dashboard-summary"],
  hashrateSeries: (days) => ["statistics", "hashrate-series", days ?? "all"],
  allocation: () => ["statistics", "allocation"],
};

export function useStatisticsListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.list(params),
    queryFn: () => getstatisticsList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useRecentActivityQuery(limit = 10, options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.recentActivity(limit),
    queryFn: () => getRecentActivity(limit),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useDashboardSummaryQuery(options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.dashboardSummary(),
    queryFn: () => getDashboardSummary(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useHashrateSeriesQuery(days, options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.hashrateSeries(days),
    queryFn: () => getHashrateSeries(days),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useAllocationQuery(options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.allocation(),
    queryFn: () => getAllocation(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
