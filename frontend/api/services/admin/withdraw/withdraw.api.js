import adminApi from "@/api/admin-instancs";

const BASE_PATH = "wallet/admin/withdrawals";

export async function getWithdrawList(params = {}) {
  const normalizedParams = {
    status: String(params.status || "all").toLowerCase(),
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
  };

  const { data } = await adminApi.get(BASE_PATH, { params: normalizedParams });
  return data;
}

export async function reviewWithdrawal(transactionId, payload) {
  const { data } = await adminApi.put(
    `wallet/transactions/${transactionId}/review`,
    payload,
  );
  return data;
}

export async function markWithdrawalAsPaid(transactionId) {
  const { data } = await adminApi.put(
    `wallet/transactions/${transactionId}/mark-paid`,
  );
  return data;
}

export async function notifyWithdrawalUser(transactionId, payload) {
  const { data } = await adminApi.post(
    `wallet/transactions/${transactionId}/notify-user`,
    payload,
  );
  return data;
}
