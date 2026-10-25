import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTodayTaskStatus,
  completeRideTask,
  powerOnScooter,
  collectScooterEarnings,
  collectAllScooters,
} from "./tasks.api";

export const TASK_STATUS_QUERY_KEY = ["user", "tasks", "today-status"];

export function useTodayTaskStatusQuery(options = {}) {
  return useQuery({
    queryKey: TASK_STATUS_QUERY_KEY,
    queryFn: getTodayTaskStatus,
    staleTime: 5 * 1000,
    ...options,
  });
}

export function usePowerOnScooterMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: powerOnScooter,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TASK_STATUS_QUERY_KEY });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useCollectScooterEarningsMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectScooterEarnings,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TASK_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["user", "dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["user", "wallet"] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useCollectAllScootersMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectAllScooters,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TASK_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["user", "dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["user", "wallet"] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useCompleteRideTaskMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeRideTask,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TASK_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["user", "dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["user", "wallet"] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
