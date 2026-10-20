import api from "@/api/instance";

const BASE_PATH = "plans";

export async function getActivePlans(params = {}) {
  const normalizedParams = {
    activeOnly: params.activeOnly ?? true,
  };

  const { data } = await api.get(BASE_PATH, { params: normalizedParams });
  return data;
}

export async function subscribeToPlan(planId) {
  if (!planId) {
    throw new Error("planId is required");
  }

  const { data } = await api.post(`${BASE_PATH}/${planId}/subscribe`);
  return data;
}
