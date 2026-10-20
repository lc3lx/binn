import { useQuery } from "@tanstack/react-query";
import { gettransactionsList } from "./transactions.api";

export const transactionsQueryKeys = {
  all: ["transactions"],
  list: (params = {}) => ["transactions", JSON.stringify(params)],
};

export function useTransactionsListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: transactionsQueryKeys.list(params),
    queryFn: () => gettransactionsList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export const usetransactionsListQuery = useTransactionsListQuery;
