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
  v_previous_period_start date;
  v_computed_start date;
  v_pending_cycle_start date;
  v_pending_month_first date;
  v_pending_month_last date;
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

  -- Lock the current period start if not already set.
  if v_locked_period_start is null then
    v_locked_period_start := public.compute_period_start(p_date, v_active_start_day);

    update public.profiles
    set current_period_start = v_locked_period_start
    where user_id = v_user;
  end if;

  if v_next_start_day is null
     and v_locked_period_start is not null
     and public.compute_period_start(v_locked_period_start, v_active_start_day) <> v_locked_period_start then
    -- Recover from a previously applied premature rollover by restoring the
    -- last real budget and re-staging the current start-day as the pending rule.
    select max(period_start) into v_previous_period_start
    from public.budgets
    where user_id = v_user and period_start < v_locked_period_start;

    if v_previous_period_start is not null then
      v_next_start_day := v_active_start_day;
      v_active_start_day := extract(day from v_previous_period_start)::int;
      v_locked_period_start := v_previous_period_start;

      update public.profiles
      set month_start_day = v_active_start_day,
          next_month_start_day = v_next_start_day,
          current_period_start = v_locked_period_start
      where user_id = v_user;
    end if;
  end if;

  if v_next_start_day is not null then
    v_next_start_day := greatest(1, least(31, v_next_start_day));

    -- A staged start-day change takes effect at the next cycle boundary only.
    -- That boundary is the staged day in the calendar month after the current period.
    v_pending_month_first := (
      date_trunc('month', v_locked_period_start)::date + interval '1 month'
    )::date;
    v_pending_month_last := (
      v_pending_month_first + interval '1 month - 1 day'
    )::date;
    v_pending_cycle_start := v_pending_month_first
      + (
        least(v_next_start_day, extract(day from v_pending_month_last)::int) - 1
      );

    if p_date >= v_pending_cycle_start then
      v_locked_period_start := public.compute_period_start(p_date, v_next_start_day);

      update public.profiles
      set month_start_day = v_next_start_day,
          next_month_start_day = null,
          current_period_start = v_locked_period_start
      where user_id = v_user;
    end if;
  else
    -- No staged change: follow the active cycle rule as normal.
    v_computed_start := public.compute_period_start(p_date, v_active_start_day);

    if v_computed_start <> v_locked_period_start then
      v_locked_period_start := v_computed_start;

      update public.profiles
      set current_period_start = v_locked_period_start
      where user_id = v_user;
    end if;
  end if;

  insert into public.budgets (user_id, period_start)
  values (v_user, v_locked_period_start)
  on conflict (user_id, period_start) do nothing;

  select * into v_budget
  from public.budgets
  where user_id = v_user and period_start = v_locked_period_start;

  return v_budget;
end $function$;
