import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { getLevelName, getClassName, getProfileName, getStudentName, todayString, isWeekend, formatDate } from '@/lib/helpers';
import { STATUS_COLORS } from '@/lib/statusStyles';
import type { Level, ClassRoom, Profile, AttendanceRecord, Student } from '@/types/database';
import {
  School, Layers, Users, CalendarCheck, TrendingUp, BookOpen,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight,
} from 'lucide-react';

export function DirectorDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t, lang } = useI18n();
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [levelsRes, classesRes, teachersRes, studentsRes, attRes, ctRes] = await Promise.all([
        supabase.from('levels').select('*').order('sort_order'),
        supabase.from('classes').select('*, level(*)'),
        supabase.from('profiles').select('*').eq('role', 'teacher'),
        supabase.from('students').select('*, class(*)'),
        supabase.from('attendance').select('*').eq('date', todayString()),
        supabase.from('class_teachers').select('class_id'),
      ]);

      const assignedClassIds = new Set((ctRes.data || []).map((ct: any) => ct.class_id));
      const allClasses = (classesRes.data || []) as ClassRoom[];
      const classesWithAssignment = allClasses.map((c) => ({ ...c, hasTeachers: assignedClassIds.has(c.id) }));

      setLevels(levelsRes.data as Level[] || []);
      setClasses(classesWithAssignment);
      setTeachers(teachersRes.data as Profile[] || []);
      setStudents(studentsRes.data as Student[] || []);
      setTodayAttendance(attRes.data as AttendanceRecord[] || []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assignedClasses = classes.filter((c) => (c as any).hasTeachers);
  const unassignedClasses = classes.filter((c) => !(c as any).hasTeachers);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const isWeekendDay = isWeekend(new Date());

  const stats = [
    { label: t('totalLevels'), value: levels.length, icon: <Layers className="w-5 h-5" />, bg: 'bg-teal-50', text: 'text-teal-600' },
    { label: t('totalClasses'), value: classes.length, icon: <School className="w-5 h-5" />, bg: 'bg-cyan-50', text: 'text-cyan-600' },
    { label: t('totalTeachers'), value: teachers.length, icon: <Users className="w-5 h-5" />, bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: t('totalStudents'), value: students.length, icon: <BookOpen className="w-5 h-5" />, bg: 'bg-violet-50', text: 'text-violet-600' },
  ];

  const todayStats = [
    { label: t('presentToday'), value: presentCount, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('absentToday'), value: absentCount, icon: <XCircle className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: t('lateToday'), value: lateCount, icon: <Clock className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const quickActions = [
    { label: t('manageLevels'), icon: <Layers className="w-5 h-5" />, page: 'levels', bg: 'bg-teal-50', text: 'text-teal-600' },
    { label: t('manageClasses'), icon: <School className="w-5 h-5" />, page: 'classes', bg: 'bg-cyan-50', text: 'text-cyan-600' },
    { label: t('manageTeachers'), icon: <Users className="w-5 h-5" />, page: 'teachers', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: t('allAttendance'), icon: <CalendarCheck className="w-5 h-5" />, page: 'allAttendance', bg: 'bg-violet-50', text: 'text-violet-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-48 h-48 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-300 text-sm mb-1">{t('schoolOverview')}</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">{t('dashboard')}</h1>
          <p className="text-slate-300 text-sm">{formatDate(new Date(), lang)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-800">{t('attendanceRate')}</h3>
          </div>
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none" stroke="#14b8a6" strokeWidth="10"
                strokeDasharray={`${(attendanceRate / 100) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{attendanceRate}%</span>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            {isWeekendDay ? t('weekend') : t('today')}
          </p>
        </div>

        {/* Today's breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">{t('dailyBreakdown')}</h3>
          <div className="space-y-3">
            {todayStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Class assignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">{t('classes')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
              <span className="text-sm font-medium text-emerald-700">{t('assignedClasses')}</span>
              <span className="text-lg font-bold text-emerald-700">{assignedClasses.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
              <span className="text-sm font-medium text-amber-700">{t('unassignedClasses')}</span>
              <span className="text-lg font-bold text-amber-700">{unassignedClasses.length}</span>
            </div>
            {unassignedClasses.length > 0 && (
              <button
                onClick={() => onNavigate('classes')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-600"
              >
                <span>{t('assignTeacher')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">{t('quickActions')}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.page)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-start"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.text} flex items-center justify-center`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{action.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
