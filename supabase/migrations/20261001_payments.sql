-- ============================================================
-- Kaziin — Payment Infrastructure (Daraja M-Pesa)
-- Run this in your Supabase SQL editor
-- ============================================================

-- Payment requests table (tracks STK Push initiations)
create table if not exists public.payment_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  merchant_request_id   text,
  checkout_request_id   text unique,
  phone                 text not null,
  amount                numeric(10, 2) not null,
  account_reference     text not null,
  transaction_desc      text,
  status                text not null default 'pending', -- pending | completed | failed
  mpesa_receipt_number  text,
  result_code           integer,
  result_desc           text,
  transaction_date      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Job post payments (when employers pay to post a job)
create table if not exists public.job_post_payments (
  id                    uuid primary key default gen_random_uuid(),
  payment_request_id    uuid references public.payment_requests(id) on delete set null,
  user_id               uuid not null references auth.users(id) on delete cascade,
  job_id                uuid references public.jobs(id) on delete set null,
  amount                numeric(10, 2),
  receipt               text,
  created_at            timestamptz not null default now()
);

-- Subscriptions (recurring plans)
create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan          text not null,             -- e.g. 'recruiter_monthly', 'candidate_pro'
  status        text not null default 'active', -- active | cancelled | expired
  receipt       text,
  activated_at  timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, plan)
);

-- Career support payments (when candidates pay for global career services)
create table if not exists public.career_support_payments (
  id                    uuid primary key default gen_random_uuid(),
  payment_request_id    uuid references public.payment_requests(id) on delete set null,
  user_id               uuid not null references auth.users(id) on delete cascade,
  amount                numeric(10, 2),
  receipt               text,
  service_type          text,   -- e.g. 'global_application', 'skills_assessment'
  created_at            timestamptz not null default now()
);

-- RLS: users can only read their own records
alter table public.payment_requests     enable row level security;
alter table public.job_post_payments    enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.career_support_payments enable row level security;

create policy "Users see own payment requests"
  on public.payment_requests for select
  using (auth.uid() = user_id);

create policy "Users see own job post payments"
  on public.job_post_payments for select
  using (auth.uid() = user_id);

create policy "Users see own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users see own career support payments"
  on public.career_support_payments for select
  using (auth.uid() = user_id);

-- Service role can write (callbacks run server-side with service role key)
create policy "Service role can manage payment requests"
  on public.payment_requests for all
  using (true)
  with check (true);

create policy "Service role can manage job post payments"
  on public.job_post_payments for all
  using (true)
  with check (true);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

create policy "Service role can manage career support payments"
  on public.career_support_payments for all
  using (true)
  with check (true);
