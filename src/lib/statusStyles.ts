import type { AttendanceStatus, Language } from '@/types/database';

export const STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; border: string; dot: string }> = {
  present: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  absent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  late: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

export const STATUS_ICONS: Record<AttendanceStatus, string> = {
  present: '✓',
  absent: '✗',
  late: '!',
};
