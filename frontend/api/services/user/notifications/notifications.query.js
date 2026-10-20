import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notifications.api";

export const notificationsQueryKeys = {
  all: ["user-notifications"],
  my: (params = {}) => ["user-notifications", "me", JSON.stringify(params)],
};

export function useMyNotificationsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: notificationsQueryKeys.my(params),
    queryFn: () => getMyNotifications(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useMarkNotificationAsReadMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useMarkAllNotificationsAsReadMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
