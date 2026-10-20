import adminApi from "@/api/admin-instancs";

export async function getAdminPlansManagement(params = {}) {
  const searchParams = new URLSearchParams();
  const status = String(params.status || "all").toLowerCase();
  const search = String(params.search || "");

  searchParams.set("status", status);
  searchParams.set("search", search);

  const { data } = await adminApi.get(
    `plans/admin/management?${searchParams.toString()}`,
  );

  return data;
}

export async function createAdminPlan(payload) {
  const { data } = await adminApi.post("plans", payload);
  return data;
}

export async function updateAdminPlan(planId, payload) {
  const { data } = await adminApi.put(`plans/${planId}`, payload);
  return data;
}

export async function deleteAdminPlan(planId) {
  const { data } = await adminApi.delete(`plans/${planId}`);
  return data;
}
