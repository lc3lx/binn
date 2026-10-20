import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "./info.api";

export const userInfoQueryKeys = {
  all: ["user-info"],
  me: () => ["user-info", "me"],
};

export function useUserInfoQuery(options = {}) {
  return useQuery({
    queryKey: userInfoQueryKeys.me(),
    queryFn: getUserInfo,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
