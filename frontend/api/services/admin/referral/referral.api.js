import adminApi from "@/api/admin-instancs";

const BASE_PATH = "referrals/admin";

export async function getReferralOverview() {
  const { data } = await adminApi.get(`${BASE_PATH}/overview`);
  return data;
}

export async function getReferralGrowthChart() {
  const { data } = await adminApi.get(`${BASE_PATH}/growth-chart`);
  return data;
}

export async function getTopReferrers(limit = 20) {
  const { data } = await adminApi.get(`${BASE_PATH}/top-referrers`, {
    params: { limit },
  });
  return data;
}
