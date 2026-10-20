import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeAdminProfilePassword,
  getAdminProfile,
  updateAdminProfile,
} from "./profile.api";

export const profileQueryKeys = {
  all: ["admin-profile"],
  details: () => ["admin-profile", "details"],
};

export function useAdminProfileQuery(options = {}) {
  return useQuery({
    queryKey: profileQueryKeys.details(),
    queryFn: getAdminProfile,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useUpdateAdminProfileMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateAdminProfile(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useChangeAdminProfilePasswordMutation(options = {}) {
  return useMutation({
    mutationFn: (payload) => changeAdminProfilePassword(payload),
    ...options,
  });
}
