import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { getClassName, getLevelName, getStudentName, getProfileName, formatDate, todayString, isWeekend } from '@/lib/helpers';
import { STATUS_COLORS } from '@/lib/statusStyles';
import { Select } from '@/components/Input';
import type { Level, ClassRoom, Student, AttendanceRecord } from '@/types/database';
import { CalendarCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function AllAttendancePage() {
  const { t, lang, dir } = useI18n();
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [filterLevel, setFilterLevel] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [levelsRes, classesRes] = await Promise.all([
        supabase.from('levels').select('*').order('sort_order'),
        supabase.from('classes').select('*, level(*), teacher(*)').order('created_at'),
      ]);
      setLevels(levelsRes.data as Level[] || []);
      setClasses(classesRes.data as ClassRoom[] || []);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadAttendanceData() {
      let classIds = classes.map((c) => c.id);
      if (filterLevel) {
        classIds = classes.filter((c) => c.level_id === filterLevel).map((c) => c.id);
      }
      if (filterClass) {
        classIds = [filterClass];
      }
      if (classIds.length === 0) {
        setStudents([]);
        setAttendance([]);
        return;
      }

      const [studentsRes, attRes] = await Promise.all([
        supabase.from('students').select('*, class(*)').in('class_id', classIds).order('created_at'),
        supabase.from('attendance').select('*').in('class_id', classIds).eq('date', selectedDate),
      ]);

      setStudents(studentsRes.data as Student[] || []);
      setAttendance(attRes.data as AttendanceRecord[] || []);
    }
    if (classes.length > 0) {
      loadAttendanceData();
    }
  }, [classes, filterLevel, filterClass, selectedDate]);

  function changeDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  const filteredClasses = filterLevel ? classes.filter((c) => c.level_id === filterLevel) : classes;

  const attendanceMap: Record<string, AttendanceRecord> = {};
  attendance.forEach((a) => { attendanceMap[a.student_id] = a; });

  const filteredStudents = students.filter((s) => {
    const name = getStudentName(s, lang).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const isWeekendDay = isWeekend(dateObj);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('allAttendance')}</h1>
        <p className="text-sm text-slate-500">{t('dailyAttendance')}</p>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <div className="flex-1 text-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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

      {/* Filters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setFilterClass(''); }}>
          <option value="">{t('allLevels')}</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{getLevelName(l, lang)}</option>)}
        </Select>
        <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
          <option value="">{t('allClasses')}</option>
          {filteredClasses.map((c) => <option key={c.id} value={c.id}>{getClassName(c, lang)}</option>)}
        </Select>
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">{t('noStudents')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">#</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('student')}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('class')}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student, i) => {
                  const record = attendanceMap[student.id];
                  const status = record?.status;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {getStudentName(student, lang).charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{getStudentName(student, lang)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {student.class ? getClassName(student.class as ClassRoom, lang) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {status ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} ${STATUS_COLORS[status].border} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status].dot}`} />
                            {t(status as any)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
