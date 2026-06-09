# Data and API Spec

## Scope

Build the persistence and server API layer for 《巡梦》 Demo. This includes project backend routes, SQLite access, schema initialization, dreamer isolation, dream save/list/detail endpoints, validation, and operational error handling.

This spec excludes frontend rendering and model prompt behavior. The Agent endpoint route shape is covered here only as integration plumbing; model behavior and schema repair are owned by the Agent contract spec.

## Architecture

- Use Next.js API routes or route handlers as the server boundary.
- Use SQLite at `data/chasing-dream.sqlite`.
- Keep database access in focused modules under `src/server/db/`.
- Keep request validation in shared server schemas.
- Return JSON errors with stable codes for frontend display.

## Data Model

### `dreamers`

```sql
CREATE TABLE IF NOT EXISTS dreamers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);
```

### `dreams`

```sql
CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY,
  dreamer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  dream_date TEXT NOT NULL,
  story TEXT NOT NULL,
  primary_emotion TEXT,
  emotion_intensity REAL,
  emotion_arc TEXT,
  keywords TEXT,
  symbols TEXT,
  fragments TEXT,
  gentle_reflection TEXT,
  follow_up_question TEXT,
  atmosphere TEXT,
  idempotency_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (dreamer_id) REFERENCES dreamers(id)
);
```

`emotion_arc`, `keywords`, `symbols`, `fragments`, and `atmosphere` are JSON strings in SQLite and typed objects at API boundaries.

## API Endpoints

### `POST /api/dreamers`

Request:

```json
{ "name": "小林" }
```

Rules:

- Trim whitespace.
- Reject empty or longer than 24 characters.
- Existing name returns existing dreamer and updates `last_seen_at`.
- New name creates dreamer with UUID.

Response:

```json
{ "id": "dreamer_uuid", "name": "小林" }
```

### `POST /api/dreams`

Request contains:

- `dreamerId`
- `state`
- optional `idempotencyKey`

Rules:

- Reject missing dreamer.
- Reject empty `title` or `story`.
- Store all structured fields as JSON where needed.
- Prevent duplicate save from same idempotency key for the same dreamer.

### `GET /api/dreams?dreamerId=...`

Returns only current dreamer's dream summaries, newest first:

```json
{
  "dreams": [
    {
      "id": "dream_uuid",
      "title": "蓝黑色的桥",
      "dreamDate": "2026-06-09",
      "primaryEmotion": "不舍",
      "createdAt": "2026-06-09T01:24:00.000Z"
    }
  ]
}
```

### `GET /api/dreams/:id?dreamerId=...`

Rules:

- Query by both `id` and `dreamer_id`.
- Return `404` if missing or owned by another dreamer.
- Return full persisted DreamState.

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "梦者名不能为空。"
  }
}
```

Codes:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `DREAMER_NOT_FOUND`
- `DATABASE_ERROR`
- `AGENT_UNAVAILABLE`
- `AGENT_INVALID_RESPONSE`

## Security and Privacy

- Every dreams list/detail query must include `dreamerId`.
- Never return dreams without a matching `dreamer_id`.
- Do not log full dream content by default.
- Never log full environment secrets.
- Rendered user/model content must be escaped by frontend framework defaults.

## Acceptance Criteria

- Database initializes on first server use.
- Same dreamer name reuses the same dreamer row.
- Different dreamers cannot list or fetch each other's dreams.
- Invalid names and invalid save payloads return `400`.
- Missing dreams or cross-dreamer details return `404`.
- Saved dream survives server restart because it is written to SQLite.
- Duplicate save with same idempotency key does not create duplicate rows.
