-- Migration: Add full_name and date_of_birth columns to staff table safely
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='full_name') then
    alter table staff add column full_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='staff' and column_name='date_of_birth') then
    alter table staff add column date_of_birth date;
  end if;
end $$;
