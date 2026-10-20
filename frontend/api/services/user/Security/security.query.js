import { useQuery } from "@tanstack/react-query";
import { getsecurityList } from "./security.api";

export const securityQueryKeys = {
  all: ["security"],
  list: (params = {}) => ["security", JSON.stringify(params)],
};

export function useSecurityListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: securityQueryKeys.list(params),
    queryFn: () => getsecurityList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
