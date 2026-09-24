/*
# Update trigger to also set app_meta_data role

## Changes
1. Update handle_new_user trigger to also set raw_app_meta_data role
   so it's available in the JWT at the app level (user-immutable)
2. Update existing users to have role in app_meta_data
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name_ar, first_name_fr, first_name_en, last_name_ar, last_name_fr, last_name_en)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    NEW.raw_user_meta_data->>'first_name_ar',
    NEW.raw_user_meta_data->>'first_name_fr',
    NEW.raw_user_meta_data->>'first_name_en',
    NEW.raw_user_meta_data->>'last_name_ar',
    NEW.raw_user_meta_data->>'last_name_fr',
    NEW.raw_user_meta_data->>'last_name_en'
  );
  
  -- Also set the role in app_meta_data for JWT-based RLS checks
  NEW.raw_app_meta_data = jsonb_set(
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'))
  );
  
  RETURN NEW;
END;
$$;

-- Update existing user's app_meta_data
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  to_jsonb(COALESCE(raw_user_meta_data->>'role', 'teacher'))
)
WHERE raw_app_meta_data->>'role' IS NULL;
