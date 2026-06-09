import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/dream-agent/route";

describe("POST /api/dream-agent", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
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
                  atmosphere: {
                    palette: "deep-blue-gold",
                    motion: "slow-floating",
                    density: 0.65,
                  },
                  fragments: [],
                }),
              },
            },
          ],
        }),
        { status: 200 }
      )
    );

    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_BASE_URL", "https://test.api.com/v1");
    vi.stubEnv("OPENAI_MODEL", "test-model");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns 400 for invalid request", async () => {
    const request = new Request("http://localhost/api/dream-agent", {
      method: "POST",
      body: JSON.stringify({ dreamerName: "", fragment: { content: "", inputType: "text" } }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 with state for valid request", async () => {
    const request = new Request("http://localhost/api/dream-agent", {
      method: "POST",
      body: JSON.stringify({
        dreamerName: "小林",
        currentState: null,
        fragment: { content: "我梦见了一座桥", inputType: "text" },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.state.title).toBe("蓝黑色的桥");
    expect(body.state.story).toBeTruthy();
    expect(body.state.keywords).toBeInstanceOf(Array);
    expect(body.state.followUpQuestion).toBeTruthy();
  });

  it("returns 502 when model is unavailable", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    const request = new Request("http://localhost/api/dream-agent", {
      method: "POST",
      body: JSON.stringify({
        dreamerName: "小林",
        currentState: null,
        fragment: { content: "test", inputType: "text" },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(502);

    const body = await response.json();
    expect(body.error.code).toBe("AGENT_UNAVAILABLE");
  });

  it("never exposes API key in error response", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error: test-key"));

    const request = new Request("http://localhost/api/dream-agent", {
      method: "POST",
      body: JSON.stringify({
        dreamerName: "小林",
        currentState: null,
        fragment: { content: "test", inputType: "text" },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("test-key");
  });
});
