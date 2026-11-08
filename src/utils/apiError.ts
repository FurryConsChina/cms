import { isAxiosError } from "axios";

const genericErrorCodes = new Set([
  "E_BAD_REQUEST",
  "E_UNAUTHORIZED",
  "E_FORBIDDEN",
  "E_NOT_FOUND",
  "E_CONFLICT",
  "E_VALIDATION",
  "E_PAYLOAD_TOO_LARGE",
  "E_UNSUPPORTED_MEDIA_TYPE",
  "E_TOO_MANY_REQUESTS",
  "E_INTERNAL",
  "E_SERVICE_UNAVAILABLE",
]);

type ApiErrorResponse = {
  message?: unknown;
  code?: unknown;
  errors?: unknown;
};

function errorText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function apiErrorMessage(error: unknown, fallback = "操作失败，请稍后重试") {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    const messages = [errorText(data?.message)];

    if (error.response?.status === 422 && Array.isArray(data?.errors)) {
      const issues: unknown[] = data.errors;
      for (const issue of issues) {
        if (!issue || typeof issue !== "object" || !("message" in issue)) continue;
        const message = errorText(issue.message);
        if (!message) continue;
        const field = "field" in issue ? errorText(issue.field) : "";
        messages.push(field ? `${field}：${message}` : message);
      }
    }

    const message = [...new Set(messages.filter(Boolean))].join("；") || fallback;
    const code = errorText(data?.code);
    return /^E_[A-Z0-9_]+$/.test(code) && !genericErrorCodes.has(code)
      ? `${message}（${code}）`
      : message;
  }
  return error instanceof Error ? error.message || fallback : fallback;
}
