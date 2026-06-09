export type ModelClient = {
  completeJson(input: { system: string; user: string; temperature: number }): Promise<unknown>;
};

export function createModelClient(env: {
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
}): ModelClient {
  const apiKey = env.OPENAI_API_KEY;
  const baseUrl = env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = env.OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return {
    async completeJson({ system, user, temperature }) {
      try {
        const url = `${baseUrl}/chat/completions`;
        const body = {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          response_format: { type: "json_object" },
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Model request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
          throw new Error("Invalid model response structure");
        }

        try {
          return JSON.parse(content);
        } catch {
          throw new Error("Model response is not valid JSON");
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes(apiKey)) {
          throw new Error("Model request failed");
        }
        throw e;
      }
    },
  };
}
