-- Optional MycoTech DEMO persistence. Run in the Supabase SQL editor.
-- These policies deliberately allow public demo reads/writes with the anon key.
-- Never store private data. For a private production deployment, replace them
-- with authenticated device/service roles before ingesting real data.
create table if not exists public.readings (
  id bigint generated always as identity primary key,
  device_id text not null check (char_length(device_id) between 1 and 64),
  temp double precision not null check (temp between -40 and 80),
  rh double precision not null check (rh between 0 and 100),
  co2 double precision not null check (co2 between 0 and 50000),
  o2 double precision not null check (o2 between 0 and 100),
  lux double precision not null check (lux between 0 and 200000),
  moisture double precision not null check (moisture between 0 and 100),
  received_at timestamptz not null default now()
);
create index if not exists readings_received_at_idx on public.readings (received_at desc);
create table if not exists public.scans (
  id bigint generated always as identity primary key,
  sample text,
  label text not null check (label in ('healthy_mycelium','pinning','ready_to_harvest','ink_cap','green_mould','other_contamination','unclear')),
  confidence double precision not null check (confidence between 0 and 1),
  explanation text not null,
  actions jsonb not null check (jsonb_array_length(actions) <= 3),
  urgency text not null check (urgency in ('low','medium','high')),
  mode text not null check (mode in ('demo','live')),
  created_at timestamptz not null default now()
);
alter table public.readings enable row level security;
alter table public.scans enable row level security;
drop policy if exists "demo read readings" on public.readings;
drop policy if exists "demo insert readings" on public.readings;
drop policy if exists "demo read scans" on public.scans;
drop policy if exists "demo insert scans" on public.scans;
create policy "demo read readings" on public.readings for select to anon using (true);
create policy "demo insert readings" on public.readings for insert to anon with check (true);
create policy "demo read scans" on public.scans for select to anon using (true);
create policy "demo insert scans" on public.scans for insert to anon with check (true);
-- Uploaded image bytes are never persisted; only scan metadata and sample ID.
