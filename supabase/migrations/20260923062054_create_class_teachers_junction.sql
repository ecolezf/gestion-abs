/*
# Multi-teacher class assignment system

## Changes
1. Create `class_teachers` junction table (many-to-many between classes and teachers)
   - Replaces the single-teacher model (classes.teacher_id)
   - Each class can have multiple teachers (one per subject: Arabic, French, English, Sport)
   - Arabic teachers can only be assigned to 1 class total
   - Other teachers (French, English, Sport) can be assigned to multiple classes
   - Subject-level restrictions:
     * Arabic & Sport: levels with sort_order 0-5 (all primary levels)
     * French: levels with sort_order 4-5 only
     * English: levels with sort_order 3-5 only
2. Migrate existing teacher_id assignments from classes to class_teachers
3. Update RLS policies for students and attendance to use the junction table
4. Add unique constraint: one teacher per class (no duplicate assignments)

## Important Notes
- classes.teacher_id column is kept for backward compatibility but no longer used for assignment
- The class_teachers table is now the source of truth for teacher-class relationships
*/

-- Create junction table
CREATE TABLE IF NOT EXISTS class_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, teacher_id)
);

ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read assignments
DROP POLICY IF EXISTS "select_class_teachers" ON class_teachers;
CREATE POLICY "select_class_teachers" ON class_teachers FOR SELECT
  TO authenticated USING (true);

-- Only directors can insert assignments
DROP POLICY IF EXISTS "insert_class_teachers" ON class_teachers;
CREATE POLICY "insert_class_teachers" ON class_teachers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

-- Only directors can delete assignments
DROP POLICY IF EXISTS "delete_class_teachers" ON class_teachers;
CREATE POLICY "delete_class_teachers" ON class_teachers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
  );

-- Migrate existing teacher_id assignments to class_teachers
INSERT INTO class_teachers (class_id, teacher_id)
SELECT c.id, c.teacher_id FROM classes c
WHERE c.teacher_id IS NOT NULL
ON CONFLICT (class_id, teacher_id) DO NOTHING;

-- Update students RLS to use junction table
DROP POLICY IF EXISTS "select_students" ON students;
CREATE POLICY "select_students" ON students FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = students.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_students" ON students;
CREATE POLICY "insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = students.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_students" ON students;
CREATE POLICY "update_students" ON students FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = students.class_id AND ct.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = students.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_students" ON students;
CREATE POLICY "delete_students" ON students FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = students.class_id AND ct.teacher_id = auth.uid()
    )
  );

-- Update attendance RLS to use junction table
DROP POLICY IF EXISTS "select_attendance" ON attendance;
CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = attendance.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_attendance" ON attendance;
CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = attendance.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_attendance" ON attendance;
CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = attendance.class_id AND ct.teacher_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = attendance.class_id AND ct.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_attendance" ON attendance;
CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'director')
    OR
    EXISTS (
      SELECT 1 FROM class_teachers ct
      WHERE ct.class_id = attendance.class_id AND ct.teacher_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_teachers_class_id ON class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher_id ON class_teachers(teacher_id);
