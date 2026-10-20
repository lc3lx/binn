import { useMutation } from "@tanstack/react-query";
import { submitUserKyc } from "./kyc.api";

export function useSubmitUserKycMutation(options = {}) {
  return useMutation({
    mutationFn: submitUserKyc,
    ...options,
  });
}
