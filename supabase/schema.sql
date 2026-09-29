create table if not exists public.sd_members (
  email text primary key,
  role text not null check (role in ('owner','member')),
  telegram_chat_id text,
  email_alerts boolean not null default true,
  telegram_alerts boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.sd_watchlist (
  symbol text primary key,
  name text not null,
  added_at timestamptz not null default now()
);
create table if not exists public.sd_filings (
  id text primary key,
  symbol text not null,
  category text not null,
  title text not null,
  description text not null default '',
  url text not null,
  published_at timestamptz not null,
  seen_at timestamptz not null default now(),
  analysis jsonb,
  document_read boolean not null default false,
  analysis_status text not null default 'pending'
);
create index if not exists sd_filings_symbol_date on public.sd_filings(symbol, published_at desc);
create table if not exists public.sd_reads (
  email text not null references public.sd_members(email) on delete cascade,
  filing_id text not null references public.sd_filings(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(email,filing_id)
);
create table if not exists public.sd_deliveries (
  email text not null references public.sd_members(email) on delete cascade,
  filing_id text not null references public.sd_filings(id) on delete cascade,
  channel text not null check(channel in ('telegram','email')),
  status text not null check(status in ('sent','failed')),
  attempted_at timestamptz not null default now(),
  error text,
  primary key(email,filing_id,channel)
);
create table if not exists public.sd_feed_state (
  id integer primary key check(id=1),
  last_checked_at timestamptz,
  status text not null default 'Waiting for first check'
);
insert into public.sd_feed_state(id) values(1) on conflict do nothing;
insert into public.sd_members(email,role) values('hpatil1704@gmail.com','owner') on conflict(email) do nothing;

alter table public.sd_members enable row level security;
alter table public.sd_watchlist enable row level security;
alter table public.sd_filings enable row level security;
alter table public.sd_reads enable row level security;
alter table public.sd_deliveries enable row level security;
alter table public.sd_feed_state enable row level security;

create policy sd_members_read on public.sd_members for select to authenticated
  using (email=lower(auth.jwt()->>'email') or lower(auth.jwt()->>'email')='hpatil1704@gmail.com');
create policy sd_members_insert on public.sd_members for insert to authenticated
  with check (lower(auth.jwt()->>'email')='hpatil1704@gmail.com' and role='member');
create policy sd_members_update_owner on public.sd_members for update to authenticated
  using (email='hpatil1704@gmail.com' and email=lower(auth.jwt()->>'email')) with check (email='hpatil1704@gmail.com' and role='owner');
create policy sd_members_update_member on public.sd_members for update to authenticated
  using (email=lower(auth.jwt()->>'email') and role='member') with check (email=lower(auth.jwt()->>'email') and role='member');
create policy sd_watch_read on public.sd_watchlist for select to authenticated
  using (exists(select 1 from public.sd_members m where m.email=lower(auth.jwt()->>'email')));
create policy sd_watch_insert on public.sd_watchlist for insert to authenticated
  with check (exists(select 1 from public.sd_members m where m.email=lower(auth.jwt()->>'email')));
create policy sd_watch_delete on public.sd_watchlist for delete to authenticated
  using (exists(select 1 from public.sd_members m where m.email=lower(auth.jwt()->>'email')));
create policy sd_filings_read on public.sd_filings for select to authenticated
  using (exists(select 1 from public.sd_members m where m.email=lower(auth.jwt()->>'email')) and exists(select 1 from public.sd_watchlist w where w.symbol=sd_filings.symbol));
create policy sd_reads_read on public.sd_reads for select to authenticated
  using (email=lower(auth.jwt()->>'email'));
create policy sd_reads_insert on public.sd_reads for insert to authenticated
  with check (email=lower(auth.jwt()->>'email') and exists(select 1 from public.sd_watchlist w join public.sd_filings f on f.symbol=w.symbol where f.id=filing_id));
create policy sd_deliveries_read on public.sd_deliveries for select to authenticated
  using (email=lower(auth.jwt()->>'email'));
create policy sd_feed_read on public.sd_feed_state for select to authenticated
  using (exists(select 1 from public.sd_members m where m.email=lower(auth.jwt()->>'email')));

grant select,insert,update on public.sd_members to authenticated;
grant select,insert,delete on public.sd_watchlist to authenticated;
grant select on public.sd_filings to authenticated;
grant select,insert on public.sd_reads to authenticated;
grant select on public.sd_deliveries,public.sd_feed_state to authenticated;
