import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createModelClient, type ModelClient } from "../model-client";

describe("createModelClient", () => {
  const env = {
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: "https://test.api.com/v1",
    OPENAI_MODEL: "test-model",
  };

  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({ test: true }),
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct URL", async () => {
    const client = createModelClient(env);
    await client.completeJson({ system: "sys", user: "usr", temperature: 0.7 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://test.api.com/v1/chat/completions");
  });

  it("sends Authorization header with API key", async () => {
    const client = createModelClient(env);
    await client.completeJson({ system: "sys", user: "usr", temperature: 0.7 });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers["Authorization"]).toBe("Bearer test-key");
  });

  it("sends correct model name in body", async () => {
    const client = createModelClient(env);
    await client.completeJson({ system: "sys", user: "usr", temperature: 0.7 });
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.model).toBe("test-model");
  });

  it("sends correct JSON body structure", async () => {
    const client = createModelClient(env);
    await client.completeJson({ system: "sys", user: "usr", temperature: 0.7 });
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.messages).toEqual([
      { role: "system", content: "sys" },
      { role: "user", content: "usr" },
    ]);
    expect(body.temperature).toBe(0.7);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("returns parsed JSON content", async () => {
    const client = createModelClient(env);
    const result = await client.completeJson({
      system: "sys",
      user: "usr",
      temperature: 0.7,
    });
    expect(result).toEqual({ test: true });
  });

  it("throws on non-2xx status", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "bad" }), { status: 500 })
    );
    const client = createModelClient(env);
    await expect(
      client.completeJson({ system: "sys", user: "usr", temperature: 0.7 })
    ).rejects.toThrow();
  });

  it("throws on invalid JSON response", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "not-json" } }],
        }),
        { status: 200 }
      )
    );
    const client = createModelClient(env);
    await expect(
      client.completeJson({ system: "sys", user: "usr", temperature: 0.7 })
    ).rejects.toThrow();
  });

  it("never includes API key in thrown error messages", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error: test-key"));
    const client = createModelClient(env);
    try {
      await client.completeJson({ system: "sys", user: "usr", temperature: 0.7 });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      expect(message).not.toContain("test-key");
    }
  });

  it("uses default base URL when not provided", async () => {
    const client = createModelClient({ OPENAI_API_KEY: "k", OPENAI_MODEL: "m" });
    await client.completeJson({ system: "s", user: "u", temperature: 0.5 });
    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
  });
});
