import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { claimReferralMilestone, getreferralList } from "./referral.api";

export const referralQueryKeys = {
  all: ["referral"],
  list: (params = {}) => ["referral", JSON.stringify(params)],
};

export function useReferralListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: referralQueryKeys.list(params),
    queryFn: () => getreferralList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useClaimReferralMilestoneMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => claimReferralMilestone(),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: referralQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["user-info"] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export const usereferralListQuery = useReferralListQuery;
