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

  -- Prefer the most recent prior budget that can actually contribute
  -- carry-forward rows. This skips empty intermediate budgets created by
  -- the earlier rollover bug.
  select b.id
  into v_previous_budget_id
  from public.budgets b
  where b.user_id = v_user
    and b.period_start < p_period_start
    and (
      exists (
        select 1
        from public.expenses e
        where e.budget_id = b.id
      )
      or exists (
        select 1
        from public.income i
        where i.budget_id = b.id
          and i.is_monthly = true
      )
    )
  order by b.period_start desc
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
