/*
# Add subject column to profiles table

## Changes
1. Add `subject` column to profiles - tracks the teacher's subject (arabic/french/english/sport)
2. Update handle_new_user trigger to also capture subject from user_meta_data
3. Update existing director profile to have NULL subject (directors don't teach subjects)
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subject text CHECK (subject IN ('arabic', 'french', 'english', 'sport'));

-- Update trigger to capture subject
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, subject, first_name_ar, first_name_fr, first_name_en, last_name_ar, last_name_fr, last_name_en)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    NEW.raw_user_meta_data->>'subject',
    NEW.raw_user_meta_data->>'first_name_ar',
    NEW.raw_user_meta_data->>'first_name_fr',
    NEW.raw_user_meta_data->>'first_name_en',
    NEW.raw_user_meta_data->>'last_name_ar',
    NEW.raw_user_meta_data->>'last_name_fr',
    NEW.raw_user_meta_data->>'last_name_en'
  );
  
  NEW.raw_app_meta_data = jsonb_set(
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'))
  );
  
  RETURN NEW;
END;
$$;
