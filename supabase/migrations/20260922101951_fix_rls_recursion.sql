/*
# Fix RLS recursion on profiles table

## Problem
The `select_all_profiles_director` policy does a subquery `SELECT 1 FROM profiles p WHERE p.id = auth.uid()` — 
since RLS is enabled on profiles, that subquery itself triggers the profiles SELECT policies, which do 
another subquery on profiles, creating infinite recursion and a 500 error.

## Fix
1. Drop the recursive `select_all_profiles_director` policy
2. Replace with a policy that checks `auth.uid() = id` for own profile OR uses `auth.jwt() ->> 'role'` 
   to check director status WITHOUT querying the profiles table. The role is stored in raw_user_meta_data 
   which is accessible via `auth.jwt() -> 'user_metadata' ->> 'role'`.
3. Similarly fix all other policies across tables that do `SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director'`
   to instead use `auth.jwt() -> 'user_metadata' ->> 'role' = 'director'`
*/

-- ============================================================
-- Fix profiles policies (remove recursion)
-- ============================================================
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "select_all_profiles_director" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

-- Own profile: direct check, no recursion
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Directors see all profiles: check role from JWT, NOT from profiles table
CREATE POLICY "select_all_profiles_director" ON profiles FOR SELECT
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- Fix levels policies (remove profiles subquery)
-- ============================================================
DROP POLICY IF EXISTS "insert_level_director" ON levels;
DROP POLICY IF EXISTS "update_level_director" ON levels;
DROP POLICY IF EXISTS "delete_level_director" ON levels;

CREATE POLICY "insert_level_director" ON levels FOR INSERT
  TO authenticated WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

CREATE POLICY "update_level_director" ON levels FOR UPDATE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  ) WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

CREATE POLICY "delete_level_director" ON levels FOR DELETE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

-- ============================================================
-- Fix classes policies (remove profiles subquery)
-- ============================================================
DROP POLICY IF EXISTS "insert_class_director" ON classes;
DROP POLICY IF EXISTS "update_class_director" ON classes;
DROP POLICY IF EXISTS "delete_class_director" ON classes;

CREATE POLICY "insert_class_director" ON classes FOR INSERT
  TO authenticated WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

CREATE POLICY "update_class_director" ON classes FOR UPDATE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  ) WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

CREATE POLICY "delete_class_director" ON classes FOR DELETE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
  );

-- ============================================================
-- Fix students policies (remove profiles subquery)
-- ============================================================
DROP POLICY IF EXISTS "select_students" ON students;
DROP POLICY IF EXISTS "insert_students" ON students;
DROP POLICY IF EXISTS "update_students" ON students;
DROP POLICY IF EXISTS "delete_students" ON students;

CREATE POLICY "select_students" ON students FOR SELECT
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "update_students" ON students FOR UPDATE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "delete_students" ON students FOR DELETE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- Fix attendance policies (remove profiles subquery)
-- ============================================================
DROP POLICY IF EXISTS "select_attendance" ON attendance;
DROP POLICY IF EXISTS "insert_attendance" ON attendance;
DROP POLICY IF EXISTS "update_attendance" ON attendance;
DROP POLICY IF EXISTS "delete_attendance" ON attendance;

CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'director'
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );
