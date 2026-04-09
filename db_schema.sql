
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Staff Table
create table if not exists staff (
  id uuid default uuid_generate_v4() primary key,
  staff_id text unique not null,
  full_name text,
  email text not null,
  date_of_birth date,
  has_voted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin Users Table
create table if not exists admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null, -- In production, use Supabase Auth or proper hashing
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

-- Create view for aggregated candidate vote counts (Safe)
drop view if exists candidate_vote_counts;
create or replace view candidate_vote_counts as
  select 
    candidate_id, 
    position_id, 
    count(*)::integer as vote_count
  from votes
  group by candidate_id, position_id;

-- Ensure public can read this view for the results dashboard
grant select on candidate_vote_counts to public;
grant select on candidate_vote_counts to anon;
grant select on candidate_vote_counts to authenticated;
grant select on candidate_vote_counts to service_role;

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

-- Insert a demo admin (Password: admin123 - this is for demo purposes only)
-- insert into admin_users (email, password_hash) values ('admin@election.com', 'admin123');
