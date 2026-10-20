import { useQuery } from "@tanstack/react-query";
import {
  getDepositsWithdrawalsChart,
  getRecentTransactions,
  getStatisticsList,
  getUserGrowthChart,
} from "./statistics.api";

export const statisticsQueryKeys = {
  all: ["statistics"],
  list: (params = {}) => ["statistics", JSON.stringify(params)],
  userGrowth: () => ["statistics-user-growth"],
  depositsWithdrawals: () => ["statistics-deposits-withdrawals"],
  recentTransactions: (limit = 10) => ["statistics-recent-transactions", limit],
};

export function useStatisticsListQuery(params, options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.list(params),
    queryFn: () => getStatisticsList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useUserGrowthChartQuery(options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.userGrowth(),
    queryFn: () => getUserGrowthChart(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useDepositsWithdrawalsChartQuery(options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.depositsWithdrawals(),
    queryFn: () => getDepositsWithdrawalsChart(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useRecentTransactionsQuery(limit = 10, options = {}) {
  return useQuery({
    queryKey: statisticsQueryKeys.recentTransactions(limit),
    queryFn: () => getRecentTransactions(limit),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
