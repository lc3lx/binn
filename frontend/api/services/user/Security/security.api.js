import api from "@/api/instance";

const BASE_PATH = "";

export async function getsecurityList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}
