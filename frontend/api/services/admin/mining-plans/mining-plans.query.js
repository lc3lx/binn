import { useQuery } from "@tanstack/react-query";
import { getMiningPlansList } from "./mining-plans.api";

export const mining_plansQueryKeys = {
  all: ["mining-plans"],
  list: (params) => ["mining-plans", params],
};

export function useMiningPlansListQuery(params, options = {}) {
  return useQuery({
    queryKey: mining_plansQueryKeys.list(params),
    queryFn: () => getMiningPlansList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
