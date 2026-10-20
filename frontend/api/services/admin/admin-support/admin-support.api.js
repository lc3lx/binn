import adminApi from "@/api/admin-instancs";

const BASE_PATH = "support";

export async function getAdminSupportList(params = {}) {
  const searchParams = new URLSearchParams();
  const status = String(params.status || "active").toLowerCase();
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  searchParams.set("status", status);
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  const { data } = await adminApi.get(
    `${BASE_PATH}?${searchParams.toString()}`,
  );

  return {
    counters: data?.counters || { all: 0, open: 0, waiting: 0, closed: 0 },
    results: Number(data?.results || 0),
    data: Array.isArray(data?.data) ? data.data : [],
  };
}

export async function replyToSupportTicket(ticketId, payload) {
  try {
    const { data } = await adminApi.post(
      `${BASE_PATH}/${ticketId}/reply`,
      payload,
    );
    return data;
  } catch (error) {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "");
    const normalizedMessage = message.toLowerCase();
    const isRouteMissing =
      status === 404 ||
      normalizedMessage.includes("can't find this route") ||
      normalizedMessage.includes("cannot find this route");

    if (!isRouteMissing) throw error;
    const fallback = await adminApi.put(
      `${BASE_PATH}/${ticketId}/reply`,
      payload,
    );
    return fallback.data;
  }
}

export async function updateSupportTicketStatus(ticketId, payload) {
  const { data } = await adminApi.put(
    `${BASE_PATH}/${ticketId}/status`,
    payload,
  );
  return data;
}
