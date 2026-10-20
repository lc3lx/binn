import api from "@/api/instance";

const BASE_PATH = "";

export async function getdepositList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

export async function requestDeposit(payload) {
  const { data } = await api.post("wallet/deposit/request", payload);
  return data;
}

export async function createPaymentOrder(payload) {
  const { data } = await api.post("payments/create-order", payload);
  return data;
}

export async function getPaymentOrderStatus(orderId) {
  if (!orderId) {
    throw new Error("orderId is required");
  }

  const { data } = await api.get(`payments/order-status/${orderId}`);
  return data;
}

export async function verifyPaymentTx(payload) {
  const { data } = await api.post("payments/verify-tx", payload);
  return data;
}
