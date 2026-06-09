import { dreamAgentRequestSchema, agentDreamStateSchema } from "./schema";
import { buildDreamAgentPrompt } from "./prompt";
import { detectUnsafeAgentState, makeSafeFallback } from "./safety";
import type { ModelClient } from "./model-client";
import type { AgentResult, AgentDreamState } from "./types";
import { v4 as uuidv4 } from "uuid";

export async function runDreamAgent(
  input: unknown,
  modelClient: ModelClient
): Promise<AgentResult> {
  const parsedInput = dreamAgentRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: parsedInput.error.errors.map((e) => e.message).join("; "),
    };
  }

  const validInput = parsedInput.data;
  const { system, user } = buildDreamAgentPrompt(validInput);

  let rawResponse: unknown;
  try {
    rawResponse = await modelClient.completeJson({
      system,
      user,
      temperature: 0.7,
    });
  } catch {
    return {
      ok: false,
      code: "AGENT_UNAVAILABLE",
      message: "模型服务暂时不可用，请稍后重试。",
    };
  }

  const parsedResponse = agentDreamStateSchema.safeParse(rawResponse);
  if (!parsedResponse.success) {
    return {
      ok: false,
      code: "AGENT_INVALID_RESPONSE",
      message: parsedResponse.error.errors.map((e) => e.message).join("; "),
    };
  }

  const modelState = parsedResponse.data;
  const safetyFindings = detectUnsafeAgentState(modelState);
  if (safetyFindings.length > 0) {
    const safeState = makeSafeFallback(validInput, safetyFindings.map((f) => f.message).join("; "));
    return {
      ok: true,
      state: safeState,
    };
  }

  const existingFragments = validInput.currentState?.fragments ?? [];
  const newFragment = {
    id: uuidv4(),
    content: validInput.fragment.content,
    inputType: validInput.fragment.inputType,
    createdAt: new Date().toISOString(),
  };

  const normalizedState: AgentDreamState = {
    ...modelState,
    fragments: [...existingFragments, newFragment],
  };

  return {
    ok: true,
    state: normalizedState,
  };
}
