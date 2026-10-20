import api from "@/api/instance";

const BASE_PATH = "referrals/me";

export async function getreferralList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

export async function claimReferralMilestone() {
  const { data } = await api.post("referrals/claim-milestone");
  return data;
}
