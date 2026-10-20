import api from "@/api/instance";

const BASE_PATH = "wallet/me/transactions";

export async function gettransactionsList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}
