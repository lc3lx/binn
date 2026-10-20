import api from "@/api/instance";

const BASE_PATH = "";

export async function getmining_plansList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

export async function getMyPlanSubscriptions() {
  const { data } = await api.get("plans/me/subscriptions");
  return data;
}
