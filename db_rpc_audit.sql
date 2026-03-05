
-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Create Audit Log Table
create table if not exists audit_logs (
  id uuid default uuid_generate_v4() primary key,
  action_type text not null, -- 'VOTE_SUBMITTED', 'LOGIN', 'ADMIN_ACTION'
  user_id text, -- staff_id or admin email
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create RPC function for Atomic Vote Submission
-- This ensures votes are inserted AND staff marked as voted in a single transaction
create or replace function submit_ballot(
  p_staff_id text,
  p_votes jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_has_voted boolean;
  vote_record jsonb;
begin
  -- Check if staff exists and hasn't voted (FOR UPDATE locks the row)
  select has_voted into v_has_voted
  from staff
  where staff_id = p_staff_id
  for update;

  if not found then
    raise exception 'Staff ID not found';
  end if;

  if v_has_voted then
    raise exception 'Staff member has already voted';
  end if;

  -- Insert votes
  -- p_votes is an array of objects: [{ "position_id": "...", "candidate_id": "..." }]
  -- We need to loop through the JSON array
  for vote_record in select * from jsonb_array_elements(p_votes)
  loop
    insert into votes (staff_id, position_id, candidate_id)
    values (
      p_staff_id,
      vote_record->>'position_id',
      vote_record->>'candidate_id'
    );
  end loop;

  -- Mark staff as voted
  update staff
  set has_voted = true
  where staff_id = p_staff_id;

  -- Create Audit Log Entry
  insert into audit_logs (action_type, user_id, details)
  values ('VOTE_SUBMITTED', p_staff_id, jsonb_build_object('vote_count', jsonb_array_length(p_votes)));

end;
$$;
