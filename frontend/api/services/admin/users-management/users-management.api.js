import adminApi from "@/api/admin-instancs";

export async function getAdminUsers(params = {}) {
  const searchParams = new URLSearchParams();
  const status = params.status?.toLowerCase();
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  if (status && status !== "all") {
    searchParams.set("status", status);
  }

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  const query = searchParams.toString();
  const { data } = await adminApi.get(`users/admin/list?${query}`);

  return data;
}

export async function getAdminUserDetails(userId) {
  const { data } = await adminApi.get(`users/admin/${userId}/details`);

  return data;
}

export async function blockUserByAdmin(userId) {
  const { data } = await adminApi.patch(`users/admin/${userId}/block`);
  return data;
}

export async function unblockUserByAdmin(userId) {
  const { data } = await adminApi.patch(`users/admin/${userId}/unblock`);
  return data;
}

export async function adjustUserWalletByAdmin(userId, payload) {
  const { data } = await adminApi.post(
    `users/admin/${userId}/wallet-adjust`,
    payload,
  );
  return data;
}
