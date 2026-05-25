# Ascenda — Claude Code Project Context

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run typecheck    # tsc --noEmit (run after every change)
npm run lint         # ESLint
npm run test         # Jest (note: CI has a known pre-existing Jest/Request failure — does not block Vercel)

# Regenerate Supabase TypeScript types after schema changes
npm run supabase:types   # requires SUPABASE_PROJECT_ID in env
```

## Architecture

**Next.js 14 App Router** — `src/` is the root (path alias `@/*` maps to `./`).

### Routes
| Route | Who | Notes |
|---|---|---|
| `/dashboard` | Student | Home after login |
| `/university-search/*` | Student | Search hub, results, filters |
| `/matches` | Student | Ranked programme matches |
| `/course/[id]` | Student | Programme detail page |
| `/shortlist` | Student | Saved programmes (localStorage) |
| `/applications` | Student | Priority board (Greg's feature) |
| `/applications/tasks` | Student | Task tracker |
| `/applications/documents` | Student | Document manager |
| `/profile` | Student | Profile wizard & completion |
| `/scholarships` | Student | Scholarship explorer |
| `/toolbox` | Student | Essay workshop, practice tools |
| `/counsellor` | Counsellor | Help requests, student management |
| `/admin` | Admin only | Guarded by `profile.role === 'admin'` |

### Two-role system
- **Student** (`role = 'student'`): uses the full student-facing UI
- **Counsellor** (`role = 'counsellor'`): `/counsellor` dashboard; help requests appear here
- Demo user toggle via `src/lib/demo/` utilities — the demo profile is Greg (student)

### Key directories
```
src/
  app/                    # Next.js App Router pages & API routes
  components/
    layout/               # Shell, SectionNav, PageHero, navigation.ts
    applications/         # Priority board, help modal, calendar
    help/                 # Help thread drawer, help request modal
    toolbox/              # Essay workshop, building blocks
    ui/                   # shadcn/ui primitives
  lib/
    supabase/
      server.ts           # createServerSupabaseClient (Server Components)
                          # createRouteHandlerSupabaseClient (API routes)
      client.ts           # createClientSupabaseClient (Client Components)
    types/
      database.ts         # Auto-generated Supabase types (may lag schema)
      demo-tables.ts      # Manual types for tables added after last generation
    demo/
      help-request-client.ts  # Typed wrappers; casts through `any` intentionally
    matching/             # Programme scoring & tiering logic
```

## Supabase

- **Project ref:** `alpkbobbasxvubogkark`
- **MCP:** configured in `.mcp.json` → `https://mcp.supabase.com/mcp`
- **Dashboard:** https://supabase.com/dashboard/project/alpkbobbasxvubogkark

### Client factories — use the right one
| Factory | File | Use when |
|---|---|---|
| `createServerSupabaseClient()` | `lib/supabase/server.ts` | Server Components, `page.tsx`, `layout.tsx` |
| `createRouteHandlerSupabaseClient()` | `lib/supabase/server.ts` | API route handlers (`route.ts`) |
| `createClientSupabaseClient()` | `lib/supabase/client.ts` | Client Components (`'use client'`) |

### Key tables
- `programs` + `universities` — core catalogue (119k+ programmes)
- `profiles` — user records; `role` field: `'student' | 'counsellor' | 'admin'`
- `applications` — student application tracker
- `help_requests`, `help_messages`, `help_notes`, `help_meetings` — counsellor help system
- `notifications` — per-profile notification feed
- `student_personal_information`, `student_academic_input`, `student_subjects`, `student_lifestyle_preference`, `student_scores` — profile data
- `shortlisted_programs` — **does NOT exist in DB**; shortlist uses `localStorage`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
SUPABASE_PROJECT_ID
```

## Deployment

- **Vercel project:** https://ascenda-ashy.vercel.app
- **Branch:** `main` → auto-deploys to production
- **CI:** GitHub Actions has a pre-existing Jest failure (`ReferenceError: Request is not defined` in route handlers) — does not block Vercel deploys, safe to ignore

## Gotchas

- **`database.ts` lags the real schema.** Tables added in migrations after the last `supabase gen types` run are not typed. Workaround: add manual types to `src/lib/types/demo-tables.ts` and cast through `any` in one wrapper file (see `lib/demo/help-request-client.ts`).
- **Counsellor notifications fire via DB trigger**, not application code. Don't add `insertNotification` calls on the student side — the trigger handles the counsellor copy.
- **PostgREST `.or()` with spaces in ilike values crashes.** Use `.in('id', [...])` instead of constructing `.or()` strings with university names that contain spaces.
- **`shortlisted_programs` table does not exist** — shortlist is localStorage-only.
- **`recognition_score`** column on `universities` — used by search suggestions to prioritise well-known unis (threshold ≥ 5).
- **PageHero** (`src/components/layout/page-hero.tsx`) — shared header used on every student-facing page. Tone prop: `'student'` (default warm) | `'counsellor'` (operational).
- **`@/*` path alias** maps to `src/` — use `@/components/...`, `@/lib/...` etc.
