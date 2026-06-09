import { describe, it, expect } from "vitest";
import { runDreamAgent } from "../service";
import type { ModelClient } from "../model-client";
import type { AgentDreamState } from "../schema";

describe("runDreamAgent", () => {
  const validModelOutput: AgentDreamState = {
    title: "蓝黑色的桥",
    story: "你站在一座很长的桥上...",
    primaryEmotion: "不舍",
    emotionIntensity: 0.74,
    emotionArc: ["迷茫", "紧张", "不舍"],
    keywords: [
      { text: "桥", type: "symbol", weight: 0.9 },
      { text: "蓝黑色", type: "color", weight: 0.7 },
    ],
    symbols: ["桥", "追逐者"],
    gentleReflection: "这个梦里有追逐...",
    followUpQuestion: "你还记得追你的人像谁吗？",
    atmosphere: { palette: "deep-blue-gold", motion: "slow-floating", density: 0.65 },
  };

  function makeFakeClient(response: unknown): ModelClient {
    return {
      async completeJson() {
        return response;
      },
    };
  }

  it("returns normalized state for valid model output", async () => {
    const client = makeFakeClient(validModelOutput);
    const input = {
      dreamerName: "小林",
      currentState: {
        title: "之前的梦",
        story: "之前的故事",
        primaryEmotion: "平静",
        emotionIntensity: 0.5,
        emotionArc: ["平静"],
        keywords: [{ text: "水", type: "symbol" as const, weight: 0.8 }],
        symbols: ["水"],
        followUpQuestion: "之前的问题",
        atmosphere: { palette: "blue", motion: "flow", density: 0.5 },
        fragments: [
          { id: "f1", content: "之前片段", inputType: "text" as const, createdAt: "2024-01-01" },
        ],
      },
      fragment: { content: "我梦见了一座桥", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.title).toBe("蓝黑色的桥");
    expect(result.state.story).toBe("你站在一座很长的桥上...");
    expect(result.state.fragments).toHaveLength(2);
    expect(result.state.fragments[0].content).toBe("之前片段");
    expect(result.state.fragments[1].content).toBe("我梦见了一座桥");
  });

  it("returns error for invalid JSON output", async () => {
    const client = makeFakeClient({ invalid: true });
    const input = {
      dreamerName: "小林",
      currentState: null,
      fragment: { content: "test", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("AGENT_INVALID_RESPONSE");
  });

  it("returns safe fallback for unsafe output", async () => {
    const unsafeOutput = {
      ...validModelOutput,
      gentleReflection: "这说明你有心理疾病。",
    };
    const client = makeFakeClient(unsafeOutput);
    const input = {
      dreamerName: "小林",
      currentState: null,
      fragment: { content: "test", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.followUpQuestion).toBe("这个片段里最清楚的画面是什么？");
    expect(result.state.primaryEmotion).toBe("平静");
  });

  it("returns error for model failure", async () => {
    const client: ModelClient = {
      async completeJson() {
        throw new Error("Network error");
      },
    };
    const input = {
      dreamerName: "小林",
      currentState: null,
      fragment: { content: "test", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("AGENT_UNAVAILABLE");
  });

  it("returns validation error for invalid input", async () => {
    const client = makeFakeClient(validModelOutput);
    const input = {
      dreamerName: "",
      currentState: null,
      fragment: { content: "", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("VALIDATION_ERROR");
  });

  it("preserves current state fields where model omits them", async () => {
    const client = makeFakeClient(validModelOutput);
    const input = {
      dreamerName: "小林",
      currentState: {
        title: "之前的梦",
        story: "之前的故事",
        primaryEmotion: "平静",
        emotionIntensity: 0.5,
        emotionArc: ["平静"],
        keywords: [{ text: "水", type: "symbol" as const, weight: 0.8 }],
        symbols: ["水"],
        followUpQuestion: "之前的问题",
        atmosphere: { palette: "blue", motion: "flow", density: 0.5 },
        fragments: [
          { id: "f1", content: "之前片段", inputType: "text" as const, createdAt: "2024-01-01" },
        ],
      },
      fragment: { content: "我梦见了一座桥", inputType: "text" as const },
    };

    const result = await runDreamAgent(input, client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.keywords).toEqual(validModelOutput.keywords);
    expect(result.state.atmosphere).toEqual(validModelOutput.atmosphere);
  });
});
