
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Staff Table
create table staff (
  id uuid default uuid_generate_v4() primary key,
  staff_id text unique not null,
  email text not null,
  has_voted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin Users Table
create table admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null, -- In production, use Supabase Auth or proper hashing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes Table
create table votes (
  id uuid default uuid_generate_v4() primary key,
  staff_id text references staff(staff_id) not null,
  position_id text not null,
  candidate_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic)
alter table staff enable row level security;
alter table votes enable row level security;
alter table admin_users enable row level security;

-- Policy: Staff can read their own status (conceptually, though we verify on server)
create policy "Staff can view own status" on staff
  for select using (true); -- Restricted by server-side logic usually

-- Policy: Admins can view everything
create policy "Admins can view all staff" on staff
  for all using (true); -- In reality, we'd check for admin role/session

-- Insert a demo admin (Password: admin123 - this is for demo purposes only)
-- insert into admin_users (email, password_hash) values ('admin@election.com', 'admin123');
