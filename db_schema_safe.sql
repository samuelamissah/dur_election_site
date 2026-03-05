
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Staff Table
create table if not exists staff (
  id uuid default uuid_generate_v4() primary key,
  staff_id text unique not null,
  email text not null,
  has_voted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin Users Table
create table if not exists admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes Table
create table if not exists votes (
  id uuid default uuid_generate_v4() primary key,
  staff_id text references staff(staff_id) not null,
  position_id text not null,
  candidate_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Safe to re-run with checks)
alter table staff enable row level security;
alter table votes enable row level security;
alter table admin_users enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Staff can view own status' and tablename = 'staff') then
    create policy "Staff can view own status" on staff for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins can view all staff' and tablename = 'staff') then
    create policy "Admins can view all staff" on staff for all using (true);
  end if;
end $$;

-- Add 'email' column if it was missing from a previous partial run
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='email') then
    alter table staff add column email text;
  end if;
end $$;

-- Add 'has_voted' column if it was missing from a previous partial run
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='has_voted') then
    alter table staff add column has_voted boolean default false;
  end if;
end $$;
 
 -- Votes policies to allow insertion and select during election
 do $$
 begin
   if not exists (select 1 from pg_policies where policyname = 'Public insert votes' and tablename = 'votes') then
     create policy "Public insert votes" on votes for insert with check (true);
   end if;
   if not exists (select 1 from pg_policies where policyname = 'Public read votes' and tablename = 'votes') then
     create policy "Public read votes" on votes for select using (true);
   end if;
 end $$;
 
 -- Staff email tracking fields
 do $$
 begin
   if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='email_sent') then
     alter table staff add column email_sent boolean default false;
   end if;
   if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='email_last_sent_at') then
     alter table staff add column email_last_sent_at timestamp with time zone;
   end if;
 end $$;
