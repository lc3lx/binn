import { useQuery } from "@tanstack/react-query";
import {
  getReferralGrowthChart,
  getReferralOverview,
  getTopReferrers,
} from "./referral.api";

export const referralQueryKeys = {
  all: ["admin-referrals"],
  overview: () => ["admin-referrals", "overview"],
  growthChart: () => ["admin-referrals", "growth-chart"],
  topReferrers: (limit = 20) => ["admin-referrals", "top-referrers", limit],
};

export function useReferralOverviewQuery(options = {}) {
  return useQuery({
    queryKey: referralQueryKeys.overview(),
    queryFn: getReferralOverview,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useReferralGrowthChartQuery(options = {}) {
  return useQuery({
    queryKey: referralQueryKeys.growthChart(),
    queryFn: getReferralGrowthChart,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useTopReferrersQuery(limit = 20, options = {}) {
  return useQuery({
    queryKey: referralQueryKeys.topReferrers(limit),
    queryFn: () => getTopReferrers(limit),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
