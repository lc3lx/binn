import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActivePlans, subscribeToPlan } from "./plans.api";

export const userPlansQueryKeys = {
  all: ["user-plans"],
  list: (params) => ["user-plans", params],
};

export function useActivePlansQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: userPlansQueryKeys.list(params),
    queryFn: () => getActivePlans(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useSubscribeToPlanMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribeToPlan,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userPlansQueryKeys.all });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
