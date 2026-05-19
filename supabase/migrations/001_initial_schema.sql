-- profiles: one row per authenticated user
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  shop_name   text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- analyses: one row per uploaded/parsed CPR report
create table public.analyses (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  shop_name             text,
  period                text,
  period_months         integer,
  gross_sales           numeric,
  gross_profit          numeric,
  gross_profit_margin   numeric,
  avg_ticket            numeric,
  total_ros             integer,
  close_ratio           numeric,
  effective_labor_rate  numeric,
  labor_sales           numeric,
  labor_profit          numeric,
  labor_profit_pct      numeric,
  parts_sales           numeric,
  parts_profit          numeric,
  parts_profit_pct      numeric,
  hours_presented       numeric,
  hours_sold            numeric,
  gross_profit_per_hour numeric,
  total_discounts       numeric,
  total_fees            numeric,
  goals                 jsonb,
  created_at            timestamptz not null default now()
);

alter table public.analyses enable row level security;

create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);


-- index for the common query pattern: all analyses for a user, newest first
create index analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);
