# Finance Tracker Proto

A prototype monthly budget tracker built with Next.js and Supabase.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind
- TanStack Query
- Supabase Auth, Postgres, and Row Level Security
- shadcn/ui
- base-ui

## Project Structure

```text
app/
  auth/                  Auth pages + functions
  settings/              User settings page
  page.tsx               Main user dashboard
  layout.tsx             Root layout

components/
  blocks/                Feature-level UI
  ui/                    UI primitives

lib/
  api/                   Supabase queries, mutations and RPC wrappers
  hooks/                 React Query hooks
  supabase/              Client, server, and proxy helpers + database types
  types/                 App types
  utils/                 Common utils

supabase/
  migrations/            Database schema and SQL functions for local development
```

## Authentication Flow

- Public auth pages live under `/auth/*`, including login, sign up, forgot password, and password reset.
- Unauthenticated users are redirected to `/auth/login` by the request proxy in `lib/supabase/proxy.ts`.
- Email confirmation is handled by `app/auth/confirm/route.ts`, which verifies the Supabase token and redirects into the app.
- Authenticated users can then access the dashboard and protected routes.

## Database Overview

The Supabase schema lives in `supabase/migrations/`.

Core tables and views:

- `profiles` stores user preferences such as `month_start_day`, plus current and staged cycle fields.
- `budgets` stores one budget row per user per period.
- `income` stores income rows linked to a budget.
- `expenses` stores expense rows linked to a budget, including category, payment date, and paid status.
- `budget_summary` is a view that aggregates totals for the active budget.

Core database functions:

- `compute_period_start()` computes the budget cycle boundary.
- `get_or_create_budget()` returns the active budget for the authenticated user.
- `set_month_start_day_next_cycle()` stages a cycle-start change for the next period.
- `handle_new_user()` creates a profile row when a new auth user is created.

## Local Development

### Environment Variables

Create a local `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Steps

```bash
# Install dependancies
npm install

# Run the app locally
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

You need a Supabase project with:

- Email/password auth enabled
- the SQL migrations in `supabase/migrations/` applied
- auth redirect URLs configured for your local and deployed environments

If you use the Supabase CLI, apply the schema with your normal migration workflow.
