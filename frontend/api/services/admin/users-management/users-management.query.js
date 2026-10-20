import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustUserWalletByAdmin,
  blockUserByAdmin,
  getAdminUserDetails,
  getAdminUsers,
  unblockUserByAdmin,
} from "./users-management.api";

export const adminUsersQueryKeys = {
  all: ["admin-users"],
  list: (params) => ["admin-users", params],
  detail: (userId) => ["admin-users", "detail", userId],
};

export function useAdminUsersQuery(params, options = {}) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(params),
    queryFn: () => getAdminUsers(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useAdminUserDetailsQuery(userId, options = {}) {
  return useQuery({
    queryKey: adminUsersQueryKeys.detail(userId),
    queryFn: () => getAdminUserDetails(userId),
    enabled: Boolean(userId) && (options.enabled ?? true),
    ...options,
  });
}

export function useToggleUserBlockMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, blocked }) => {
      if (blocked) {
        return unblockUserByAdmin(userId);
      }
      return blockUserByAdmin(userId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminUsersQueryKeys.detail(variables.userId),
      });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useAdjustUserWalletMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }) => adjustUserWalletByAdmin(userId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminUsersQueryKeys.detail(variables.userId),
      });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
