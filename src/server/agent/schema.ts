import { z } from "zod";

const dreamKeywordTypeSchema = z.enum([
  "emotion",
  "person",
  "place",
  "object",
  "color",
  "action",
  "symbol",
  "other",
]);

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
  primaryEmotion: z.string(),
  emotionIntensity: z.number().min(0).max(1),
  emotionArc: z.array(z.string()).max(8),
  keywords: z.array(dreamKeywordSchema).max(12),
  symbols: z.array(z.string()).max(12),
  gentleReflection: z.string(),
  followUpQuestion: z.string().min(1),
  atmosphere: dreamAtmosphereSchema,
  fragments: z.array(fragmentInputSchema).optional(),
});

export type ValidDreamAgentRequest = z.infer<typeof dreamAgentRequestSchema>;
