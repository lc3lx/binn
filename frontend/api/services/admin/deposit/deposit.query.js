import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDepositList, reviewDeposit } from "./deposit.api";

export const depositQueryKeys = {
  all: ["admin-deposit"],
  list: (params) => ["admin-deposit", params],
};

export function useDepositListQuery(params, options = {}) {
  return useQuery({
    queryKey: depositQueryKeys.list(params),
    queryFn: () => getDepositList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useReviewDepositMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, payload }) =>
      reviewDeposit(transactionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: depositQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
