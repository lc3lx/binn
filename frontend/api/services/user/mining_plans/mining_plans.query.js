import { useQuery } from "@tanstack/react-query";
import { getmining_plansList, getMyPlanSubscriptions } from "./mining_plans.api";

export const mining_plansQueryKeys = {
  all: ["mining_plans"],
  list: (params = {}) => ["mining_plans", JSON.stringify(params)],
  mySubscriptions: () => ["mining_plans", "my-subscriptions"],
};

export function useMiningPlansListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: mining_plansQueryKeys.list(params),
    queryFn: () => getmining_plansList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useMyPlanSubscriptionsQuery(options = {}) {
  return useQuery({
    queryKey: mining_plansQueryKeys.mySubscriptions(),
    queryFn: () => getMyPlanSubscriptions(),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
