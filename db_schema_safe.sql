
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

-- Create view for aggregated candidate vote counts
do $$
begin
  if not exists (
    select 1 from pg_views where viewname = 'candidate_vote_counts'
  ) then
    create view candidate_vote_counts as
      select candidate_id, position_id, count(*) as vote_count
      from votes
      group by candidate_id, position_id;
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
   if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='thank_you_sent') then
     alter table staff add column thank_you_sent boolean default false;
   end if;
   if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='thank_you_last_sent_at') then
     alter table staff add column thank_you_last_sent_at timestamp with time zone;
   end if;
 end $$;
 
 -- Ensure positions table exists
 create table if not exists positions (
   id uuid default uuid_generate_v4() primary key,
   slug text unique not null,
   title text not null,
   description text,
   display_order integer default 0,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 );
 
 -- Ensure candidates table exists (using slug FK for CSV simplicity)
 create table if not exists candidates (
   id uuid default uuid_generate_v4() primary key,
   name text not null,
   position_id text references positions(slug) not null,
   role text,
   bio text,
   image_url text,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 );
 
 -- Enable RLS and basic policies
 alter table positions enable row level security;
 alter table candidates enable row level security;
 
 do $$
 begin
   if not exists (select 1 from pg_policies where policyname = 'Public read positions' and tablename = 'positions') then
     create policy "Public read positions" on positions for select using (true);
   end if;
   if not exists (select 1 from pg_policies where policyname = 'Public read candidates' and tablename = 'candidates') then
     create policy "Public read candidates" on candidates for select using (true);
   end if;
   if not exists (select 1 from pg_policies where policyname = 'Admins all positions' and tablename = 'positions') then
     create policy "Admins all positions" on positions for all using (true);
   end if;
   if not exists (select 1 from pg_policies where policyname = 'Admins all candidates' and tablename = 'candidates') then
     create policy "Admins all candidates" on candidates for all using (true);
   end if;
 end $$;
 
 -- Seed default positions
 insert into positions (slug, title, description, display_order)
 values 
   ('chairman', 'Chairman', 'Responsible for leading the committee and overseeing all operations.', 1),
   ('vice-chairman', 'Vice Chairman', 'Supports the Chairman and steps in when necessary.', 2),
   ('treasurer', 'Treasurer', 'Manages the financial assets and records of the organization.', 3),
  ('secretary', 'Secretary', 'Maintains records, minutes, and correspondence.', 4),
  ('organiser', 'Organiser', 'Coordinates and oversees election operations.', 5)

on conflict (slug) do nothing;
 
 do $$
 begin
   delete from candidates where position_id = 'welfare';
   delete from positions where slug = 'welfare';
 end $$;
