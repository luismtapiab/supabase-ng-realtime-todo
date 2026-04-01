
-- Update the function to return both id and username
create or replace function public.get_registered_usernames()
returns table (id uuid, username text) 
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select distinct 
    u.id, 
    (u.raw_user_meta_data->>'username')::text
  from auth.users u
  where u.raw_user_meta_data->>'username' is not null
  order by 2;
end;
$$;

-- Grant access to anon and authenticated roles
grant execute on function public.get_registered_usernames() to anon, authenticated;
