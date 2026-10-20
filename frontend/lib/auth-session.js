import { setAuthSession } from "@/api/instance";
import { pickAuthUser } from "@/lib/auth-user";

export function applyAuthResponse(response, setAuthUser) {
  const authUser = pickAuthUser(response);

  if (response?.token) {
    setAuthSession({
      token: response.token,
      role: authUser?.role ?? response?.data?.role,
      user: authUser,
    });
  }

  if (authUser) {
    setAuthUser?.(authUser);
  }

  return authUser;
}
