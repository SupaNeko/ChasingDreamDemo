export type InputType = "text" | "voice";

export type FragmentInput = {
  id: string;
  content: string;
  inputType: InputType;
  createdAt: string;
};

export type DreamKeywordType =
  | "emotion"
  | "person"
  | "place"
  | "object"
  | "color"
  | "action"
  | "symbol"
  | "other";

export type DreamKeyword = {
  text: string;
  type: DreamKeywordType;
  weight: number;
};

export type DreamAtmosphere = {
  palette: string;
  motion: string;
  density: number;
};

export type DreamState = {
  title: string;
  story: string;
  primaryEmotion?: string;
  emotionIntensity?: number;
  emotionArc: string[];
  keywords: DreamKeyword[];
  symbols: string[];
  gentleReflection?: string;
  followUpQuestion: string;
  atmosphere?: DreamAtmosphere;
  fragments: FragmentInput[];
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type Dreamer = {
  id: string;
  name: string;
};

export type DreamSummary = {
  id: string;
  title: string;
  dreamDate: string;
  primaryEmotion?: string;
  createdAt: string;
};

export type SavedDream = DreamState & {
  id: string;
  dreamerId: string;
  dreamDate: string;
  createdAt: string;
  updatedAt: string;
};
