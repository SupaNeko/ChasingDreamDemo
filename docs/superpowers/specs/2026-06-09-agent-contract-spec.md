# Agent Contract Spec

## Scope

Build the Agent integration contract for 《巡梦》: prompt boundaries, request shape, response schema, JSON validation, safety downgrade, retry/error handling, and server route integration for `POST /api/dream-agent`.

This spec excludes database persistence and frontend rendering. It depends on the shared `DreamState` shape and can be tested without a real model by injecting a model client.

## Agent Identity

Agent name: 巡梦员。

System role:

```text
你不是解梦师，而是帮助用户把梦境碎片温柔拼回来的巡梦员。
```

The Agent helps the user remember and organize. It must not diagnose, predict, interpret as fact, or claim hidden meaning.

## Request Shape

```ts
type DreamAgentRequest = {
  dreamerName: string;
  currentState: Partial<DreamState> | null;
  fragment: {
    content: string;
    inputType: "text" | "voice";
  };
  now?: string;
};
```

Validation:

- `dreamerName` trimmed, 1-24 characters.
- `fragment.content` trimmed, 1-2000 characters.
- `fragment.inputType` must be `text` or `voice`.
- `now` defaults to server current ISO timestamp.

## Response Shape

The model must return JSON matching:

```ts
type DreamKeywordType =
  | "emotion"
  | "person"
  | "place"
  | "object"
  | "color"
  | "action"
  | "symbol"
  | "other";

type AgentDreamState = {
  title: string;
  story: string;
  primaryEmotion: string;
  emotionIntensity: number;
  emotionArc: string[];
  keywords: Array<{
    text: string;
    type: DreamKeywordType;
    weight: number;
  }>;
  symbols: string[];
  gentleReflection: string;
  followUpQuestion: string;
  atmosphere: {
    palette: string;
    motion: string;
    density: number;
  };
};
```

Validation:

- `title`, `story`, and `followUpQuestion` cannot be empty.
- `emotionIntensity` and keyword `weight` are clamped/rejected outside 0-1.
- `keywords` max length 12.
- `emotionArc` max length 8.
- `symbols` max length 12.
- `atmosphere.density` must be 0-1.

## Prompt Requirements

The prompt must instruct the model to:

- Preserve and integrate prior `currentState`.
- Treat the new fragment as partial memory.
- Write in second person, gently and concretely.
- Ask exactly one follow-up question.
- Base follow-up question on user-provided details.
- Avoid diagnosis, occult certainty, symbolic authority, and "this means you..." phrasing.
- Return only JSON, no markdown fences.

## Safety Downgrade

If model output contains diagnosis, coercive interpretation, frightening claims, or occult certainty, route should not return it directly. Instead return a safe fallback state that:

- Keeps existing valid state where possible.
- Adds the new fragment.
- Provides a neutral story update if available.
- Uses a safe follow-up question such as: `这个片段里最清楚的画面是什么？`
- Includes error code `AGENT_INVALID_RESPONSE` only if no safe state can be produced.

## Model Client

Wrap OpenAI-compatible API access behind:

```ts
type ModelClient = {
  completeJson(input: {
    system: string;
    user: string;
    temperature: number;
  }): Promise<unknown>;
};
```

Environment:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

Frontend must never see the API key.

## Acceptance Criteria

- Invalid request returns `400`.
- Valid request calls injected model client with strict JSON prompt.
- Valid model JSON returns normalized `DreamState`.
- Invalid JSON returns `502` without corrupting existing state.
- Unsafe interpretive output is rejected or downgraded.
- The follow-up question is exactly one question.
- The route does not expose model provider secrets.
