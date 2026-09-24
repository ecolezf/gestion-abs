import type { Language, TeacherSubject } from '@/types/database';
import type { Level, ClassRoom, Student, Profile } from '@/types/database';

export function getTrilingual(
  obj: { name_ar?: string | null; name_fr?: string | null; name_en?: string | null },
  lang: Language
): string {
  if (lang === 'ar') return obj.name_ar || obj.name_fr || obj.name_en || '';
  if (lang === 'fr') return obj.name_fr || obj.name_en || obj.name_ar || '';
  return obj.name_en || obj.name_fr || obj.name_ar || '';
}

export function getProfileName(profile: Profile | null, lang: Language): string {
  if (!profile) return '';
  const prefix = lang === 'ar' ? 'first_name_ar' : lang === 'fr' ? 'first_name_fr' : 'first_name_en';
  const last = lang === 'ar' ? 'last_name_ar' : lang === 'fr' ? 'last_name_fr' : 'last_name_en';
  const fn = (profile as any)[prefix] as string | null;
  const ln = (profile as any)[last] as string | null;
  if (fn && ln) return `${fn} ${ln}`;
  if (fn) return fn;
  if (ln) return ln;
  return profile.email;
}

export function getStudentName(student: Student, lang: Language): string {
  const prefix = lang === 'ar' ? 'first_name_ar' : lang === 'fr' ? 'first_name_fr' : 'first_name_en';
  const last = lang === 'ar' ? 'last_name_ar' : lang === 'fr' ? 'last_name_fr' : 'last_name_en';
  const fn = (student as any)[prefix] as string;
  const ln = (student as any)[last] as string;
  return `${fn} ${ln}`;
}

export function getLevelName(level: Level, lang: Language): string {
  return getTrilingual(level, lang);
}

export function getClassName(cls: ClassRoom, lang: Language): string {
  return getTrilingual(cls, lang);
}

export const WEEKDAYS = [
  { key: 'sunday', index: 0 },
  { key: 'monday', index: 1 },
  { key: 'tuesday', index: 2 },
  { key: 'wednesday', index: 3 },
  { key: 'thursday', index: 4 },
  { key: 'friday', index: 5 },
  { key: 'saturday', index: 6 },
] as const;

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

export function isSchoolDay(date: Date): boolean {
  return !isWeekend(date);
}

export function formatDate(date: string | Date, lang: Language): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getSchoolDaysInMonth(year: number, month: number): Date[] {
  return getMonthDays(year, month).filter(isSchoolDay);
}

// Subject-level restriction rules (based on level sort_order, 0-indexed)
// Arabic & Sport: all levels (sort_order 0-4, i.e. levels 1-5)
// French: sort_order 3-4 (i.e. 4th and 5th primary)
// English: sort_order 2-4 (i.e. 3rd, 4th, 5th primary)
export const SUBJECT_LEVEL_RULES: Record<TeacherSubject, { min: number; max: number }> = {
  arabic: { min: 0, max: 4 },
  sport: { min: 0, max: 4 },
  french: { min: 3, max: 4 },
  english: { min: 2, max: 4 },
};

export function canTeacherTeachLevel(subject: TeacherSubject, levelSortOrder: number): boolean {
  const rule = SUBJECT_LEVEL_RULES[subject];
  return levelSortOrder >= rule.min && levelSortOrder <= rule.max;
}

export function getSubjectLabel(subject: TeacherSubject | null, lang: Language): string {
  if (!subject) return '';
  const labels: Record<TeacherSubject, Record<Language, string>> = {
    arabic: { fr: 'Arabe', ar: 'العربية', en: 'Arabic' },
    french: { fr: 'Français', ar: 'الفرنسية', en: 'French' },
    english: { fr: 'Anglais', ar: 'الإنجليزية', en: 'English' },
    sport: { fr: 'Sport', ar: 'الرياضة', en: 'Sport' },
  };
  return labels[subject][lang];
}
