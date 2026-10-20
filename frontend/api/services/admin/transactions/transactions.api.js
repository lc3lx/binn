import adminApi from "@/api/admin-instancs";

const BASE_PATH = "/wallet/admin/transactions";

export async function getTransactionsList(params = {}) {
  const { data } = await adminApi.get(BASE_PATH, { params });
  return data;
}
