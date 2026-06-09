import { z } from "zod";
import type { DreamState, DreamKeywordType } from "@/types/dream";

export type DreamAgentRequest = {
  dreamerName: string;
  currentState: Partial<DreamState> | null;
  fragment: { content: string; inputType: "text" | "voice" };
  now?: string;
};

export type AgentDreamState = {
  title: string;
  story: string;
  primaryEmotion: string;
  emotionIntensity: number;
  emotionArc: string[];
  keywords: Array<{ text: string; type: DreamKeywordType; weight: number }>;
  symbols: string[];
  gentleReflection: string;
  followUpQuestion: string;
  atmosphere: { palette: string; motion: string; density: number };
};

export type AgentResult =
  | { ok: true; state: AgentDreamState }
  | { ok: false; code: import("@/server/api/errors").ApiErrorCode; message: string };
