import api from "@/api/instance";

const BASE_PATH = "users/kyc/submit";

export async function submitUserKyc({
  frontImage,
  backImage,
  fullName,
  nationalNumber,
}) {
  const formData = new FormData();

  if (frontImage) {
    formData.append("frontImage", frontImage);
  }

  if (backImage) {
    formData.append("backImage", backImage);
  }

  if (fullName) {
    formData.append("fullName", fullName);
  }

  if (nationalNumber) {
    formData.append("nationalNumber", nationalNumber);
  }

  const { data } = await api.put(BASE_PATH, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
