import api from "@/api/instance";

const BASE_PATH = "notifications";

export async function getMyNotifications(params = {}) {
  const { data } = await api.get(`${BASE_PATH}/me`, { params });
  return data;
}

export async function markNotificationAsRead(notificationId) {
  const { data } = await api.put(`${BASE_PATH}/me/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.put(`${BASE_PATH}/me/read-all`);
  return data;
}
