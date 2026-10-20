import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPaymentOrder,
  getPaymentOrderStatus,
  getdepositList,
  requestDeposit,
  verifyPaymentTx,
} from "./deposit.api";

export const depositQueryKeys = {
  all: ["deposit"],
  list: (params = {}) => ["deposit", JSON.stringify(params)],
  orderStatus: (orderId) => ["deposit-order-status", orderId],
};

export function useDepositListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: depositQueryKeys.list(params),
    queryFn: () => getdepositList(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export const usedepositListQuery = useDepositListQuery;

export function useRequestDepositMutation(options = {}) {
  return useMutation({
    mutationFn: requestDeposit,
    ...options,
  });
}

export function useCreatePaymentOrderMutation(options = {}) {
  return useMutation({
    mutationFn: createPaymentOrder,
    ...options,
  });
}

export function usePaymentOrderStatusQuery(orderId, options = {}) {
  return useQuery({
    queryKey: depositQueryKeys.orderStatus(orderId),
    queryFn: () => getPaymentOrderStatus(orderId),
    enabled: Boolean(orderId),
    ...options,
  });
}

export function useVerifyPaymentTxMutation(options = {}) {
  return useMutation({
    mutationFn: verifyPaymentTx,
    ...options,
  });
}
