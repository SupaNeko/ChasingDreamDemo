# Frontend Experience Spec

## Scope

Build the user-facing Demo experience for 《巡梦》: launch page, dream composing cabin, fragment drawer, calendar page, dream detail page, voice input affordance, loading/error states, responsive behavior, and the "低光梦舱" visual system.

This spec excludes SQLite persistence, API implementation, and model prompting. Those are owned by the Data/API and Agent specs. Frontend may use typed client functions that call those endpoints.

## Product Goals

- Let a dreamer enter the app with a name and resume the same dreamer from local storage.
- Let the user input dream fragments repeatedly without visual interruption.
- Show Agent-generated story, emotion, keywords, reflection, and follow-up question.
- Let the user save a valid dream and browse saved dreams by date.
- Keep the interface quiet, immersive, safe, and clearly usable.

## Screens

### Launch Page

- Shows product name, short mood line, dreamer name input, enter button.
- If a previous dreamer exists in `localStorage`, show a quiet "continue as" affordance.
- Validates trimmed name length 1-24 characters.
- Shows error if dreamer creation fails.

### Dream Composing Cabin

- Top bar: current dreamer, calendar button, save button, switch dreamer.
- Center: story panel for current `DreamState.story`.
- Atmosphere layer: keyword bubbles around story, never over story text.
- Bottom input bar: text input, voice button, send button.
- Fragment drawer: collapsible list of raw fragments with input type and timestamp.
- Loading state while Agent request is in progress.
- Send failure preserves input and current state.

### Calendar Page

- Month view with day markers for saved dream count.
- Selected date reveals that day's dream list.
- Empty state for dreamer with no dreams.
- Dream list item opens detail.

### Dream Detail Page

- Shows saved story, title, emotion, keywords, symbols, fragments, gentle reflection, and atmosphere.
- Background mood may vary by `atmosphere.palette`.
- Back navigation to calendar and composing cabin.

## Visual Requirements

- Follow `PRODUCT.md`, `DESIGN.md`, and `docs/superpowers/specs/2026-06-09-frontend-style-design.md`.
- No AI SaaS gradients, glowing CTA excess, therapy-clinic look, or occult symbols.
- Main story text must satisfy WCAG AA contrast.
- Use lucide icons for save, calendar, microphone, send, back, switch dreamer.
- Cards only for repeated list items and framed tools. Do not nest cards.
- Use stable dimensions for input bar, icon buttons, bubbles, calendar cells, and story panel.

## Motion Requirements

- Keyword bubbles drift slowly and breathe subtly.
- Background has very low-frequency atmosphere motion.
- Agent loading conveys "正在拼合" without blocking story layout.
- Save success uses a short warm feedback pulse.
- Respect `prefers-reduced-motion`: disable drift/background movement and keep minimal fades.

## Frontend State

Client state should include:

```ts
type InputType = "text" | "voice";

type FragmentInput = {
  id: string;
  content: string;
  inputType: InputType;
  createdAt: string;
};

type DreamState = {
  title: string;
  story: string;
  primaryEmotion?: string;
  emotionIntensity?: number;
  emotionArc: string[];
  keywords: Array<{
    text: string;
    type: "emotion" | "person" | "place" | "object" | "color" | "action" | "symbol" | "other";
    weight: number;
  }>;
  symbols: string[];
  gentleReflection?: string;
  followUpQuestion: string;
  atmosphere?: {
    palette: string;
    motion: string;
    density: number;
  };
  fragments: FragmentInput[];
};
```

## Client API Contract

Frontend should call:

- `POST /api/dreamers`
- `POST /api/dream-agent`
- `POST /api/dreams`
- `GET /api/dreams?dreamerId=...`
- `GET /api/dreams/:id?dreamerId=...`

All API clients must return typed success/error results, not throw unhandled UI-breaking errors.

## Acceptance Criteria

- User can enter with a dreamer name and return with the same dreamer from local storage.
- User can send multiple text fragments.
- Voice unsupported or denied does not block text input.
- Agent loading, failure, and success states are visible.
- Generated story and keywords update after Agent response.
- Save button is disabled until there is a valid story.
- Calendar shows saved dreams grouped by date.
- Detail page renders all saved DreamState fields.
- Mobile layout keeps input accessible and bubbles away from story/input.
- Reduced motion mode removes decorative animation.
