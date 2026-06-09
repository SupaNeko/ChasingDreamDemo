import { runDreamAgent } from "@/server/agent/service";
import { createModelClient } from "@/server/agent/model-client";
import { jsonError } from "@/server/api/errors";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "请求体必须是有效的 JSON", 400);
  }

  const modelClient = createModelClient({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  });

  const result = await runDreamAgent(body, modelClient);

  if (result.ok) {
    return Response.json({ state: result.state });
  }

  const statusMap: Record<string, number> = {
    AGENT_UNAVAILABLE: 502,
    AGENT_INVALID_RESPONSE: 502,
    VALIDATION_ERROR: 400,
  };

  const status = statusMap[result.code] ?? 500;
  return jsonError(result.code, result.message, status);
}
