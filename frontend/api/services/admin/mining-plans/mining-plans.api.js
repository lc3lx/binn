import adminApi from "@/api/admin-instancs";

const BASE_PATH = "";

export async function getMiningPlansList(params = {}) {
  const { data } = await adminApi.get(BASE_PATH, { params });
  return data;
}
