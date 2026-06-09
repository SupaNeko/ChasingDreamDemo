import { describe, it, expect } from "vitest";
import { dreamAgentRequestSchema, agentDreamStateSchema } from "../schema";

describe("dreamAgentRequestSchema", () => {
  const validRequest = {
    dreamerName: "小林",
    currentState: null,
    fragment: {
      content: "我梦见了一座桥",
      inputType: "text" as const,
    },
  };

  it("accepts a valid request", () => {
    const result = dreamAgentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("rejects empty fragment content", () => {
    const result = dreamAgentRequestSchema.safeParse({
      ...validRequest,
      fragment: { content: "", inputType: "text" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid input type", () => {
    const result = dreamAgentRequestSchema.safeParse({
      ...validRequest,
      fragment: { content: "test", inputType: "image" },
    });
    expect(result.success).toBe(false);
  });

  it("normalizes invalid keyword type to 'other' in currentState", () => {
    const result = dreamAgentRequestSchema.safeParse({
      ...validRequest,
      currentState: {
        keywords: [{ text: "桥", type: "invalid", weight: 0.5 }],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentState?.keywords?.[0].type).toBe("other");
    }
  });

  it("rejects emotion intensity outside 0-1", () => {
    const result = dreamAgentRequestSchema.safeParse({
      ...validRequest,
      currentState: {
        emotionIntensity: 1.5,
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects keywords over 12", () => {
    const result = dreamAgentRequestSchema.safeParse({
      ...validRequest,
      currentState: {
        keywords: Array.from({ length: 13 }, (_, i) => ({
          text: `word${i}`,
          type: "symbol" as const,
          weight: 0.5,
        })),
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("agentDreamStateSchema", () => {
  const validState = {
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
    fragments: [],
  };

  it("accepts a valid state", () => {
    const result = agentDreamStateSchema.safeParse(validState);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects emotion intensity above 1", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      emotionIntensity: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects emotion intensity below 0", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      emotionIntensity: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects keywords over 12", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      keywords: Array.from({ length: 13 }, (_, i) => ({
        text: `word${i}`,
        type: "symbol",
        weight: 0.5,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("rejects keyword weight above 1", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      keywords: [{ text: "桥", type: "symbol", weight: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects emotionArc over 8", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      emotionArc: Array.from({ length: 9 }, (_, i) => `e${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects symbols over 12", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      symbols: Array.from({ length: 13 }, (_, i) => `s${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects atmosphere density above 1", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      atmosphere: { palette: "test", motion: "test", density: 1.5 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty story", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      story: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty followUpQuestion", () => {
    const result = agentDreamStateSchema.safeParse({
      ...validState,
      followUpQuestion: "",
    });
    expect(result.success).toBe(false);
  });
});
