import adminApi from "@/api/admin-instancs";
import api from "@/api/instance";

const BASE_PATH = "faq";

// Public getter for FAQs (no auth required)
export async function getFaqList(params = {}) {
  const { data } = await api.get(BASE_PATH, { params });
  return data;
}

// Admin mutations (require admin token)
export async function createFaq(payload) {
  const { data } = await adminApi.post(BASE_PATH, payload);
  return data;
}

export async function updateFaq(faqId, payload) {
  const { data } = await adminApi.put(`${BASE_PATH}/${faqId}`, payload);
  return data;
}

export async function deleteFaq(faqId) {
  const { data } = await adminApi.delete(`${BASE_PATH}/${faqId}`);
  return data;
}
