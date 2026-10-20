import adminApi from "@/api/admin-instancs";

const BASE_PATH = "wallet/admin/deposits";

export async function getDepositList(params = {}) {
  const normalizedParams = {
    status: String(params.status || "all").toLowerCase(),
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
  };

  const { data } = await adminApi.get(BASE_PATH, { params: normalizedParams });
  return data;
}

export async function reviewDeposit(transactionId, payload) {
  const { data } = await adminApi.put(
    `wallet/deposits/${transactionId}/review`,
    payload,
  );
  return data;
}
