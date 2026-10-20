import instance from "@/api/instance";

export async function loginUser(payload) {
  const { data } = await instance.post("auth/login", payload);

  return data;
}
