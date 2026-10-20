import api from "@/api/instance";

const BASE_PATH = "users/getMe";

export async function getUserInfo() {
  const { data } = await api.get(BASE_PATH);
  return data;
}
