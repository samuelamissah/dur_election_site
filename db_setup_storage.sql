-- Ensure the candidate-images storage bucket exists
insert into storage.buckets (id, name, public) 
values ('candidate-images', 'candidate-images', true)
on conflict (id) do nothing;

-- Set up storage policies for the candidate-images bucket
-- Allow public read access to images
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'candidate-images' );

-- Allow authenticated and anon users to upload (will be restricted by app logic to admins)
create policy "Upload Access" 
on storage.objects for insert 
with check ( bucket_id = 'candidate-images' );

create policy "Update Access" 
on storage.objects for update 
using ( bucket_id = 'candidate-images' );

create policy "Delete Access" 
on storage.objects for delete 
using ( bucket_id = 'candidate-images' );