export const DEFAULT_KYC_STATUS = "approved";

export function normalizeAuthUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    email: user.email ?? "",
    kycStatus: "approved",
    authProvider: user.authProvider ?? "local",
    role: user.role ?? "user",
    active: Boolean(user.active),
    walletBalance: user.walletBalance ?? 0,
    currentPlan: {
      status: user.currentPlan?.status ?? "none",
    },
  };
}

export function pickAuthUser(payload) {
  return normalizeAuthUser(payload?.data?.user || payload?.user || payload?.data);
}

export function parseStoredAuthUser(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return normalizeAuthUser(value);
  }

  try {
    return normalizeAuthUser(JSON.parse(value));
  } catch {
    try {
      return normalizeAuthUser(JSON.parse(decodeURIComponent(value)));
    } catch {
      return null;
    }
  }
}

export function getKycStatus(user) {
  return "approved";
}

export function isKycVerified(user) {
  return true;
}

export function canAccessUserDashboard(user) {
  const normalizedUser = normalizeAuthUser(user);
  return (
    Boolean(normalizedUser) &&
    normalizedUser.role === "user"
  );
}

export function hasActivePlan(user) {
  const normalizedUser = normalizeAuthUser(user);
  const planStatus = String(normalizedUser?.currentPlan?.status ?? "none")
    .trim()
    .toLowerCase();

  return ["active", "running", "subscribed"].includes(planStatus);
}

export function getJoinPlanRequirement(user) {
  const normalizedUser = normalizeAuthUser(user);

  if (!normalizedUser) {
    return "login";
  }

  if (hasActivePlan(normalizedUser)) {
    return "already_subscribed";
  }

  return "allow";
}
