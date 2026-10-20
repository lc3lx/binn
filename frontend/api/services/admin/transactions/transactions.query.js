import { useQuery } from "@tanstack/react-query";
import { getTransactionsList } from "./transactions.api";

export const transactionsQueryKeys = {
  all: ["transactions"],
  list: (params) => ["transactions", params],
};

export function useTransactionsListQuery(params, options = {}) {
  return useQuery({
    queryKey: transactionsQueryKeys.list(params),
    queryFn: () => getTransactionsList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
