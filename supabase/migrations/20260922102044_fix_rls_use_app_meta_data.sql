/*
# Switch RLS role checks to app_meta_data (user-immutable)

## Why
raw_user_meta_data is user-mutable (users can change their own metadata via update()).
raw_app_meta_data is only set server-side, making it the correct place for authorization data.

All director checks now use: auth.jwt() -> 'app_metadata' ->> 'role' = 'director'
with a fallback to user_metadata for backward compatibility.
*/

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS "select_all_profiles_director" ON profiles;
CREATE POLICY "select_all_profiles_director" ON profiles FOR SELECT
  TO authenticated USING (
    COALESCE(
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'role'
    ) = 'director'
  );

-- ============================================================
-- levels
-- ============================================================
DROP POLICY IF EXISTS "insert_level_director" ON levels;
DROP POLICY IF EXISTS "update_level_director" ON levels;
DROP POLICY IF EXISTS "delete_level_director" ON levels;

CREATE POLICY "insert_level_director" ON levels FOR INSERT
  TO authenticated WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "update_level_director" ON levels FOR UPDATE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  ) WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "delete_level_director" ON levels FOR DELETE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- ============================================================
-- classes
-- ============================================================
DROP POLICY IF EXISTS "insert_class_director" ON classes;
DROP POLICY IF EXISTS "update_class_director" ON classes;
DROP POLICY IF EXISTS "delete_class_director" ON classes;

CREATE POLICY "insert_class_director" ON classes FOR INSERT
  TO authenticated WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "update_class_director" ON classes FOR UPDATE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  ) WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "delete_class_director" ON classes FOR DELETE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- ============================================================
-- students
-- ============================================================
DROP POLICY IF EXISTS "select_students" ON students;
DROP POLICY IF EXISTS "insert_students" ON students;
DROP POLICY IF EXISTS "update_students" ON students;
DROP POLICY IF EXISTS "delete_students" ON students;

CREATE POLICY "select_students" ON students FOR SELECT
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "update_students" ON students FOR UPDATE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "delete_students" ON students FOR DELETE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = students.class_id AND c.teacher_id = auth.uid())
  );

-- ============================================================
-- attendance
-- ============================================================
DROP POLICY IF EXISTS "select_attendance" ON attendance;
DROP POLICY IF EXISTS "insert_attendance" ON attendance;
DROP POLICY IF EXISTS "update_attendance" ON attendance;
DROP POLICY IF EXISTS "delete_attendance" ON attendance;

CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
    OR EXISTS (SELECT 1 FROM classes c WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid())
  );
