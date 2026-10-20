import adminInstance from "@/api/admin-instancs";

export async function adminLoginUser(payload) {
  const { data } = await adminInstance.post("auth/login", payload);

  return data;
}
