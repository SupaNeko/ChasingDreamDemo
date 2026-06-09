import {
  dreamerRequestSchema,
  saveDreamRequestSchema,
  dreamListQuerySchema,
  dreamDetailQuerySchema,
} from "../schemas";

describe("dreamerRequestSchema", () => {
  it("accepts valid name", () => {
    const result = dreamerRequestSchema.safeParse({ name: "小林" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("小林");
    }
  });

  it("trims whitespace", () => {
    const result = dreamerRequestSchema.safeParse({ name: "  小林  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("小林");
    }
  });

  it("rejects empty name", () => {
    const result = dreamerRequestSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 24 chars", () => {
    const result = dreamerRequestSchema.safeParse({ name: "a".repeat(25) });
    expect(result.success).toBe(false);
  });

  it("accepts name of exactly 24 chars", () => {
    const result = dreamerRequestSchema.safeParse({ name: "a".repeat(24) });
    expect(result.success).toBe(true);
  });
});

describe("saveDreamRequestSchema", () => {
  const validState = {
    title: "Test Dream",
    story: "I was flying.",
    emotionArc: ["calm", "excitement"],
    keywords: [{ text: "flying", type: "action", weight: 0.8 }],
    symbols: ["eagle"],
    followUpQuestion: "How did you feel?",
    fragments: [{ id: "f1", content: "flying", inputType: "text", createdAt: "2024-01-01T00:00:00Z" }],
  };

  it("accepts valid save request", () => {
    const result = saveDreamRequestSchema.safeParse({
      dreamerId: "user-1",
      state: validState,
    });
    expect(result.success).toBe(true);
  });

  it("accepts request with idempotencyKey", () => {
    const result = saveDreamRequestSchema.safeParse({
      dreamerId: "user-1",
      state: validState,
      idempotencyKey: "key-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing dreamerId", () => {
    const result = saveDreamRequestSchema.safeParse({
      state: validState,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emotionArc (not array of strings)", () => {
    const result = saveDreamRequestSchema.safeParse({
      dreamerId: "user-1",
      state: { ...validState, emotionArc: ["ok", 123] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid keywords (missing weight)", () => {
    const result = saveDreamRequestSchema.safeParse({
      dreamerId: "user-1",
      state: { ...validState, keywords: [{ text: "x", type: "action" }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid atmosphere (missing field)", () => {
    const result = saveDreamRequestSchema.safeParse({
      dreamerId: "user-1",
      state: { ...validState, atmosphere: { palette: "blue", motion: "flow" } },
    });
    expect(result.success).toBe(false);
  });
});

describe("dreamListQuerySchema", () => {
  it("accepts dreamerId", () => {
    const result = dreamListQuerySchema.safeParse({ dreamerId: "user-1" });
    expect(result.success).toBe(true);
  });

  it("rejects missing dreamerId", () => {
    const result = dreamListQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("dreamDetailQuerySchema", () => {
  it("accepts dreamerId", () => {
    const result = dreamDetailQuerySchema.safeParse({ dreamerId: "user-1" });
    expect(result.success).toBe(true);
  });

  it("rejects missing dreamerId", () => {
    const result = dreamDetailQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
