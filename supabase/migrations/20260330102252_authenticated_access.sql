-- 1. Add user_id column to todos table
alter table "public"."todos" add column "user_id" uuid  default auth.uid() references auth.users (id) on delete cascade;

-- 2. Enable RLS (already enabled, but let's be sure)
alter table "public"."todos" enable row level security;

-- 3. Drop existing permissive policies
drop policy "Allow anonymous" on "public"."todos";
drop policy "allow everything" on "public"."todos";

-- 4. Create proper authenticated policies
create policy "Users can see all todos"
on "public"."todos"
as permissive
for select
to authenticated
using (true);

create policy "Users can insert their own todos"
on "public"."todos"
as permissive
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own todos"
on "public"."todos"
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own todos"
on "public"."todos"
as permissive
for delete
to authenticated
using (auth.uid() = user_id);

-- 5. Restrict Realtime broadcasts to authenticated users
-- Drop the anon policy for broadcats
drop policy "anon users can receive broadcasts" on "realtime"."messages";

-- (Optional) Keep or update the authenticated policy
-- Policy "Authenticated users can receive broadcasts" already exists from initial migration, 
-- but let's recreate it to be explicit if needed.
-- drop policy if exists "Authenticated users can receive broadcasts" on "realtime"."messages";
-- create policy "Authenticated users can receive broadcasts" 
-- on "realtime"."messages" 
-- as permissive for select 
-- to authenticated 
-- using (true);
