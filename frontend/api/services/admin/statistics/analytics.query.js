import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsOverview,
  getDailyEarnings,
  getDepositsWithdrawalsChart,
  getPlanDistribution,
  getUserActivityHourly,
} from "./analytics.api";

export const analyticsQueryKeys = {
  all: ["analytics"],
  overview: (params) => ["analytics-overview", params],
  dailyEarnings: (days) => ["analytics-daily-earnings", Number(days) || 7],
  userActivityHourly: () => ["analytics-user-activity-hourly"],
  depositsWithdrawals: () => ["analytics-deposits-withdrawals"],
  planDistribution: () => ["analytics-plan-distribution"],
};

export function useAnalyticsOverviewQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: analyticsQueryKeys.overview(params),
    queryFn: () => getAnalyticsOverview(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useDailyEarningsQuery(days = 7, options = {}) {
  return useQuery({
    queryKey: analyticsQueryKeys.dailyEarnings(days),
    queryFn: () => getDailyEarnings(days),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useUserActivityHourlyQuery(options = {}) {
  return useQuery({
    queryKey: analyticsQueryKeys.userActivityHourly(),
    queryFn: () => getUserActivityHourly(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useDepositsWithdrawalsChartQuery(options = {}) {
  return useQuery({
    queryKey: analyticsQueryKeys.depositsWithdrawals(),
    queryFn: () => getDepositsWithdrawalsChart(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function usePlanDistributionQuery(options = {}) {
  return useQuery({
    queryKey: analyticsQueryKeys.planDistribution(),
    queryFn: () => getPlanDistribution(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
