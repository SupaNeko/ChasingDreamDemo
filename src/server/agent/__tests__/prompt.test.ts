import { describe, it, expect } from "vitest";
import { buildDreamAgentPrompt } from "../prompt";
import type { ValidDreamAgentRequest } from "../schema";

describe("buildDreamAgentPrompt", () => {
  const baseInput: ValidDreamAgentRequest = {
    dreamerName: "小林",
    currentState: null,
    fragment: {
      content: "我梦见了一座桥",
      inputType: "text",
    },
  };

  it("includes agent role and name", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("巡梦员");
    expect(system).toContain("你不是解梦师");
  });

  it("includes JSON-only instruction", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("JSON");
    expect(system).toContain("markdown");
  });

  it("includes one-question rule", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("一个问题");
  });

  it("includes no-diagnosis rule", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain(" diagnose");
    expect(system).toContain("心理疾病");
  });

  it("includes dreamer name in user prompt", () => {
    const { user } = buildDreamAgentPrompt(baseInput);
    expect(user).toContain("小林");
  });

  it("includes fragment content and inputType", () => {
    const { user } = buildDreamAgentPrompt(baseInput);
    expect(user).toContain("我梦见了一座桥");
    expect(user).toContain("text");
  });

  it("includes timestamp when provided", () => {
    const input = { ...baseInput, now: "2024-06-01T12:00:00Z" };
    const { user } = buildDreamAgentPrompt(input);
    expect(user).toContain("2024-06-01T12:00:00Z");
  });

  it("includes current state when provided", () => {
    const input: ValidDreamAgentRequest = {
      ...baseInput,
      currentState: {
        title: "之前的梦",
        story: "之前的故事",
        primaryEmotion: "平静",
        emotionIntensity: 0.5,
        emotionArc: ["平静"],
        keywords: [{ text: "水", type: "symbol", weight: 0.8 }],
        symbols: ["水"],
        followUpQuestion: "之前的问题",
        fragments: [],
      },
    };
    const { user } = buildDreamAgentPrompt(input);
    expect(user).toContain("之前的梦");
    expect(user).toContain("之前的故事");
  });

  it("writes in second person", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("你");
  });

  it("instructs to preserve and integrate prior currentState", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("currentState");
    expect(system).toContain("保留");
  });

  it("instructs to treat new fragment as partial memory", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("fragment");
    expect(system).toContain("碎片");
  });

  it("instructs to avoid 'this means you' phrasing", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("这说明你");
  });

  it("instructs follow-up question must be based on user-provided details", () => {
    const { system } = buildDreamAgentPrompt(baseInput);
    expect(system).toContain("用户提供");
  });
});
