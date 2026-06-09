import { z } from "zod";

const ALLOWED_KEYWORD_TYPES = [
  "emotion",
  "person",
  "place",
  "object",
  "color",
  "action",
  "symbol",
  "other",
] as const;

const dreamKeywordTypeSchema = z
  .string()
  .transform((val) => {
    const normalized = val.toLowerCase().trim();
    if (ALLOWED_KEYWORD_TYPES.includes(normalized as (typeof ALLOWED_KEYWORD_TYPES)[number])) {
      return normalized as (typeof ALLOWED_KEYWORD_TYPES)[number];
    }
    // Graceful fallback: map common Chinese types to English equivalents
    const mapping: Record<string, string> = {
      "情绪": "emotion",
      "情感": "emotion",
      "人物": "person",
      "人": "person",
      "角色": "person",
      "地点": "place",
      "场所": "place",
      "位置": "place",
      "空间": "place",
      "物体": "object",
      "物品": "object",
      "东西": "object",
      "颜色": "color",
      "色彩": "color",
      "动作": "action",
      "行为": "action",
      "象征": "symbol",
      "符号": "symbol",
      "意象": "symbol",
      "其他": "other",
      "环境": "other",
      "气味": "other",
      "氛围": "other",
      "声音": "other",
      "时间": "other",
      "状态": "other",
      "天气": "other",
    };
    const mapped = mapping[normalized];
    if (mapped && ALLOWED_KEYWORD_TYPES.includes(mapped as (typeof ALLOWED_KEYWORD_TYPES)[number])) {
      return mapped as (typeof ALLOWED_KEYWORD_TYPES)[number];
    }
    return "other";
  });

const dreamKeywordSchema = z.object({
  text: z.string().min(1),
  type: dreamKeywordTypeSchema,
  weight: z.number().min(0).max(1),
});

const dreamAtmosphereSchema = z.object({
  palette: z.string(),
  motion: z.string(),
  density: z.number().min(0).max(1),
});

const dreamStateSchema = z.object({
  title: z.string().optional(),
  story: z.string().optional(),
  primaryEmotion: z.string().optional(),
  emotionIntensity: z.number().min(0).max(1).optional(),
  emotionArc: z.array(z.string()).max(8).optional(),
  keywords: z.array(dreamKeywordSchema).max(12).optional(),
  symbols: z.array(z.string()).max(12).optional(),
  gentleReflection: z.string().optional(),
  followUpQuestion: z.string().optional(),
  atmosphere: dreamAtmosphereSchema.optional(),
  fragments: z
    .array(
      z.object({
        id: z.string(),
        content: z.string(),
        inputType: z.enum(["text", "voice"]),
        createdAt: z.string(),
      })
    )
    .optional(),
});

export const dreamAgentRequestSchema = z.object({
  dreamerName: z
    .string()
    .min(1)
    .max(24)
    .transform((s) => s.trim()),
  currentState: dreamStateSchema.nullable().optional(),
  fragment: z.object({
    content: z
      .string()
      .min(1)
      .max(2000)
      .transform((s) => s.trim()),
    inputType: z.enum(["text", "voice"]),
  }),
  now: z.string().optional(),
});

const fragmentInputSchema = z.object({
  id: z.string(),
  content: z.string(),
  inputType: z.enum(["text", "voice"]),
  createdAt: z.string(),
});

export const agentDreamStateSchema = z.object({
  title: z.string().min(1),
  story: z.string().min(1),
  primaryEmotion: z.string().default(""),
  emotionIntensity: z.number().min(0).max(1).default(0.5),
  emotionArc: z.array(z.string()).max(8).default([]),
  keywords: z.array(dreamKeywordSchema).max(12).default([]),
  symbols: z.array(z.string()).max(12).default([]),
  gentleReflection: z.string().default(""),
  followUpQuestion: z.string().min(1),
  atmosphere: dreamAtmosphereSchema.default({ palette: "deep-blue-gold", motion: "slow-floating", density: 0.5 }),
  fragments: z.array(fragmentInputSchema).default([]),
});

export type ValidDreamAgentRequest = z.infer<typeof dreamAgentRequestSchema>;
export type AgentDreamState = z.infer<typeof agentDreamStateSchema>;
