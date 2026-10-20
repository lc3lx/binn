import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFaq, deleteFaq, getFaqList, updateFaq } from "./faq.api";

export const faqQueryKeys = {
  all: ["faq"],
  list: (params = {}) => ["faq", JSON.stringify(params)],
};

export function useFaqListQuery(params, options = {}) {
  return useQuery({
    queryKey: faqQueryKeys.list(params),
    queryFn: () => getFaqList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useCreateFaqMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createFaq(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: faqQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useUpdateFaqMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ faqId, payload }) => updateFaq(faqId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: faqQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

export function useDeleteFaqMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faqId) => deleteFaq(faqId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: faqQueryKeys.all });
      options?.onSuccess?.(data, variables);
    },
    ...options,
  });
}

