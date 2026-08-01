-- 1. Trigger-only SECURITY DEFINER / helper functions must not be callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;

-- has_role is required by RLS policies evaluated as the calling user; keep it for
-- authenticated only (anon has no policies that use it).
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Limit public site_content reads to the single published row
DROP POLICY IF EXISTS "Anyone can read published site content" ON public.site_content;

CREATE POLICY "Anyone can read the published site content row"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (id = 'current');

CREATE POLICY "Admins can read all site content"
ON public.site_content
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));