alter table "public"."profiles" add column "current_period_start" date;

alter table "public"."profiles" add column "next_month_start_day" smallint;

alter table "public"."profiles" add constraint "profiles_next_month_start_day_check" CHECK (((next_month_start_day IS NULL) OR ((next_month_start_day >= 1) AND (next_month_start_day <= 31)))) not valid;

alter table "public"."profiles" validate constraint "profiles_next_month_start_day_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_month_start_day_next_cycle(p_new_start_day integer)
 RETURNS public.profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid;
  v_profile public.profiles;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set next_month_start_day = greatest(1, least(31, p_new_start_day))
  where user_id = v_user
  returning * into v_profile;

  return v_profile;
end $function$
;

CREATE OR REPLACE FUNCTION public.get_or_create_budget(p_date date DEFAULT CURRENT_DATE)
 RETURNS public.budgets
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid;
  v_active_start_day int;
  v_next_start_day int;
  v_locked_period_start date;
  v_computed_start date;
  v_budget public.budgets;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select
    month_start_day,
    next_month_start_day,
    current_period_start
  into
    v_active_start_day,
    v_next_start_day,
    v_locked_period_start
  from public.profiles
  where user_id = v_user;

  if v_active_start_day is null then
    v_active_start_day := 1;
  end if;

  -- Lock the current period start if not already set
  if v_locked_period_start is null then
    v_locked_period_start := public.compute_period_start(p_date, v_active_start_day);

    update public.profiles
    set current_period_start = v_locked_period_start
    where user_id = v_user;
  end if;

  -- Compute what the current period start *would* be using the active rule
  v_computed_start := public.compute_period_start(p_date, v_active_start_day);

  -- If we've crossed into a new cycle, roll forward and (optionally) apply staged start day
  if v_computed_start <> v_locked_period_start then
    v_locked_period_start := v_computed_start;

    if v_next_start_day is not null then
      -- Apply new start day only at the boundary (future-only)
      update public.profiles
      set month_start_day = v_next_start_day,
          next_month_start_day = null,
          current_period_start = v_locked_period_start
      where user_id = v_user;
    else
      update public.profiles
      set current_period_start = v_locked_period_start
      where user_id = v_user;
    end if;
  end if;

  -- Ensure budget row exists for the locked period
  insert into public.budgets (user_id, period_start)
  values (v_user, v_locked_period_start)
  on conflict (user_id, period_start) do nothing;

  select * into v_budget
  from public.budgets
  where user_id = v_user and period_start = v_locked_period_start;

  return v_budget;
end $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_start_day int;
  v_period_start date;
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  select month_start_day into v_start_day
  from public.profiles
  where user_id = new.id;

  if v_start_day is null then
    v_start_day := 1;
  end if;

  v_period_start := public.compute_period_start(current_date, v_start_day);

  update public.profiles
  set current_period_start = v_period_start
  where user_id = new.id and current_period_start is null;

  return new;
end $function$
;


