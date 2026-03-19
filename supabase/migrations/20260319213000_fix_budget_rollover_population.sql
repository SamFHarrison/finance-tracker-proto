alter table public.expenses
  add column payment_day smallint;

update public.expenses
set payment_day = extract(day from payment_date)::smallint
where payment_day is null;

alter table public.expenses
  alter column payment_day set not null;

alter table public.expenses
  add constraint expenses_payment_day_check
  check (payment_day >= 1 and payment_day <= 31);

create or replace function public.compute_expense_payment_date_for_cycle(
  p_period_start date,
  p_month_start_day integer,
  p_payment_day integer
)
returns date
language plpgsql
immutable
set search_path to 'public'
as $function$
declare
  v_start_day int := greatest(1, least(31, coalesce(p_month_start_day, 1)));
  v_payment_day int := greatest(1, least(31, coalesce(p_payment_day, 1)));
  v_month_first date := date_trunc('month', p_period_start)::date;
  v_month_last date := (
    date_trunc('month', p_period_start)::date + interval '1 month - 1 day'
  )::date;
  v_next_month_first date := (
    date_trunc('month', p_period_start)::date + interval '1 month'
  )::date;
  v_next_month_last date := (
    date_trunc('month', p_period_start)::date + interval '2 month - 1 day'
  )::date;
  v_next_period_start date;
  v_candidate_current date;
  v_candidate_next date;
begin
  v_next_period_start := public.compute_period_start(
    v_next_month_first,
    v_start_day
  );

  v_candidate_current := make_date(
    extract(year from v_month_first)::int,
    extract(month from v_month_first)::int,
    least(v_payment_day, extract(day from v_month_last)::int)
  );

  v_candidate_next := make_date(
    extract(year from v_next_month_first)::int,
    extract(month from v_next_month_first)::int,
    least(v_payment_day, extract(day from v_next_month_last)::int)
  );

  if v_candidate_current >= p_period_start
     and v_candidate_current < v_next_period_start then
    return v_candidate_current;
  end if;

  if v_candidate_next >= p_period_start
     and v_candidate_next < v_next_period_start then
    return v_candidate_next;
  end if;

  if v_candidate_current >= p_period_start then
    return v_candidate_current;
  end if;

  if v_candidate_next >= p_period_start then
    return v_candidate_next;
  end if;

  return p_period_start;
end $function$;

create or replace function public.populate_budget_with_recurring_items(
  p_budget_id uuid,
  p_period_start date,
  p_month_start_day integer
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user uuid;
  v_previous_budget_id uuid;
begin
  select user_id
  into v_user
  from public.budgets
  where id = p_budget_id;

  if v_user is null then
    return;
  end if;

  select id
  into v_previous_budget_id
  from public.budgets
  where user_id = v_user
    and period_start < p_period_start
  order by period_start desc
  limit 1;

  if v_previous_budget_id is null then
    return;
  end if;

  with source_rows as (
    select
      i.name,
      i.amount_pence,
      i.is_monthly,
      row_number() over (
        partition by i.name, i.amount_pence, i.is_monthly
        order by i.created_at, i.id
      ) as rn
    from public.income i
    where i.budget_id = v_previous_budget_id
      and i.is_monthly = true
  ),
  existing_rows as (
    select
      i.name,
      i.amount_pence,
      i.is_monthly,
      count(*) as existing_count
    from public.income i
    where i.budget_id = p_budget_id
    group by i.name, i.amount_pence, i.is_monthly
  )
  insert into public.income (
    budget_id,
    name,
    amount_pence,
    is_monthly
  )
  select
    p_budget_id,
    s.name,
    s.amount_pence,
    s.is_monthly
  from source_rows s
  left join existing_rows e
    on e.name = s.name
   and e.amount_pence = s.amount_pence
   and e.is_monthly = s.is_monthly
  where coalesce(e.existing_count, 0) < s.rn;

  with source_rows as (
    select
      e.name,
      e.amount_pence,
      e.category,
      e.payment_day,
      public.compute_expense_payment_date_for_cycle(
        p_period_start,
        p_month_start_day,
        e.payment_day
      ) as payment_date,
      row_number() over (
        partition by e.name, e.amount_pence, e.category, e.payment_day
        order by e.created_at, e.id
      ) as rn
    from public.expenses e
    where e.budget_id = v_previous_budget_id
  ),
  existing_rows as (
    select
      e.name,
      e.amount_pence,
      e.category,
      e.payment_day,
      count(*) as existing_count
    from public.expenses e
    where e.budget_id = p_budget_id
    group by e.name, e.amount_pence, e.category, e.payment_day
  )
  insert into public.expenses (
    budget_id,
    name,
    amount_pence,
    category,
    payment_day,
    payment_date,
    is_paid
  )
  select
    p_budget_id,
    s.name,
    s.amount_pence,
    s.category,
    s.payment_day,
    s.payment_date,
    false
  from source_rows s
  left join existing_rows e
    on e.name = s.name
   and e.amount_pence = s.amount_pence
   and e.category = s.category
   and e.payment_day = s.payment_day
  where coalesce(e.existing_count, 0) < s.rn;
end $function$;

create or replace function public.get_or_create_budget(
  p_date date default current_date
)
returns public.budgets
language plpgsql
security definer
set search_path to 'public'
as $function$
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
    v_locked_period_start := public.compute_period_start(
      p_date,
      v_active_start_day
    );

    update public.profiles
    set current_period_start = v_locked_period_start
    where user_id = v_user;
  end if;

  if v_next_start_day is null
     and v_locked_period_start is not null
     and public.compute_period_start(
       v_locked_period_start,
       v_active_start_day
     ) <> v_locked_period_start then
    v_recovered_start_day := extract(day from v_locked_period_start)::int;

    select max(period_start)
    into v_previous_period_start
    from public.budgets
    where user_id = v_user
      and period_start < v_locked_period_start
      and extract(day from period_start)::int = v_recovered_start_day;

    if v_previous_period_start is null then
      select max(period_start)
      into v_previous_period_start
      from public.budgets
      where user_id = v_user
        and period_start < v_locked_period_start;
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

    select min(period_start)
    into v_stray_future_period_start
    from public.budgets
    where user_id = v_user
      and period_start > v_locked_period_start
      and period_start < v_next_active_cycle_start;

    if v_stray_future_period_start is not null then
      v_recovered_start_day := extract(day from v_stray_future_period_start)::int;

      select max(period_start)
      into v_previous_period_start
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
      v_locked_period_start := public.compute_period_start(
        p_date,
        v_next_start_day
      );
      v_active_start_day := v_next_start_day;
      v_next_start_day := null;

      update public.profiles
      set month_start_day = v_active_start_day,
          next_month_start_day = v_next_start_day,
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

  select *
  into v_budget
  from public.budgets
  where user_id = v_user
    and period_start = v_locked_period_start;

  perform public.populate_budget_with_recurring_items(
    v_budget.id,
    v_locked_period_start,
    v_active_start_day
  );

  return v_budget;
end $function$;
