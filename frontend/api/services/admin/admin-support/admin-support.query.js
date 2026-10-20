import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSupportList,
  replyToSupportTicket,
  updateSupportTicketStatus,
} from "./admin-support.api";

export const admin_supportQueryKeys = {
  all: ["admin-support"],
  list: (params = {}) => ["admin-support", JSON.stringify(params)],
};

export function useAdminSupportListQuery(params, options = {}) {
  return useQuery({
    queryKey: admin_supportQueryKeys.list(params),
    queryFn: () => getAdminSupportList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useReplyToSupportTicketMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }) => replyToSupportTicket(ticketId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: admin_supportQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useUpdateSupportTicketStatusMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }) =>
      updateSupportTicketStatus(ticketId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: admin_supportQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

