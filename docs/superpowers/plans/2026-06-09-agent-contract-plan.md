# Agent Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `POST /api/dream-agent` contract, prompt assembly, model client wrapper, response validation, and safety downgrade behavior.

**Architecture:** Keep Agent behavior isolated from route plumbing. A route handler validates request, calls an injectable Agent service, and returns normalized DreamState or stable API errors. Tests use fake model clients before any real model integration.

**Tech Stack:** Next.js route handlers, TypeScript, Zod, OpenAI-compatible fetch client, Vitest.

---

## File Structure

- Create `src/server/agent/types.ts`: Agent request/response types.
- Create `src/server/agent/schema.ts`: Zod response/request schema.
- Create `src/server/agent/prompt.ts`: prompt assembly.
- Create `src/server/agent/safety.ts`: unsafe output detection and downgrade helpers.
- Create `src/server/agent/model-client.ts`: OpenAI-compatible model wrapper.
- Create `src/server/agent/service.ts`: orchestration service.
- Create `src/app/api/dream-agent/route.ts`: route handler.
- Create `src/server/agent/__tests__/*.test.ts` and `src/app/api/__tests__/dream-agent-route.test.ts`.

## Task 1: Agent Types and Schemas

**Files:**
- Create: `src/server/agent/types.ts`
- Create: `src/server/agent/schema.ts`
- Create: `src/server/agent/__tests__/schema.test.ts`

- [ ] **Step 1: Write schema tests**

Test valid request, empty fragment rejection, invalid input type rejection, invalid keyword type rejection, emotion intensity outside 0-1 rejection, keywords over 12 rejection.

- [ ] **Step 2: Implement types**

Define `DreamAgentRequest`, `AgentDreamState`, `DreamKeywordType`, and `AgentResult`.

- [ ] **Step 3: Implement schemas**

Use Zod to validate request and response. Keep response strict.

- [ ] **Step 4: Run tests**

Run: `npm test -- schema`

Expected: Agent schema tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/agent/types.ts src/server/agent/schema.ts src/server/agent/__tests__/schema.test.ts
git commit -m "feat: add agent contract schemas"
```

## Task 2: Prompt Assembly

**Files:**
- Create: `src/server/agent/prompt.ts`
- Create: `src/server/agent/__tests__/prompt.test.ts`

- [ ] **Step 1: Write prompt tests**

Assert prompt includes Agent role, JSON-only instruction, one-question rule, no diagnosis rule, current state, new fragment, dreamer name, and timestamp.

- [ ] **Step 2: Implement prompt builder**

Function:

```ts
export function buildDreamAgentPrompt(input: ValidDreamAgentRequest): { system: string; user: string };
```

- [ ] **Step 3: Run tests**

Run: `npm test -- prompt`

Expected: prompt tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/server/agent/prompt.ts src/server/agent/__tests__/prompt.test.ts
git commit -m "feat: add dream agent prompt"
```

## Task 3: Safety Detection and Downgrade

**Files:**
- Create: `src/server/agent/safety.ts`
- Create: `src/server/agent/__tests__/safety.test.ts`

- [ ] **Step 1: Write safety tests**

Reject or downgrade phrases like `这说明你有心理疾病`, `这是预兆`, `你的潜意识一定`, and multi-question follow-ups.

- [ ] **Step 2: Implement unsafe detection**

Function:

```ts
export function detectUnsafeAgentState(state: AgentDreamState): SafetyFinding[];
```

- [ ] **Step 3: Implement downgrade**

Function:

```ts
export function makeSafeFallback(input: ValidDreamAgentRequest, reason: string): AgentDreamState;
```

Fallback uses safe question: `这个片段里最清楚的画面是什么？`

- [ ] **Step 4: Run tests**

Run: `npm test -- safety`

Expected: safety tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/agent/safety.ts src/server/agent/__tests__/safety.test.ts
git commit -m "feat: add agent safety downgrade"
```

## Task 4: Model Client Wrapper

**Files:**
- Create: `src/server/agent/model-client.ts`
- Create: `src/server/agent/__tests__/model-client.test.ts`

- [ ] **Step 1: Write model client tests**

Mock `fetch`. Test correct URL, Authorization header, model name, JSON body, invalid provider response rejection, and no API key in thrown error messages.

- [ ] **Step 2: Implement client**

Function:

```ts
export function createModelClient(env: NodeJS.ProcessEnv): ModelClient;
```

Method `completeJson` calls OpenAI-compatible chat completions and parses JSON content.

- [ ] **Step 3: Run tests**

Run: `npm test -- model-client`

Expected: model client tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/server/agent/model-client.ts src/server/agent/__tests__/model-client.test.ts
git commit -m "feat: add model client wrapper"
```

## Task 5: Agent Service

**Files:**
- Create: `src/server/agent/service.ts`
- Create: `src/server/agent/__tests__/service.test.ts`

- [ ] **Step 1: Write service tests**

Use fake model client. Test valid model output, invalid JSON output, unsafe output downgrade, and model failure mapping to `AGENT_UNAVAILABLE`.

- [ ] **Step 2: Implement service**

Function:

```ts
export async function runDreamAgent(input: unknown, modelClient: ModelClient): Promise<AgentServiceResult>;
```

Validate input, build prompt, call model, validate response, safety-check response, return normalized state.

- [ ] **Step 3: Run tests**

Run: `npm test -- service`

Expected: service tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/server/agent/service.ts src/server/agent/__tests__/service.test.ts
git commit -m "feat: add dream agent service"
```

## Task 6: Dream Agent Route

**Files:**
- Create: `src/app/api/dream-agent/route.ts`
- Create: `src/app/api/__tests__/dream-agent-route.test.ts`

- [ ] **Step 1: Write route tests**

Test `400` invalid request, `200` valid state, `502` model unavailable, and response body shape `{ state }`.

- [ ] **Step 2: Implement route**

Parse JSON, create model client from env, call service, return stable error format matching Data/API spec.

- [ ] **Step 3: Run route tests**

Run: `npm test -- dream-agent-route`

Expected: route tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/dream-agent/route.ts src/app/api/__tests__/dream-agent-route.test.ts
git commit -m "feat: add dream agent API route"
```

## Task 7: Contract Integration Test

**Files:**
- Create: `tests/agent-contract.integration.test.ts`

- [ ] **Step 1: Add integration test**

Use fake model response matching the PRD example. Verify route returns title, story, emotion, keywords, reflection, follow-up question, and atmosphere.

- [ ] **Step 2: Run full Agent suite**

Run: `npm test -- agent`

Expected: all Agent contract tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/agent-contract.integration.test.ts
git commit -m "test: verify agent contract"
```

## Self-Review Checklist

- Covers prompt, request validation, response schema, safety downgrade, model client, route errors, and fake-client testing.
- Does not implement UI or persistence.
- Keeps API key server-only and out of error messages.
