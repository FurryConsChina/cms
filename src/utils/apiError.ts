import { isAxiosError } from "axios";

export function apiErrorMessage(error: unknown, fallback = "操作失败，请稍后重试") {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
