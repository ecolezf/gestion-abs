import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { getStudentName, getClassName, todayString, isWeekend, formatDate } from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { ClassRoom, Student, AttendanceRecord, AttendanceStatus } from '@/types/database';
import {
  CalendarCheck, CheckCircle, XCircle, Clock, Save, CheckCheck, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';

export function AttendancePage() {
  const { profile } = useAuth();
  const { t, lang, dir } = useI18n();
  const { showToast } = useToast();
  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [existingRecords, setExistingRecords] = useState<Record<string, AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);

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
      .select('*, level(*)')
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
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  async function loadStudentsAndAttendance() {
    if (!selectedClass) return;

    const { data: studs } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass.id)
      .order('created_at');
    setStudents(studs as Student[] || []);

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', selectedClass.id)
      .eq('date', selectedDate);

    const records: Record<string, AttendanceRecord> = {};
    const statuses: Record<string, AttendanceStatus> = {};
    (data as AttendanceRecord[] || []).forEach((r) => {
      records[r.student_id] = r;
      statuses[r.student_id] = r.status;
    });
    setExistingRecords(records);
    setAttendance(statuses);
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAllPresent() {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { all[s.id] = 'present'; });
    setAttendance(all);
  }

  async function saveAttendance() {
    if (!selectedClass) return;
    setSaving(true);

    const date = new Date(selectedDate);
    if (isWeekend(date)) {
      showToast(t('weekend'), 'warning');
      setSaving(false);
      return;
    }

    const upserts = students.map((s) => {
      const status = attendance[s.id];
      if (!status) return null;
      const existing = existingRecords[s.id];
      if (existing) {
        return supabase.from('attendance').update({ status }).eq('id', existing.id);
      } else {
        return supabase.from('attendance').insert({
          student_id: s.id,
          class_id: selectedClass.id,
          date: selectedDate,
          status,
        });
      }
    }).filter(Boolean);

    const results = await Promise.all(upserts as any[]);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      showToast(t('errorOccurred'), 'error');
    } else {
      showToast(t('attendanceSaved'), 'success');
      loadStudentsAndAttendance();
    }
    setSaving(false);
  }

  function changeDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  const dateObj = new Date(selectedDate);
  const isWeekendDay = isWeekend(dateObj);

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length;

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
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('attendance')}</h1>
            {myClasses.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {myClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      selectedClass?.id === cls.id
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {getClassName(cls, lang)}
                  </button>
                ))}
              </div>
            )}
            {selectedClass && <p className="text-sm text-slate-500 mt-1">{getClassName(selectedClass, lang)}</p>}
          </div>
        </div>
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('noStudents')}</h3>
        </div>
      </div>
    );
  }

  const statusButtons: { status: AttendanceStatus; label: string; icon: React.ReactNode; classes: string }[] = [
    { status: 'present', label: t('present'), icon: <CheckCircle className="w-4 h-4" />, classes: 'bg-emerald-500 text-white border-emerald-500' },
    { status: 'absent', label: t('absent'), icon: <XCircle className="w-4 h-4" />, classes: 'bg-rose-500 text-white border-rose-500' },
    { status: 'late', label: t('late'), icon: <Clock className="w-4 h-4" />, classes: 'bg-amber-500 text-white border-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('attendance')}</h1>
          {myClasses.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {myClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedClass?.id === cls.id
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {getClassName(cls, lang)}
                </button>
              ))}
            </div>
          )}
          {selectedClass && myClasses.length === 1 && <p className="text-sm text-slate-500">{getClassName(selectedClass, lang)}</p>}
        </div>
        <Button onClick={markAllPresent} variant="outline" size="sm">
          <CheckCheck className="w-4 h-4" />
          {t('markAllPresent')}
        </Button>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <div className="flex-1 text-center">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-center font-medium"
          />
          <p className="text-sm text-slate-500 mt-1.5">
            {formatDate(dateObj, lang)}
            {isWeekendDay && <span className="ms-2 text-amber-600 font-medium">({t('weekend')})</span>}
          </p>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {isWeekendDay && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm text-amber-700">{t('weekend')}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
          <p className="text-xs text-slate-500">{t('present')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-rose-600">{absentCount}</p>
          <p className="text-xs text-slate-500">{t('absent')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
          <p className="text-xs text-slate-500">{t('late')}</p>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {students.map((student, i) => {
            const currentStatus = attendance[student.id];
            return (
              <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-6">{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {getStudentName(student, lang).charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{getStudentName(student, lang)}</span>
                </div>
                <div className="flex gap-1.5">
                  {statusButtons.map((btn) => (
                    <button
                      key={btn.status}
                      onClick={() => setStatus(student.id, btn.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                        currentStatus === btn.status
                          ? btn.classes
                          : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {btn.icon}
                      <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={saveAttendance} disabled={saving || isWeekendDay} className="shadow-lg">
          <Save className="w-5 h-5" />
          {saving ? t('saving') : t('saveAttendance')}
        </Button>
      </div>
    </div>
  );
}
