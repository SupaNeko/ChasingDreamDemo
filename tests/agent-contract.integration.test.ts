import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/dream-agent/route";

describe("Agent Contract Integration", () => {
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
                  story: "你站在一座很长的桥上，天空是蓝黑色的...",
                  primaryEmotion: "不舍",
                  emotionIntensity: 0.74,
                  emotionArc: ["迷茫", "紧张", "不舍"],
                  keywords: [
                    { text: "桥", type: "symbol", weight: 0.9 },
                    { text: "蓝黑色", type: "color", weight: 0.7 },
                    { text: "追逐", type: "action", weight: 0.8 },
                    { text: "不舍", type: "emotion", weight: 1 },
                  ],
                  symbols: ["桥", "追逐者", "蓝黑色天空"],
                  gentleReflection: "这个梦里有追逐，但它真正明亮的地方似乎不是恐惧...",
                  followUpQuestion: "你还记得追你的人像谁，或者像什么吗？",
                  atmosphere: {
                    palette: "deep-blue-gold",
                    motion: "slow-floating",
                    density: 0.65,
                  },
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

  it("returns a complete dream state from the route", async () => {
    const request = new Request("http://localhost/api/dream-agent", {
      method: "POST",
      body: JSON.stringify({
        dreamerName: "小林",
        currentState: null,
        fragment: {
          content: "我站在一座很长的桥上，天空是蓝黑色的。有人在我后面追。",
          inputType: "text",
        },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    const state = body.state;

    expect(state.title).toBe("蓝黑色的桥");
    expect(state.story).toContain("蓝黑色");
    expect(state.primaryEmotion).toBe("不舍");
    expect(state.keywords).toEqual([
      { text: "桥", type: "symbol", weight: 0.9 },
      { text: "蓝黑色", type: "color", weight: 0.7 },
      { text: "追逐", type: "action", weight: 0.8 },
      { text: "不舍", type: "emotion", weight: 1 },
    ]);
    expect(state.gentleReflection).toContain("追逐");
    expect(state.followUpQuestion).toBe("你还记得追你的人像谁，或者像什么吗？");
    expect(state.atmosphere.palette).toBe("deep-blue-gold");
    expect(state.atmosphere.motion).toBe("slow-floating");
    expect(state.atmosphere.density).toBe(0.65);
    expect(state.fragments).toHaveLength(1);
    expect(state.fragments[0].content).toContain("桥");
  });
});
