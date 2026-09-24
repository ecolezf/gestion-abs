import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { getClassName, getStudentName, todayString, isWeekend, getSubjectLabel } from '@/lib/helpers';
import {
  BookOpen, Users, CalendarCheck, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import type { ClassRoom, Student, AttendanceRecord } from '@/types/database';

export function TeacherDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const { t, lang } = useI18n();
  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [profile]);

  async function loadClasses() {
    if (!profile) return;
    setLoading(true);

    const { data: ctData } = await supabase
      .from('class_teachers')
      .select('class_id')
      .eq('teacher_id', profile.id);

    if (!ctData || ctData.length === 0) {
      setMyClasses([]);
      setLoading(false);
      return;
    }

    const classIds = ctData.map((ct: any) => ct.class_id);
    const { data: classesData } = await supabase
    .from('classes')
    .select('*')
    .in('id', classIds)
    .order('created_at');

    const classes = (classesData || []) as ClassRoom[];
    setMyClasses(classes);
    if (classes.length > 0) {
      setSelectedClass(classes[0]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (selectedClass) {
      loadClassData(selectedClass.id);
    }
  }, [selectedClass]);

  async function loadClassData(classId: string) {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);
    setStudentCount(count || 0);

    const today = todayString();
    const { data: att } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', classId)
      .eq('date', today);
    setTodayAttendance(att as AttendanceRecord[] || []);
  }

  const today = new Date();
  const isWeekendDay = isWeekend(today);

  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = studentCount > 0 ? Math.round((presentCount / studentCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (myClasses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('noClassAssigned')}</h3>
        <p className="text-slate-500 text-sm">{t('directorCanManageAll')}</p>
      </div>
    );
  }

  const stats = [
    { label: t('totalStudents'), value: studentCount, icon: <Users className="w-5 h-5" />, bg: 'bg-teal-50', text: 'text-teal-600' },
    { label: t('presentToday'), value: presentCount, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: t('absentToday'), value: absentCount, icon: <XCircle className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-600' },
    { label: t('lateToday'), value: lateCount, icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-teal-100 text-sm mb-1">{t('welcomeBack')}</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {profile?.subject && getSubjectLabel(profile.subject, lang)}
          </h1>
          {myClasses.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {myClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedClass?.id === cls.id
                      ? 'bg-white text-teal-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {getClassName(cls, lang)}
                </button>
              ))}
            </div>
          )}
          {selectedClass && myClasses.length === 1 && (
            <p className="text-teal-100 text-sm">{getClassName(selectedClass, lang)}</p>
          )}
        </div>
      </div>

      {/* Stats cards */}
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

      {/* Attendance rate + quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 lg:col-span-1">
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

        <div className="bg-white rounded-2xl p-6 border border-slate-100 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">{t('quickActions')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('myClass')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{t('students')}</p>
                <p className="text-xs text-slate-500">{t('viewStudents')}</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{t('attendance')}</p>
                <p className="text-xs text-slate-500">{t('dailyAttendance')}</p>
              </div>
            </button>
          </div>

          {todayAttendance.length === 0 && !isWeekendDay && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-amber-700">{t('noAttendanceRecorded')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
