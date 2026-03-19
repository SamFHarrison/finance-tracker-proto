# Contributing

## Supabase Workflow

This project uses SQL migrations in `supabase/migrations/` as the source of truth for database schema and database functions.

General rules:

- Make database changes in a new migration file. Do not edit an old migration that has already been applied anywhere important.
- If a fix is needed after a migration has been applied, add a new migration that amends the schema or function.
- Keep `lib/supabase/types/database.ts` in sync with schema changes.

## Local Supabase

Start the local Supabase stack from the repo root:

```bash
supabase start
```

Useful local endpoints for this repo:

- API: `http://127.0.0.1:54321`
- DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`

## Create A New Migration

Generate a new migration:

```bash
supabase migration new your_migration_name
```

Then add the SQL to the new file in `supabase/migrations/`.

Use timestamped, descriptive names, for example:

```text
20260319213000_fix_budget_rollover_population.sql
```

## Apply Migrations Locally

If you want to keep your current local data and only apply new pending migrations:

```bash
supabase migration up
```

Use this for normal iteration when your local database already has useful test data.

## Reset Local Database

If you want to rebuild your local database from scratch using the migration history:

```bash
supabase db reset
```

Important:

- `supabase db reset` is destructive for the local database.
- This repo has seed loading enabled in `supabase/config.toml`, so make sure `supabase/seed.sql` exists before resetting.

## Back Up Local Data Before Reset

If needed:

```bash
touch supabase/seed.sql
```

If you want to keep your local data before running `supabase db reset`, dump it first:

```bash
supabase db dump --local --data-only > supabase/seed.sql
```

That lets you rebuild the local database and then re-seed with your current local data.

## Recommended Local Flow

For most schema or function work:

1. `supabase start`
2. `supabase migration new your_change_name`
3. Edit the generated SQL file
4. `supabase migration up`
5. Verify in Supabase Studio and in the app

## Verify Local Changes

After applying a migration, verify in one or more of these ways:

- Open Supabase Studio at `http://127.0.0.1:54323`
- Run SQL checks in the Studio SQL editor
- Open the app and exercise the affected flow end-to-end

For function-driven behavior, prefer verifying through the app as well as SQL.

## Push Migrations To Remote

First authenticate and link the repo to the correct Supabase project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Your project ref is the slug from:

```text
https://supabase.com/dashboard/project/<project-ref>
```

Before pushing local migrations, check whether the remote database has schema changes that are not captured locally.

If remote drift may exist:

```bash
supabase db pull
```

Review the generated migration carefully before pushing anything else.

When ready to push local migrations:

```bash
supabase db push --dry-run
supabase db push
supabase migration list
```

Notes:

- `supabase db push` applies pending local migrations to the linked remote project.
- `supabase migration list` is a useful sanity check after pushing.
- Do not use `--include-seed` unless you explicitly want seed data on the remote database.

## Safe Team Practices

- Never rely on manual dashboard edits as the permanent source of truth.
- If you do make a dashboard change, capture it in a migration immediately.
- Prefer adding a corrective migration over mutating migration history.
- Test migrations locally before pushing them to remote.

## Useful References

- Local development overview: <https://supabase.com/docs/guides/local-development/overview>
- CLI getting started: <https://supabase.com/docs/guides/local-development/cli/getting-started>
- Managing environments: <https://supabase.com/docs/guides/deployment/managing-environments>
