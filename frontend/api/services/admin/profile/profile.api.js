import adminApi from "@/api/admin-instancs";

const BASE_PATH = "admin/profile";

export async function getAdminProfile() {
  const { data } = await adminApi.get(BASE_PATH);
  return data;
}

export async function updateAdminProfile(payload) {
  const { data } = await adminApi.put(BASE_PATH, payload);
  return data;
}

export async function changeAdminProfilePassword(payload) {
  const { data } = await adminApi.put(`${BASE_PATH}/change-password`, payload);
  return data;
}
