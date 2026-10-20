import instance from "@/api/instance";

export async function forgotPassword(payload) {
  const { data } = await instance.post("auth/forgotPassword", payload);
  return data;
}

export async function verifyResetCode(payload) {
  const { data } = await instance.post("auth/verifyResetCode", payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await instance.patch("auth/resetPassword", payload);
  return data;
}
