# Data and API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SQLite persistence and server endpoints for dreamer identity, dream saving, dream listing, and dream detail isolation.

**Architecture:** Use focused server modules for database connection, migrations, repositories, validators, and route handlers. All dream reads require `dreamerId`, and tests prove cross-dreamer isolation.

**Tech Stack:** Next.js route handlers, TypeScript, SQLite (`better-sqlite3` or project-approved equivalent), Zod, Vitest.

---

## File Structure

- Create `src/server/db/connection.ts`: open SQLite database and ensure `data/` directory exists.
- Create `src/server/db/migrate.ts`: initialize schema.
- Create `src/server/db/dreamers.ts`: dreamer repository.
- Create `src/server/db/dreams.ts`: dreams repository.
- Create `src/server/api/errors.ts`: stable API error response helpers.
- Create `src/server/api/schemas.ts`: request validation schemas.
- Create `src/app/api/dreamers/route.ts`: `POST /api/dreamers`.
- Create `src/app/api/dreams/route.ts`: `POST` and `GET /api/dreams`.
- Create `src/app/api/dreams/[id]/route.ts`: `GET /api/dreams/:id`.
- Create `src/server/db/__tests__/*.test.ts` and `src/app/api/**/__tests__/*.test.ts`.

## Task 1: Database Connection and Migration

**Files:**
- Create: `src/server/db/connection.ts`
- Create: `src/server/db/migrate.ts`
- Create: `src/server/db/__tests__/migrate.test.ts`

- [ ] **Step 1: Write migration test**

Test that `migrate(db)` creates `dreamers` and `dreams` tables with expected columns, including `dreamer_id` and `idempotency_key`.

- [ ] **Step 2: Implement connection**

Open `data/chasing-dream.sqlite` by default. For tests, allow injected file path or in-memory database.

- [ ] **Step 3: Implement migration**

Execute exact SQL from `Data and API Spec`, plus index on `dreams(dreamer_id, dream_date)` and unique index on `(dreamer_id, idempotency_key)` where idempotency key is not null.

- [ ] **Step 4: Run tests**

Run: `npm test -- migrate`

Expected: migration test passes.

- [ ] **Step 5: Commit**

```bash
git add src/server/db/connection.ts src/server/db/migrate.ts src/server/db/__tests__/migrate.test.ts
git commit -m "feat: initialize sqlite schema"
```

## Task 2: Dreamer Repository

**Files:**
- Create: `src/server/db/dreamers.ts`
- Create: `src/server/db/__tests__/dreamers.test.ts`

- [ ] **Step 1: Write dreamer repository tests**

Test create new dreamer, reuse existing name, trim name, reject invalid name, update `last_seen_at`.

- [ ] **Step 2: Implement repository**

Function:

```ts
export async function getOrCreateDreamer(input: { name: string }): Promise<{ id: string; name: string }>;
```

- [ ] **Step 3: Run tests**

Run: `npm test -- dreamers`

Expected: dreamer tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/server/db/dreamers.ts src/server/db/__tests__/dreamers.test.ts
git commit -m "feat: add dreamer repository"
```

## Task 3: Dreams Repository

**Files:**
- Create: `src/server/db/dreams.ts`
- Create: `src/server/db/__tests__/dreams.test.ts`

- [ ] **Step 1: Write isolation tests**

Create two dreamers. Save a dream for dreamer A. Assert dreamer B list is empty and detail lookup for A dream with B id returns null.

- [ ] **Step 2: Write save/list/detail tests**

Test JSON fields round trip and duplicate idempotency key returns existing dream instead of inserting another row.

- [ ] **Step 3: Implement repository**

Functions:

```ts
export async function saveDream(input: SaveDreamInput): Promise<SavedDream>;
export async function listDreams(dreamerId: string): Promise<DreamSummary[]>;
export async function getDreamDetail(input: { id: string; dreamerId: string }): Promise<SavedDream | null>;
```

- [ ] **Step 4: Run tests**

Run: `npm test -- dreams`

Expected: dreams tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/db/dreams.ts src/server/db/__tests__/dreams.test.ts
git commit -m "feat: add dream repository"
```

## Task 4: API Validation and Error Helpers

**Files:**
- Create: `src/server/api/errors.ts`
- Create: `src/server/api/schemas.ts`
- Create: `src/server/api/__tests__/schemas.test.ts`

- [ ] **Step 1: Write schema tests**

Test dreamer name, save payload, dreamerId query, and invalid JSON-shaped fields.

- [ ] **Step 2: Implement schemas**

Use Zod schemas for dreamer request, save request, dream list query, detail query, and DreamState fields.

- [ ] **Step 3: Implement error helpers**

Function:

```ts
export function jsonError(code: ApiErrorCode, message: string, status: number): Response;
```

- [ ] **Step 4: Run tests**

Run: `npm test -- schemas`

Expected: schema tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/api/errors.ts src/server/api/schemas.ts src/server/api/__tests__/schemas.test.ts
git commit -m "feat: add API validation helpers"
```

## Task 5: Route Handlers

**Files:**
- Create: `src/app/api/dreamers/route.ts`
- Create: `src/app/api/dreams/route.ts`
- Create: `src/app/api/dreams/[id]/route.ts`
- Create: `src/app/api/__tests__/dream-routes.test.ts`

- [ ] **Step 1: Write route tests**

Test successful dreamer creation, invalid dreamer name `400`, save dream, list current dreamer only, detail current dreamer only, cross-dreamer detail `404`.

- [ ] **Step 2: Implement `POST /api/dreamers`**

Validate request, call repository, return JSON.

- [ ] **Step 3: Implement `POST /api/dreams` and `GET /api/dreams`**

Validate payload/query, call repository, map repository errors to stable API errors.

- [ ] **Step 4: Implement `GET /api/dreams/[id]`**

Validate dreamerId, query by both id and dreamerId, return `404` when missing.

- [ ] **Step 5: Run tests**

Run: `npm test -- dream-routes`

Expected: route tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/dreamers/route.ts src/app/api/dreams/route.ts src/app/api/dreams/[id]/route.ts src/app/api/__tests__/dream-routes.test.ts
git commit -m "feat: add dream data API routes"
```

## Task 6: Integration Verification

**Files:**
- Create: `tests/data-api.integration.test.ts`

- [ ] **Step 1: Add integration test**

Exercise the full flow: create 小林, save dream, list dream, get detail, create 小周, prove 小周 cannot access 小林 dream.

- [ ] **Step 2: Run full API test suite**

Run: `npm test -- data-api`

Expected: all Data/API tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/data-api.integration.test.ts
git commit -m "test: verify data API isolation"
```

## Self-Review Checklist

- Covers SQLite schema, migrations, dreamer reuse, save/list/detail, idempotency, error format, cross-dreamer isolation.
- Does not implement frontend UI or Agent prompting.
- Every task has tests before implementation and a commit point.
