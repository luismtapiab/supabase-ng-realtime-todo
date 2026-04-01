
create or replace function public.get_registered_usernames()
returns table (username text) 
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select distinct (raw_user_meta_data->>'username')::text
  from auth.users
  where raw_user_meta_data->>'username' is not null
  order by 1;
end;
$$;

-- Grant access to anon and authenticated roles
grant execute on function public.get_registered_usernames() to anon, authenticated;
