import instance from "@/api/instance";

export async function signUpUser(payload) {
  const { data } = await instance.post("auth/signup", payload);

  return data;
}
