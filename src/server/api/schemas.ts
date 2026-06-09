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
  density: z.number(),
});

const fragmentInputSchema = z.object({
  id: z.string(),
  content: z.string(),
  inputType: z.enum(["text", "voice"]),
  createdAt: z.string(),
});

export const dreamStateSchema = z.object({
  title: z.string().min(1),
  story: z.string().min(1),
  primaryEmotion: z.string().optional(),
  emotionIntensity: z.number().optional(),
  emotionArc: z.array(z.string()),
  keywords: z.array(dreamKeywordSchema),
  symbols: z.array(z.string()),
  gentleReflection: z.string().optional(),
  followUpQuestion: z.string(),
  atmosphere: dreamAtmosphereSchema.optional(),
  fragments: z.array(fragmentInputSchema),
});

export const dreamerRequestSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(24)
    .transform((val) => val.trim()),
});

export const saveDreamRequestSchema = z.object({
  dreamerId: z.string().min(1),
  state: dreamStateSchema,
  idempotencyKey: z.string().optional(),
});

export const dreamListQuerySchema = z.object({
  dreamerId: z.string().min(1),
});

export const dreamDetailQuerySchema = z.object({
  dreamerId: z.string().min(1),
});
