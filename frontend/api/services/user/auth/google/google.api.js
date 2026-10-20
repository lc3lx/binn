import instance from "@/api/instance";

export async function authenticateWithGoogle(payload) {
  const { data } = await instance.post("auth/google", payload);

  return data;
}
