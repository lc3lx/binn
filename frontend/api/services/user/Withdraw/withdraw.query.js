import { useMutation, useQuery } from "@tanstack/react-query";
import { getwithdrawList, requestWithdraw } from "./withdraw.api";

export const withdrawQueryKeys = {
  all: ["withdraw"],
  list: (params = {}) => ["withdraw", JSON.stringify(params)],
};

export function useWithdrawListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: withdrawQueryKeys.list(params),
    queryFn: () => getwithdrawList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useRequestWithdrawMutation(options = {}) {
  return useMutation({
    mutationFn: requestWithdraw,
    ...options,
  });
}
