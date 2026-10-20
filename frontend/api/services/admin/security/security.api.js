import adminApi from "@/api/admin-instancs";

const BASE_PATH = "";

export async function getSecurityList(params = {}) {
  const { data } = await adminApi.get(BASE_PATH, { params });
  return data;
}
