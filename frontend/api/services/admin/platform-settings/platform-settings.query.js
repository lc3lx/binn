import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "./platform-settings.api";

export const platformSettingsQueryKeys = {
  all: ["platform-settings"],
  details: () => ["platform-settings", "details"],
};

export function usePlatformSettingsQuery(options = {}) {
  return useQuery({
    queryKey: platformSettingsQueryKeys.details(),
    queryFn: getPlatformSettings,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useUpdatePlatformSettingsMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updatePlatformSettings(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: platformSettingsQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}
