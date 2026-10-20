import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWithdrawList,
  markWithdrawalAsPaid,
  notifyWithdrawalUser,
  reviewWithdrawal,
} from "./withdraw.api";

export const withdrawQueryKeys = {
  all: ["withdraw"],
  list: (params) => ["withdraw", params],
};

export function useWithdrawListQuery(params, options = {}) {
  return useQuery({
    queryKey: withdrawQueryKeys.list(params),
    queryFn: () => getWithdrawList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useReviewWithdrawalMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, payload }) =>
      reviewWithdrawal(transactionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: withdrawQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useMarkWithdrawalAsPaidMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId) => markWithdrawalAsPaid(transactionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: withdrawQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useNotifyWithdrawalUserMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, payload }) =>
      notifyWithdrawalUser(transactionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: withdrawQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
