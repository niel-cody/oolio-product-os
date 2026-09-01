-- Hardening pass over the members functions, from Supabase's own database linter.
--
-- Three findings, all real:
--   1. members_touch_updated_at had a mutable search_path. Any SECURITY DEFINER or
--      trigger function without a pinned search_path can be redirected by whatever the
--      caller has in theirs.
--   2. The two trigger functions were reachable as PostgREST RPC endpoints
--      (/rest/v1/rpc/...). Nothing should be able to call a trigger function directly,
--      and members_require_an_admin is SECURITY DEFINER, so it was callable by anon.
--   3. current_member_role and is_product_os_admin were executable by anon, because
--      EXECUTE is granted to PUBLIC by default and the earlier explicit grant to
--      authenticated did not remove that. They answer harmlessly for a caller with no
--      JWT, but a SECURITY DEFINER function should be reachable only by whoever needs it.

create or replace function public.members_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- Trigger functions: callable by the trigger, by nobody else.
revoke execute on function public.members_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.members_link_auth_user() from public, anon, authenticated;
revoke execute on function public.members_require_an_admin() from public, anon, authenticated;

-- Role lookups: signed-in callers only. The RLS policies on members call these as the
-- definer, so revoking anon does not affect them.
revoke execute on function public.current_member_role() from public, anon;
revoke execute on function public.is_product_os_admin() from public, anon;
grant execute on function public.current_member_role() to authenticated;
grant execute on function public.is_product_os_admin() to authenticated;
