import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import {
  getClassName,
  todayString,
  getSubjectLabel,
} from '@/lib/helpers';
import {
  BookOpen,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import type {
  ClassRoom,
  AttendanceRecord,
} from '@/types/database';

export function TeacherDashboard({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const { profile } = useAuth();
  const { t, lang } = useI18n();

  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] =
    useState<ClassRoom | null>(null);

  const [studentCount, setStudentCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] =
    useState(false);

  useEffect(() => {
    loadClasses();
  }, [profile]);

  async function loadClasses() {
    if (!profile) return;

    setLoading(true);

    const { data: ctData, error: ctError } = await supabase
      .from('class_teachers')
      .select('class_id')
      .eq('teacher_id', profile.id);

    if (ctError) {
      console.error(
        'Erreur chargement classes enseignant:',
        ctError
      );
      setMyClasses([]);
      setSelectedClass(null);
      setLoading(false);
      return;
    }

    if (!ctData || ctData.length === 0) {
      setMyClasses([]);
      setSelectedClass(null);
      setLoading(false);
      return;
    }

    const classIds = ctData.map(
      (ct: { class_id: string }) => ct.class_id
    );

    const { data: classesData, error: classesError } =
      await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .order('created_at');

    if (classesError) {
      console.error(
        'Erreur chargement classes:',
        classesError
      );
      setMyClasses([]);
      setSelectedClass(null);
      setLoading(false);
      return;
    }

    const classes = (classesData || []) as ClassRoom[];

    setMyClasses(classes);

    if (classes.length > 0) {
      setSelectedClass(classes[0]);
    } else {
      setSelectedClass(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (selectedClass) {
      loadClassData(selectedClass.id);
    }
  }, [selectedClass, startDate, endDate]);

  async function loadClassData(classId: string) {
    setAttendanceLoading(true);

    const { count, error: studentsError } = await supabase
      .from('students')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('class_id', classId);

    if (studentsError) {
      console.error(
        'Erreur comptage élèves:',
        studentsError
      );
      setStudentCount(0);
    } else {
      setStudentCount(count || 0);
    }

    if (startDate > endDate) {
      setTodayAttendance([]);
      setAttendanceLoading(false);
      return;
    }

    const { data: att, error: attendanceError } =
      await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (attendanceError) {
      console.error(
        'Erreur chargement présences:',
        attendanceError
      );
      setTodayAttendance([]);
    } else {
      setTodayAttendance(
        (att || []) as AttendanceRecord[]
      );
    }

    setAttendanceLoading(false);
  }

  /* =========================
     STATISTIQUES
     ========================= */

  const presentCount = todayAttendance.filter(
    (a) => a.status === 'present'
  ).length;

  const absentCount = todayAttendance.filter(
    (a) => a.status === 'absent'
  ).length;

  const lateCount = todayAttendance.filter(
    (a) => a.status === 'late'
  ).length;

  const totalAttendanceRecords =
    presentCount + absentCount + lateCount;

  const presentRate =
    totalAttendanceRecords > 0
      ? Math.round(
          (presentCount / totalAttendanceRecords) * 100
        )
      : 0;

  const absentRate =
    totalAttendanceRecords > 0
      ? Math.round(
          (absentCount / totalAttendanceRecords) * 100
        )
      : 0;

  const lateRate =
    totalAttendanceRecords > 0
      ? Math.round(
          (lateCount / totalAttendanceRecords) * 100
        )
      : 0;

  const invalidDateRange = startDate > endDate;

  const periodLabel =
    startDate === endDate
      ? startDate
      : `${startDate} → ${endDate}`;

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* =========================
     AUCUNE CLASSE
     ========================= */

  if (myClasses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {t('noClassAssigned')}
        </h3>

        <p className="text-slate-500 text-sm">
          {t('directorCanManageAll')}
        </p>
      </div>
    );
  }

  /* =========================
     CARTES STATISTIQUES
     ========================= */

  const stats = [
    {
      label: t('totalStudents'),
      value: studentCount,
      icon: <Users className="w-5 h-5" />,
      bg: 'bg-teal-50',
      text: 'text-teal-600',
    },
    {
      label: t('presentToday'),
      value: presentCount,
      icon: <CheckCircle className="w-5 h-5" />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: t('absentToday'),
      value: absentCount,
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    {
      label: t('lateToday'),
      value: lateCount,
      icon: <Clock className="w-5 h-5" />,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
          ========================= */}

      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-teal-100 text-sm mb-1">
            {t('welcomeBack')}
          </p>

          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {profile?.subject &&
              getSubjectLabel(profile.subject, lang)}
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
            <p className="text-teal-100 text-sm">
              {getClassName(selectedClass, lang)}
            </p>
          )}
        </div>
      </div>

      {/* =========================
          PLAGE DE DATES
          ========================= */}

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-teal-600" />

          <h3 className="font-semibold text-slate-800">
            {lang === 'ar'
              ? 'الفترة'
              : lang === 'en'
              ? 'Period'
              : 'Période'}
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* DATE DEBUT */}

          <div>
            <label
              htmlFor="teacher-start-date"
              className="block text-sm font-medium text-slate-600 mb-2"
            >
              {lang === 'ar'
                ? 'من'
                : lang === 'en'
                ? 'From'
                : 'Du'}
            </label>

            <input
              id="teacher-start-date"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* DATE FIN */}

          <div>
            <label
              htmlFor="teacher-end-date"
              className="block text-sm font-medium text-slate-600 mb-2"
            >
              {lang === 'ar'
                ? 'إلى'
                : lang === 'en'
                ? 'To'
                : 'Au'}
            </label>

            <input
              id="teacher-end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {invalidDateRange && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-sm text-rose-700">
              {lang === 'ar'
                ? 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية.'
                : lang === 'en'
                ? 'The start date must be before the end date.'
                : 'La date de début doit être antérieure à la date de fin.'}
            </p>
          </div>
        )}

        {!invalidDateRange && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {lang === 'ar'
                ? 'الفترة المحددة'
                : lang === 'en'
                ? 'Selected period'
                : 'Période sélectionnée'}
            </p>

            <span className="text-sm font-semibold text-teal-600">
              {periodLabel}
            </span>
          </div>
        )}
      </div>

      {/* =========================
          CARTES STATISTIQUES
          ========================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {attendanceLoading ? '...' : stat.value}
            </p>

            <p className="text-sm text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* =========================
          POURCENTAGES + ACTIONS
          ========================= */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* POURCENTAGES */}

        <div className="bg-white rounded-2xl p-6 border border-slate-100 lg:col-span-1">

          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-teal-600" />

            <h3 className="font-semibold text-slate-800">
              {lang === 'ar'
                ? 'نسب الحضور'
                : lang === 'en'
                ? 'Attendance percentages'
                : 'Pourcentages de présence'}
            </h3>
          </div>

          {attendanceLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invalidDateRange ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />

              <p className="text-sm text-rose-600">
                {lang === 'ar'
                  ? 'الفترة غير صحيحة'
                  : lang === 'en'
                  ? 'Invalid date range'
                  : 'Période invalide'}
              </p>
            </div>
          ) : totalAttendanceRecords === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />

              <p className="text-sm text-slate-500">
                {lang === 'ar'
                  ? 'لا توجد بيانات حضور لهذه الفترة'
                  : lang === 'en'
                  ? 'No attendance recorded for this period'
                  : 'Aucune présence enregistrée pour cette période'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">

                {/* PRESENCE */}

                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg
                      className="w-20 h-20 -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${(presentRate / 100) * 314} 314`}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">
                        {presentRate}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-emerald-600 mt-2">
                    {lang === 'ar'
                      ? 'حضور'
                      : lang === 'en'
                      ? 'Present'
                      : 'Présence'}
                  </p>
                </div>

                {/* ABSENCE */}

                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg
                      className="w-20 h-20 -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="10"
                        strokeDasharray={`${(absentRate / 100) * 314} 314`}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">
                        {absentRate}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-rose-600 mt-2">
                    {lang === 'ar'
                      ? 'غياب'
                      : lang === 'en'
                      ? 'Absent'
                      : 'Absence'}
                  </p>
                </div>

                {/* RETARD */}

                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg
                      className="w-20 h-20 -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="10"
                        strokeDasharray={`${(lateRate / 100) * 314} 314`}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">
                        {lateRate}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-amber-600 mt-2">
                    {lang === 'ar'
                      ? 'تأخر'
                      : lang === 'en'
                      ? 'Late'
                      : 'Retard'}
                  </p>
                </div>

              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {lang === 'ar'
                    ? 'إجمالي سجلات الحضور'
                    : lang === 'en'
                    ? 'Total attendance records'
                    : 'Total des enregistrements'}
                </p>

                <p className="text-lg font-bold text-slate-800 mt-1">
                  {totalAttendanceRecords}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ACTIONS RAPIDES */}

        <div className="bg-white rounded-2xl p-6 border border-slate-100 lg:col-span-2">

          <h3 className="font-semibold text-slate-800 mb-4">
            {t('quickActions')}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">

            <button
              onClick={() => onNavigate('myClass')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>

              <div>
                <p className="font-medium text-slate-800">
                  {t('students')}
                </p>

                <p className="text-xs text-slate-500">
                  {t('viewStudents')}
                </p>
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
                <p className="font-medium text-slate-800">
                  {t('attendance')}
                </p>

                <p className="text-xs text-slate-500">
                  {t('dailyAttendance')}
                </p>
              </div>
            </button>

          </div>

          {todayAttendance.length === 0 &&
            !attendanceLoading &&
            !invalidDateRange && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />

                  <p className="text-sm text-amber-700">
                    {t('noAttendanceRecorded')}
                  </p>
                </div>
              </div>
            )}

        </div>

      </div>

    </div>
  );
}