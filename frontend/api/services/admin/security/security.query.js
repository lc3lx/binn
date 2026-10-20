import { useQuery } from "@tanstack/react-query";
import { getSecurityList } from "./security.api";

export const securityQueryKeys = {
  all: ["security"],
  list: (params) => ["security", params],
};

export function useSecurityListQuery(params, options = {}) {
  return useQuery({
    queryKey: securityQueryKeys.list(params),
    queryFn: () => getSecurityList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
