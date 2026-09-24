export type UserRole = 'teacher' | 'director';

export type TeacherSubject = 'arabic' | 'french' | 'english' | 'sport';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type Language = 'ar' | 'fr' | 'en';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  subject: TeacherSubject | null;
  first_name_ar: string | null;
  first_name_fr: string | null;
  first_name_en: string | null;
  last_name_ar: string | null;
  last_name_fr: string | null;
  last_name_en: string | null;
  created_at: string;
}

export interface Level {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  sort_order: number;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  level_id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  teacher_id: string | null;
  created_at: string;
  level?: Level;
  teacher?: Profile | null;
  teachers?: Profile[];
  hasTeachers?: boolean;
}

export interface ClassTeacher {
  id: string;
  class_id: string;
  teacher_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  first_name_ar: string;
  first_name_fr: string;
  first_name_en: string;
  last_name_ar: string;
  last_name_fr: string;
  last_name_en: string;
  student_number: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
}
