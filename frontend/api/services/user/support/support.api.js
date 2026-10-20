import axios from "axios";
import { BASE_URL } from "@/api/config";
import api from "@/api/instance";

const unauthApi = axios.create({
  baseURL: BASE_URL,
});

export async function createSupportTicket(payload) {
  const { subject, message } = payload || {};
  const { data } = await api.post("support", { subject, message });
  return data;
}

export async function getMySupportTickets() {
  const { data } = await api.get("support/me");
  return data;
}

export async function sendSupportMessage(ticketId, payload) {
  const id = encodeURIComponent(String(ticketId || "").trim());
  const message = String(payload?.message || "").trim();
  const endpoint = `support/me/${id}/message`;

  try {
    const { data } = await api.put(endpoint, { message });
    return data;
  } catch (error) {
    const statusCode = error?.response?.status;
    const errorMessage = String(error?.response?.data?.message || "");

    if (statusCode === 404 || errorMessage.includes("Can't find this route")) {
      const { data } = await api.put(endpoint, { message });
      return data;
    }

    throw error;
  }
}
