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
  v_next_active_cycle_start date;
  v_stray_future_period_start date;
  v_recovered_start_day int;
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

  if v_locked_period_start is null then
    v_locked_period_start := public.compute_period_start(p_date, v_active_start_day);

    update public.profiles
    set current_period_start = v_locked_period_start
    where user_id = v_user;
  end if;

  if v_next_start_day is null
     and v_locked_period_start is not null
     and public.compute_period_start(v_locked_period_start, v_active_start_day) <> v_locked_period_start then
    -- Recover from a premature rollover by stepping back to the previous budget
    -- on the same cadence as the incorrectly locked budget.
    v_recovered_start_day := extract(day from v_locked_period_start)::int;

    select max(period_start) into v_previous_period_start
    from public.budgets
    where user_id = v_user
      and period_start < v_locked_period_start
      and extract(day from period_start)::int = v_recovered_start_day;

    if v_previous_period_start is null then
      select max(period_start) into v_previous_period_start
      from public.budgets
      where user_id = v_user and period_start < v_locked_period_start;
    end if;

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

  if v_next_start_day is null and v_locked_period_start is not null then
    -- If a future budget exists before the next legitimate boundary, we already
    -- partially recovered to the wrong intermediate budget. Step back again
    -- using that stray future row to infer the old cadence.
    v_pending_month_first := (
      date_trunc('month', v_locked_period_start)::date + interval '1 month'
    )::date;
    v_pending_month_last := (
      v_pending_month_first + interval '1 month - 1 day'
    )::date;
    v_next_active_cycle_start := v_pending_month_first
      + (
        least(v_active_start_day, extract(day from v_pending_month_last)::int) - 1
      );

    select min(period_start) into v_stray_future_period_start
    from public.budgets
    where user_id = v_user
      and period_start > v_locked_period_start
      and period_start < v_next_active_cycle_start;

    if v_stray_future_period_start is not null then
      v_recovered_start_day := extract(day from v_stray_future_period_start)::int;

      select max(period_start) into v_previous_period_start
      from public.budgets
      where user_id = v_user
        and period_start < v_locked_period_start
        and extract(day from period_start)::int = v_recovered_start_day;

      if v_previous_period_start is not null then
        v_next_start_day := v_active_start_day;
        v_active_start_day := v_recovered_start_day;
        v_locked_period_start := v_previous_period_start;

        update public.profiles
        set month_start_day = v_active_start_day,
            next_month_start_day = v_next_start_day,
            current_period_start = v_locked_period_start
        where user_id = v_user;
      end if;
    end if;
  end if;

  if v_next_start_day is not null then
    v_next_start_day := greatest(1, least(31, v_next_start_day));

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
