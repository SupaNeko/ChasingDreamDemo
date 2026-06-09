export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DREAMER_NOT_FOUND"
  | "DATABASE_ERROR"
  | "AGENT_UNAVAILABLE"
  | "AGENT_INVALID_RESPONSE";

export function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number
): Response {
  return Response.json({ error: { code, message } }, { status });
}
