# FocusFlow

FocusFlow is a minimalist, immersive focus timer built with Next.js App Router.
It combines a distraction-light Pomodoro experience, task flow management, Clerk auth, and Supabase sync.

## Highlights

- Focus-first timer UI with keyboard shortcuts and animated progress states.
- Three background modes: gradient, lo-fi video, and wallpaper.
- Task management with sections (today, week, backlog) and optional duration/break settings.
- Clerk authentication with protected routes and modal sign-in.
- Supabase integration for authenticated data sync.
- PWA support enabled in production builds.
- Dev-only diagnostics panel for DB and API health checks.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Zustand (persisted local state)
- Clerk (auth)
- Supabase (data)
- Framer Motion (UI animation)

## Prerequisites

- Node.js 20+ recommended
- npm (or equivalent package manager)
- Clerk project
- Supabase project

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Optional Clerk URLs (set for your deployment domain as needed)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Legacy fallback key supported by this codebase (optional)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the primary key used by the app.
- If `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, the app will try `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- Configure a Clerk JWT template named `supabase` so authenticated requests can attach `Authorization: Bearer <token>` for Supabase.
- The quote endpoint currently uses a public upstream service and does not require an API key.

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## App Routes

- `/` focus screen (public)
- `/login` auth screen (public)
- `/signup` auth screen (public)
- `/dashboard` analytics/dashboard view (protected)
- `/api/quotes` random quote endpoint (public)
- `/api/health/supabase` Supabase health probe endpoint (protected)

Route protection is handled through Clerk middleware in `proxy.ts`.

## Keyboard Shortcuts (Focus Screen)

- `Space`: start/pause timer
- `Ctrl + Space`: toggle task panel

Shortcuts are ignored while typing in input/textarea fields.

## Persistence and Sync

- Local timer state is persisted with key: `focus-flow-timer`.
- Local task state is persisted with key: `focus-flow-tasks`.
- Signed-in users can sync task/timer data through Supabase-backed flows.

## PWA Behavior

PWA integration is configured with `@ducanh2912/next-pwa`:

- Enabled in production
- Disabled in development

Build and run production to validate service worker behavior:

```bash
npm run build
npm run start
```

## Current State and Scope

- Core focus experience and task flow are implemented.
- Dashboard widgets are currently mock-data UI.
- Supabase health endpoint is included for operational checks.

