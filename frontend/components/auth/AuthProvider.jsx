"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, {
  getUserRole,
  getUserToken,
  removeAuthUserCookie,
  setAuthUserCookie,
} from "@/api/instance";
import {
  canAccessUserDashboard,
  getJoinPlanRequirement,
  getKycStatus,
  isKycVerified,
  normalizeAuthUser,
} from "@/lib/auth-user";

const AuthContext = createContext(null);

export default function AuthProvider({ children, initialUser = null }) {
  const [user, setUserState] = useState(() => normalizeAuthUser(initialUser));

  const setAuthUser = useCallback((nextUser) => {
    const normalizedUser = normalizeAuthUser(nextUser);

    setUserState(normalizedUser);

    if (normalizedUser) {
      setAuthUserCookie(normalizedUser);
      return;
    }

    removeAuthUserCookie();
  }, []);

  const clearAuthUser = useCallback(() => {
    setUserState(null);
    removeAuthUserCookie();
  }, []);

  useEffect(() => {
    let ignore = false;

    const token = getUserToken();
    const role = String(getUserRole() || "").toLowerCase();

    if (!token || role === "admin") {
      return undefined;
    }

    const refreshAuthUser = async () => {
      try {
        const response = await api.get("users/getMe");
        const resolvedUser =
          response?.data?.data?.user ||
          response?.data?.user ||
          response?.data?.data ||
          response?.data;
        const normalizedUser = normalizeAuthUser(resolvedUser);

        if (!normalizedUser || ignore) {
          return;
        }

        setUserState(normalizedUser);
        setAuthUserCookie(normalizedUser);
      } catch (error) {
        const blocked = error?.response?.status === 403;
        if (blocked && !ignore) {
          clearAuthUser();
        }
      }
    };

    refreshAuthUser();

    return () => {
      ignore = true;
    };
  }, [clearAuthUser]);

  useEffect(() => {
    const status = getKycStatus(user);
    const verified = isKycVerified(user);

    console.log(
      `[Auth] account_verification=${verified ? "verified" : "not_verified"} | kycStatus=${status}`,
    );
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      kycStatus: getKycStatus(user),
      joinPlanRequirement: getJoinPlanRequirement(user),
      canAccessUserDashboard: canAccessUserDashboard(user),
      setAuthUser,
      clearAuthUser,
    }),
    [clearAuthUser, setAuthUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
