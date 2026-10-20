import adminApi from "@/api/admin-instancs";
import api from "@/api/instance";

const BASE_PATH = "platform-settings";

export async function getPlatformSettings() {
  const { data } = await api.get(BASE_PATH);
  return data;
}

export async function updatePlatformSettings(payload) {
  const { data } = await adminApi.put(BASE_PATH, payload);
  return data;
}
