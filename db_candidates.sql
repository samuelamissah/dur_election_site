
-- Positions Table (to normalize data)
create table if not exists positions (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null, -- e.g. 'chairman', 'treasurer'
  title text not null,
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Candidates Table
create table if not exists candidates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  position_id text references positions(slug) not null, -- using slug as FK for simpler CSV upload
  role text, -- Job title e.g. 'Senior Manager'
  bio text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table positions enable row level security;
alter table candidates enable row level security;

-- Everyone can read positions and candidates (public info)
create policy "Public read positions" on positions for select using (true);
create policy "Public read candidates" on candidates for select using (true);

-- Only admins can insert/update/delete (we'll rely on service role or admin check for now)
create policy "Admins all positions" on positions for all using (true); 
create policy "Admins all candidates" on candidates for all using (true);

-- Seed initial positions if empty
insert into positions (slug, title, description, display_order)
values 
  ('chairman', 'Chairman', 'Responsible for leading the committee and overseeing all operations.', 1),
  ('vice-chairman', 'Vice Chairman', 'Supports the Chairman and steps in when necessary.', 2),
  ('treasurer', 'Treasurer', 'Manages the financial assets and records of the organization.', 3),
  ('secretary', 'Secretary', 'Maintains records, minutes, and correspondence.', 4),
  ('welfare', 'Welfare Officer', 'Ensures the well-being and morale of the staff.', 5)
on conflict (slug) do nothing;
