import adminApi from "@/api/admin-instancs";

export async function getAnalyticsOverview(params = {}) {
  const { data } = await adminApi.get(`admin/dashboard/analytics/overview`);
  return data;
}

export async function getDailyEarnings(days = 7) {
  const normalizedDays = Number(days) || 7;
  const { data } = await adminApi.get(
    `admin/dashboard/analytics/daily-earnings?days=${normalizedDays}`,
  );
  return data;
}

export async function getUserActivityHourly() {
  const { data } = await adminApi.get(
    "admin/dashboard/analytics/user-activity-hourly",
  );
  return data;
}

export async function getDepositsWithdrawalsChart() {
  const { data } = await adminApi.get(
    "admin/dashboard/charts/deposits-withdrawals",
  );
  return data;
}

export async function getPlanDistribution() {
  const { data } = await adminApi.get(
    "admin/dashboard/analytics/plan-distribution",
  );
  return data;
}
