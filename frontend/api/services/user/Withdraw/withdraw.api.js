import api from "@/api/instance";

const BASE_PATH = "";

export async function getwithdrawList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

export async function requestWithdraw(payload) {
  const { data } = await api.post("wallet/withdraw/request", payload);
  return data;
}
