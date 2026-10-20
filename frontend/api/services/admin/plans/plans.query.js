import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminPlan,
  deleteAdminPlan,
  getAdminPlansManagement,
  updateAdminPlan,
} from "./plans.api";

export const adminPlansQueryKeys = {
  all: ["admin-plans-management"],
  list: (params) => ["admin-plans-management", params],
};

export function useAdminPlansManagementQuery(params, options = {}) {
  return useQuery({
    queryKey: adminPlansQueryKeys.list(params),
    queryFn: () => getAdminPlansManagement(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useCreateAdminPlanMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createAdminPlan(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useUpdateAdminPlanMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, payload }) => updateAdminPlan(planId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useDeleteAdminPlanMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId }) => deleteAdminPlan(planId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
