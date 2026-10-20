import adminApi from "@/api/admin-instancs";

export async function getAdminKycRequests(params = {}) {
  const searchParams = new URLSearchParams();
  const status = String(params.status || "all").toLowerCase();
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  searchParams.set("status", status);
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  const { data } = await adminApi.get(
    `users/admin/kyc-requests?${searchParams.toString()}`,
  );

  return data;
}

export async function reviewUserKyc(userId, payload) {
  const { data } = await adminApi.put(`users/kyc/${userId}/review`, payload);
  return data;
}
