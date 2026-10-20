import api from "@/api/instance";

const BASE_PATH = "";

export async function getstatisticsList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

export async function getRecentActivity(limit = 10) {
  const { data } = await api.get("dashboard/recent-activity", {
    params: { limit },
  });
  return data;
}

export async function getDashboardSummary() {
  const { data } = await api.get("dashboard/summary");
  return data;
}

export async function getHashrateSeries(days = 14) {
  const params =
    typeof days === "number" && days > 0 ? { days } : undefined;
  const { data } = await api.get("dashboard/hashrate-series", { params });
  return data;
}

export async function getAllocation() {
  const { data } = await api.get("dashboard/allocation");
  return data;
}
