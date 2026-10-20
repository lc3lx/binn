import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupportTicket,
  getMySupportTickets,
  sendSupportMessage,
} from "./support.api";

export const supportQueryKeys = {
  all: ["support"],
  myTickets: () => ["support", "me"],
};

export function useMySupportTicketsQuery(options = {}) {
  return useQuery({
    queryKey: supportQueryKeys.myTickets(),
    queryFn: getMySupportTickets,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useCreateSupportTicketMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useSendSupportMessageMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }) =>
      sendSupportMessage(ticketId, { message }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
