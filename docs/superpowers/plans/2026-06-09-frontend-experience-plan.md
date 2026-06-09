# Frontend Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 《巡梦》 front-end Demo screens and interaction states without implementing persistence or model internals.

**Architecture:** Create a Next.js App Router frontend with focused UI components, typed client API wrappers, and mockable state seams. Page components compose shared primitives and consume API wrappers that match the Data/API and Agent specs.

**Tech Stack:** Next.js, React, TypeScript, CSS modules or global CSS variables, lucide-react, Vitest/Testing Library, Playwright for final UI verification.

---

## File Structure

- Create `package.json`: scripts and dependencies for the web app.
- Create `src/app/layout.tsx`: app shell metadata and global stylesheet import.
- Create `src/app/page.tsx`: launch page.
- Create `src/app/dream/page.tsx`: dream composing cabin.
- Create `src/app/calendar/page.tsx`: calendar page.
- Create `src/app/dreams/[id]/page.tsx`: dream detail page.
- Create `src/styles/globals.css`: design tokens, base layout, reduced motion rules.
- Create `src/types/dream.ts`: shared frontend DreamState types.
- Create `src/lib/client-api.ts`: typed fetch wrappers.
- Create `src/lib/dreamer-storage.ts`: localStorage helpers.
- Create `src/components/*`: Button, IconButton, InputBar, KeywordBubble, DreamStoryPanel, FragmentDrawer, CalendarMonth, DreamList, AppTopBar.
- Create `src/components/__tests__/*`: component behavior tests.

## Task 1: Project Frontend Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Create package and config files**

Write scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run",
    "test:ui": "playwright test"
  }
}
```

- [ ] **Step 2: Add global layout**

`src/app/layout.tsx` imports `../styles/globals.css`, sets Chinese metadata, and renders `{children}`.

- [ ] **Step 3: Run scaffold verification**

Run: `npm run build`

Expected: Next.js build succeeds or fails only because dependencies have not yet been installed.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json next.config.ts src/app/layout.tsx src/styles/globals.css
git commit -m "feat: scaffold frontend app"
```

## Task 2: Design Tokens and Base Primitives

**Files:**
- Modify: `src/styles/globals.css`
- Create: `src/components/Button.tsx`
- Create: `src/components/IconButton.tsx`
- Create: `src/components/__tests__/Button.test.tsx`

- [ ] **Step 1: Write button tests**

Assert primary button renders label, disabled state, and `aria-busy` when loading.

- [ ] **Step 2: Implement CSS tokens**

Define OKLCH CSS variables for background, surface, text, muted text, border, warm action, blue mist, rose shadow, focus ring, radius, durations, and easing. Include `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 3: Implement Button and IconButton**

Buttons support `variant="primary" | "secondary" | "ghost"`, `loading`, `disabled`, and `type`.

- [ ] **Step 4: Run tests**

Run: `npm test -- Button`

Expected: button tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/components/Button.tsx src/components/IconButton.tsx src/components/__tests__/Button.test.tsx
git commit -m "feat: add low-light UI primitives"
```

## Task 3: Shared Dream Types and Client API

**Files:**
- Create: `src/types/dream.ts`
- Create: `src/lib/client-api.ts`
- Create: `src/lib/dreamer-storage.ts`
- Create: `src/lib/__tests__/dreamer-storage.test.ts`

- [ ] **Step 1: Add DreamState types**

Mirror `Frontend Experience Spec` type definitions exactly.

- [ ] **Step 2: Add localStorage tests**

Test save, load, clear, and invalid JSON recovery for current dreamer.

- [ ] **Step 3: Implement storage helpers**

Use key `chasing-dream.currentDreamer`.

- [ ] **Step 4: Implement API wrappers**

Functions: `getOrCreateDreamer`, `runDreamAgent`, `saveDream`, `listDreams`, `getDreamDetail`. They return `{ ok: true, data } | { ok: false, error }`.

- [ ] **Step 5: Run tests**

Run: `npm test -- dreamer-storage`

Expected: storage tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/dream.ts src/lib/client-api.ts src/lib/dreamer-storage.ts src/lib/__tests__/dreamer-storage.test.ts
git commit -m "feat: add frontend dream contracts"
```

## Task 4: Launch Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/LaunchForm.tsx`
- Create: `src/components/__tests__/LaunchForm.test.tsx`

- [ ] **Step 1: Test validation**

Assert empty name disables enter and 25-character name shows validation error.

- [ ] **Step 2: Implement LaunchForm**

Use quiet copy, dreamer name input, continue-as affordance, submit loading/error states.

- [ ] **Step 3: Wire launch page**

On success, store dreamer and navigate to `/dream`.

- [ ] **Step 4: Run tests**

Run: `npm test -- LaunchForm`

Expected: launch form tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/LaunchForm.tsx src/components/__tests__/LaunchForm.test.tsx
git commit -m "feat: add dreamer launch page"
```

## Task 5: Dream Composing Cabin

**Files:**
- Modify: `src/app/dream/page.tsx`
- Create: `src/components/AppTopBar.tsx`
- Create: `src/components/DreamStoryPanel.tsx`
- Create: `src/components/InputBar.tsx`
- Create: `src/components/KeywordBubble.tsx`
- Create: `src/components/FragmentDrawer.tsx`
- Create: `src/components/__tests__/InputBar.test.tsx`

- [ ] **Step 1: Test InputBar**

Assert empty input cannot send, send loading disables controls, failed send keeps text.

- [ ] **Step 2: Implement InputBar**

Support text input, voice unsupported state, microphone permission error display, and send action.

- [ ] **Step 3: Implement visual components**

Story panel centers story. Keyword bubbles use stable positions and respect reduced motion. Fragment drawer lists fragments.

- [ ] **Step 4: Wire dream page state**

Load current dreamer, manage local DreamState, call `runDreamAgent`, update state, preserve input on failure.

- [ ] **Step 5: Run tests**

Run: `npm test -- InputBar`

Expected: input tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/dream/page.tsx src/components/AppTopBar.tsx src/components/DreamStoryPanel.tsx src/components/InputBar.tsx src/components/KeywordBubble.tsx src/components/FragmentDrawer.tsx src/components/__tests__/InputBar.test.tsx
git commit -m "feat: add dream composing cabin"
```

## Task 6: Save Flow, Calendar, and Detail Pages

**Files:**
- Modify: `src/app/dream/page.tsx`
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/app/dreams/[id]/page.tsx`
- Create: `src/components/CalendarMonth.tsx`
- Create: `src/components/DreamList.tsx`
- Create: `src/components/DreamDetail.tsx`

- [ ] **Step 1: Implement save affordance**

Disable save until `DreamState.story` and `title` exist. Generate idempotency key before save. Show loading, success, failure.

- [ ] **Step 2: Implement CalendarMonth**

Render month grid, dream count marker, selected date, empty state.

- [ ] **Step 3: Implement DreamDetail**

Render title, story, emotion, keywords, fragments, gentle reflection, and back links.

- [ ] **Step 4: Add focused tests**

Test save disabled with empty story and calendar only opens dates with dreams.

- [ ] **Step 5: Run build and tests**

Run: `npm test`

Expected: all frontend unit tests pass.

Run: `npm run build`

Expected: production build passes.

- [ ] **Step 6: Commit**

```bash
git add src/app/dream/page.tsx src/app/calendar/page.tsx src/app/dreams/[id]/page.tsx src/components/CalendarMonth.tsx src/components/DreamList.tsx src/components/DreamDetail.tsx
git commit -m "feat: add dream save and review pages"
```

## Task 7: Responsive and Accessibility Verification

**Files:**
- Modify: `src/styles/globals.css`
- Create: `tests/frontend-accessibility.spec.ts`

- [ ] **Step 1: Add Playwright checks**

Check launch, dream, calendar, and detail pages at desktop and mobile widths. Verify input visible, no horizontal overflow, focus ring visible, reduced motion CSS active.

- [ ] **Step 2: Run browser verification**

Run: `npm run test:ui`

Expected: Playwright tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css tests/frontend-accessibility.spec.ts
git commit -m "test: verify frontend responsiveness"
```

## Self-Review Checklist

- Covers launch, composing, fragments, calendar, detail, voice, errors, motion, responsive behavior.
- Does not implement backend persistence or Agent internals.
- Uses focused files and component tests before implementation.
