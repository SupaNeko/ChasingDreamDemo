import { describe, it, expect } from "vitest";
import { detectUnsafeAgentState, makeSafeFallback } from "../safety";
import type { AgentDreamState, ValidDreamAgentRequest } from "../schema";

describe("detectUnsafeAgentState", () => {
  const safeState: AgentDreamState = {
    title: "蓝黑色的桥",
    story: "你站在一座很长的桥上...",
    primaryEmotion: "不舍",
    emotionIntensity: 0.74,
    emotionArc: ["迷茫", "紧张", "不舍"],
    keywords: [{ text: "桥", type: "symbol", weight: 0.9 }],
    symbols: ["桥"],
    gentleReflection: "这个梦里有追逐...",
    followUpQuestion: "你还记得追你的人像谁吗？",
    atmosphere: { palette: "deep-blue-gold", motion: "slow-floating", density: 0.65 },
  };

  it("returns empty for safe state", () => {
    const findings = detectUnsafeAgentState(safeState);
    expect(findings).toHaveLength(0);
  });

  it("detects diagnosis language", () => {
    const state = { ...safeState, gentleReflection: "这说明你有心理疾病。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.code === "DIAGNOSIS")).toBe(true);
  });

  it("detects depression mention", () => {
    const state = { ...safeState, gentleReflection: "你可能有抑郁症。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "DIAGNOSIS")).toBe(true);
  });

  it("detects occult certainty", () => {
    const state = { ...safeState, gentleReflection: "这是预兆。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "OCCULT")).toBe(true);
  });

  it("detects 命中注定", () => {
    const state = { ...safeState, gentleReflection: "这是命中注定的。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "OCCULT")).toBe(true);
  });

  it("detects coercive interpretation 这说明你", () => {
    const state = { ...safeState, gentleReflection: "这说明你内心很脆弱。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "COERCIVE")).toBe(true);
  });

  it("detects coercive interpretation 你的潜意识一定", () => {
    const state = { ...safeState, gentleReflection: "你的潜意识一定在逃避什么。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "COERCIVE")).toBe(true);
  });

  it("detects multi-question follow-ups", () => {
    const state = { ...safeState, followUpQuestion: "你记得吗？还有什么细节？" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "MULTI_QUESTION")).toBe(true);
  });

  it("detects frightening claims", () => {
    const state = { ...safeState, gentleReflection: "这个梦预示着厄运。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "FRIGHTENING")).toBe(true);
  });

  it("checks all text fields", () => {
    const state = { ...safeState, story: "你的潜意识一定有问题。" };
    const findings = detectUnsafeAgentState(state);
    expect(findings.some((f) => f.code === "COERCIVE")).toBe(true);
  });
});

describe("makeSafeFallback", () => {
  const input: ValidDreamAgentRequest = {
    dreamerName: "小林",
    currentState: {
      title: "之前的梦",
      story: "之前的故事",
      primaryEmotion: "平静",
      emotionIntensity: 0.5,
      emotionArc: ["平静"],
      keywords: [{ text: "水", type: "symbol", weight: 0.8 }],
      symbols: ["水"],
      gentleReflection: "之前的反思",
      followUpQuestion: "之前的问题",
      atmosphere: { palette: "blue", motion: "flow", density: 0.5 },
      fragments: [],
    },
    fragment: {
      content: "我梦见了一座桥",
      inputType: "text",
    },
  };

  it("returns a safe fallback state", () => {
    const fallback = makeSafeFallback(input, "检测到不安全内容");
    expect(fallback.title).toBe("之前的梦");
    expect(fallback.story).toContain("之前的故事");
    expect(fallback.story).toContain("我梦见了一座桥");
    expect(fallback.followUpQuestion).toBe("这个片段里最清楚的画面是什么？");
    expect(fallback.primaryEmotion).toBe("平静");
    expect(fallback.emotionIntensity).toBe(0.5);
    expect(fallback.keywords).toEqual([{ text: "水", type: "symbol", weight: 0.8 }]);
    expect(fallback.atmosphere).toEqual({ palette: "blue", motion: "flow", density: 0.5 });
  });

  it("uses default values when no currentState", () => {
    const noStateInput: ValidDreamAgentRequest = {
      dreamerName: "小林",
      currentState: null,
      fragment: { content: "我梦见了一座桥", inputType: "text" },
    };
    const fallback = makeSafeFallback(noStateInput, "不安全");
    expect(fallback.title).toBe("梦境片段");
    expect(fallback.story).toBe("我梦见了一座桥");
    expect(fallback.followUpQuestion).toBe("这个片段里最清楚的画面是什么？");
    expect(fallback.primaryEmotion).toBe("平静");
    expect(fallback.emotionIntensity).toBe(0.5);
    expect(fallback.keywords).toEqual([]);
    expect(fallback.symbols).toEqual([]);
    expect(fallback.emotionArc).toEqual([]);
    expect(fallback.gentleReflection).toBe("");
    expect(fallback.atmosphere.palette).toBeTruthy();
    expect(fallback.atmosphere.motion).toBeTruthy();
    expect(fallback.atmosphere.density).toBe(0.5);
  });

  it("appends new fragment to existing story", () => {
    const fallback = makeSafeFallback(input, "不安全");
    expect(fallback.story).toContain("之前的故事");
    expect(fallback.story).toContain("我梦见了一座桥");
  });
});
