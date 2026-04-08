-- Performance: Add indexes for high concurrency
create index if not exists idx_votes_position_candidate on votes (position_id, candidate_id);
create index if not exists idx_votes_staff_id on votes (staff_id);
create index if not exists idx_candidates_position_id on candidates (position_id);
create index if not exists idx_staff_has_voted on staff (has_voted);

-- Security: Tighten RLS on staff table
-- Only allow staff to see their own record (if we were using Supabase Auth)
-- Since we use custom session, we ensure server actions are the only way to access data.
-- For the database, we can at least ensure Public doesn't have 'all' access.

-- Drop overly permissive policies if they exist
do $$
begin
  if exists (select 1 from pg_policies where policyname = 'Staff can view own status' and tablename = 'staff') then
    drop policy "Staff can view own status" on staff;
  end if;
  if exists (select 1 from pg_policies where policyname = 'Admins can view all staff' and tablename = 'staff') then
    drop policy "Admins can view all staff" on staff;
  end if;
  if exists (select 1 from pg_policies where policyname = 'Public insert votes' and tablename = 'votes') then
    drop policy "Public insert votes" on votes;
  end if;
  if exists (select 1 from pg_policies where policyname = 'Public read votes' and tablename = 'votes') then
    drop policy "Public read votes" on votes;
  end if;
end $$;

-- Re-enable RLS
alter table staff enable row level security;
alter table votes enable row level security;
alter table candidates enable row level security;
alter table positions enable row level security;

-- Only allow Service Role (Admin) to manage staff and see all votes
-- The app uses createServiceClient() for sensitive operations.
-- For regular staff login, we use the regular client which will now be restricted.

do $$
begin
  -- Policy for staff table
  if not exists (select 1 from pg_policies where policyname = 'Service role only' and tablename = 'staff') then
    create policy "Service role only" on staff for all using (auth.role() = 'service_role');
  end if;

  -- Policy for votes table
  if not exists (select 1 from pg_policies where policyname = 'Service role only votes' and tablename = 'votes') then
    create policy "Service role only votes" on votes for all using (auth.role() = 'service_role');
  end if;

  -- Positions and Candidates remain public for the voting UI
  if not exists (select 1 from pg_policies where policyname = 'Public read positions' and tablename = 'positions') then
    create policy "Public read positions" on positions for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Public read candidates' and tablename = 'candidates') then
    create policy "Public read candidates" on candidates for select using (true);
  end if;
end $$;
