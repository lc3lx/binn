import adminApi from "@/api/admin-instancs";

const BASE_PATH = "admin/dashboard/overview";

export async function getStatisticsList(params = {}) {
  const { data } = await adminApi.get(BASE_PATH, { params });
  return data;
}

export async function getUserGrowthChart() {
  const { data } = await adminApi.get("admin/dashboard/charts/user-growth");
  return data;
}

export async function getDepositsWithdrawalsChart() {
  const { data } = await adminApi.get(
    "admin/dashboard/charts/deposits-withdrawals",
  );
  return data;
}

export async function getRecentTransactions(limit = 10) {
  const { data } = await adminApi.get("admin/dashboard/recent-transactions", {
    params: { limit },
  });
  return data;
}
