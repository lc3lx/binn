import api from "@/api/instance";

const BASE_PATH = "tasks";

export async function getTodayTaskStatus() {
  const { data } = await api.get(`${BASE_PATH}/today-status`);
  return data;
}

export async function completeRideTask() {
  const { data } = await api.post(`${BASE_PATH}/complete-ride`);
  return data;
}

export async function powerOnScooter(scooterId) {
  const { data } = await api.post(`${BASE_PATH}/power-on`, { scooterId });
  return data;
}

export async function collectScooterEarnings(scooterId) {
  const { data } = await api.post(`${BASE_PATH}/collect`, { scooterId });
  return data;
}

export async function collectAllScooters() {
  const { data } = await api.post(`${BASE_PATH}/collect-all`);
  return data;
}
