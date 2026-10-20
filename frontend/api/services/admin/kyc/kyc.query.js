import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminKycRequests, reviewUserKyc } from "./kyc.api";

export const adminKycQueryKeys = {
  all: ["admin-kyc-requests"],
  list: (params) => ["admin-kyc-requests", params],
};

export function useAdminKycRequestsQuery(params, options = {}) {
  return useQuery({
    queryKey: adminKycQueryKeys.list(params),
    queryFn: () => getAdminKycRequests(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useReviewUserKycMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }) => reviewUserKyc(userId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKycQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
