-- Migration: Add full_name column to staff table safely
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='full_name') then
    alter table staff add column full_name text;
  end if;
end $$;
