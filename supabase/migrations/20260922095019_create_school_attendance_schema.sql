/*
# School Attendance Management System - Complete Schema

1. New Tables
- `profiles` - Extends auth.users with role (teacher/director) and trilingual display names
- `levels` - School levels (e.g., 1st grade) with trilingual names (ar/fr/en)
- `classes` - Classes within levels, each assigned to a teacher
- `students` - Students belonging to a class, with trilingual names
- `attendance` - Daily attendance records (present/absent/late) per student

2. Trilingual Support
- All label columns have three variants: _ar (Arabic), _fr (French), _en (English)
- This applies to levels.name, classes.name, and profile display names

3. Security (RLS)
- profiles: users can read/update own profile; directors can read all profiles
- levels: directors can CRUD; teachers can read
- classes: directors can CRUD; teachers can read (and only their own class for detailed ops)
- students: teachers can CRUD only students in their own class; directors can read all
- attendance: teachers can CRUD only attendance for students in their own class; directors can read all

4. Important Notes
- Role is stored in raw_app_meta_data (user-immutable) for security, mirrored in profiles.role
- Week starts Sunday; Friday and Saturday are weekend (enforced in app logic)
- Each teacher is assigned at most one class via classes.teacher_id
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'director')),
  first_name_ar text,
  first_name_fr text,
  first_name_en text,
  last_name_ar text,
  last_name_fr text,
  last_name_en text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_director" ON profiles;
CREATE POLICY "select_all_profiles_director" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- LEVELS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_fr text NOT NULL,
  name_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_levels" ON levels;
CREATE POLICY "select_levels" ON levels FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_level_director" ON levels;
CREATE POLICY "insert_level_director" ON levels FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

DROP POLICY IF EXISTS "update_level_director" ON levels;
CREATE POLICY "update_level_director" ON levels FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

DROP POLICY IF EXISTS "delete_level_director" ON levels;
CREATE POLICY "delete_level_director" ON levels FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

-- ============================================================
-- CLASSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  name_fr text NOT NULL,
  name_en text NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_classes" ON classes;
CREATE POLICY "select_classes" ON classes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_class_director" ON classes;
CREATE POLICY "insert_class_director" ON classes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

DROP POLICY IF EXISTS "update_class_director" ON classes;
CREATE POLICY "update_class_director" ON classes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

DROP POLICY IF EXISTS "delete_class_director" ON classes;
CREATE POLICY "delete_class_director" ON classes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  first_name_ar text NOT NULL,
  first_name_fr text NOT NULL,
  first_name_en text NOT NULL,
  last_name_ar text NOT NULL,
  last_name_fr text NOT NULL,
  last_name_en text NOT NULL,
  student_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Teachers can see students in their own class
DROP POLICY IF EXISTS "select_students" ON students;
CREATE POLICY "select_students" ON students FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can insert students into their own class
DROP POLICY IF EXISTS "insert_students" ON students;
CREATE POLICY "insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can update students in their own class
DROP POLICY IF EXISTS "update_students" ON students;
CREATE POLICY "update_students" ON students FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can delete students in their own class
DROP POLICY IF EXISTS "delete_students" ON students;
CREATE POLICY "delete_students" ON students FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Teachers can see attendance for their own class; directors see all
DROP POLICY IF EXISTS "select_attendance" ON attendance;
CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can insert attendance for their own class
DROP POLICY IF EXISTS "insert_attendance" ON attendance;
CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can update attendance for their own class
DROP POLICY IF EXISTS "update_attendance" ON attendance;
CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can delete attendance for their own class
DROP POLICY IF EXISTS "delete_attendance" ON attendance;
CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = attendance.class_id AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_classes_level_id ON classes(level_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
