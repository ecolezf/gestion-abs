import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { getClassName, getLevelName, getStudentName, formatDate, getSchoolDaysInMonth, isSchoolDay } from '@/lib/helpers';
import { STATUS_COLORS } from '@/lib/statusStyles';
import { Select, Input } from '@/components/Input';
import { Button } from '@/components/Button';
import type { Level, ClassRoom, Student, AttendanceRecord } from '@/types/database';
import * as XLSX from 'xlsx';
import {
  ClipboardList, Download, TrendingUp, CheckCircle, XCircle, Clock, Calendar, BarChart3,
} from 'lucide-react';

export function ReportsPage() {
  const { t, lang } = useI18n();
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [levelsRes, classesRes] = await Promise.all([
        supabase.from('levels').select('*').order('sort_order'),
        supabase.from('classes').select('*, level(*)').order('created_at'),
      ]);
      setLevels(levelsRes.data as Level[] || []);
      setClasses(classesRes.data as ClassRoom[] || []);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadReportData() {
      let classIds = classes.map((c) => c.id);
      if (filterClass) classIds = [filterClass];
      if (classIds.length === 0) return;

      const [studentsRes, attRes] = await Promise.all([
        supabase.from('students').select('*, class(*)').in('class_id', classIds).order('created_at'),
        supabase.from('attendance').select('*').in('class_id', classIds).gte('date', startDate).lte('date', endDate),
      ]);

      setStudents(studentsRes.data as Student[] || []);
      setAttendance(attRes.data as AttendanceRecord[] || []);
    }
    if (classes.length > 0) {
      loadReportData();
    }
  }, [classes, filterClass, startDate, endDate]);

  const attendanceMap: Record<string, { present: number; absent: number; late: number; total: number }> = {};
  students.forEach((s) => { attendanceMap[s.id] = { present: 0, absent: 0, late: 0, total: 0 }; });
  attendance.forEach((a) => {
    if (!attendanceMap[a.student_id]) return;
    attendanceMap[a.student_id][a.status as 'present' | 'absent' | 'late']++;
    attendanceMap[a.student_id].total++;
  });

  const totalPresent = attendance.filter((a) => a.status === 'present').length;
  const totalAbsent = attendance.filter((a) => a.status === 'absent').length;
  const totalLate = attendance.filter((a) => a.status === 'late').length;
  const totalRecords = attendance.length;
  const presentRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  const absentRate = totalRecords > 0 ? Math.round((totalAbsent / totalRecords) * 100) : 0;
  const lateRate = totalRecords > 0 ? Math.round((totalLate / totalRecords) * 100) : 0;

  function exportReport() {
    const data = students.map((s, i) => {
      const stats = attendanceMap[s.id];
      const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      return {
        '#': i + 1,
        'Student': getStudentName(s, lang),
        'Class': s.class ? getClassName(s.class as ClassRoom, lang) : '-',
        'Present': stats.present,
        'Absent': stats.absent,
        'Late': stats.late,
        'Total Days': stats.total,
        'Rate %': rate,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `attendance_report_${startDate}_to_${endDate}.xlsx`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: t('totalPresent'), value: totalPresent, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: t('totalAbsent'), value: totalAbsent, icon: <XCircle className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-600' },
    { label: t('totalLate'), value: totalLate, icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: t('totalRecords'), value: totalRecords, icon: <BarChart3 className="w-5 h-5" />, bg: 'bg-cyan-50', text: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('reports')}</h1>
          <p className="text-sm text-slate-500">{t('attendanceReport')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport} disabled={students.length === 0}>
          <Download className="w-4 h-4" />
          {t('exportExcel')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="grid sm:grid-cols-3 gap-4">
          <Select label={t('class')} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">{t('allClasses')}</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{getClassName(c, lang)}</option>)}
          </Select>
          <Input label={t('startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label={t('endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Rate cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-emerald-100">{t('presentRate')}</span>
            <CheckCircle className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-bold">{presentRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-rose-100">{t('absentRate')}</span>
            <XCircle className="w-5 h-5 text-rose-200" />
          </div>
          <p className="text-3xl font-bold">{absentRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-100">{t('lateRate')}</span>
            <Clock className="w-5 h-5 text-amber-200" />
          </div>
          <p className="text-3xl font-bold">{lateRate}%</p>
        </div>
      </div>

      {/* Per-student table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{t('studentsList')}</h3>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">{t('noDataForRange')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">#</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('student')}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('class')}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{t('present')}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{t('absent')}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{t('late')}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{t('rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student, i) => {
                  const stats = attendanceMap[student.id];
                  const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
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
                      <td className="px-4 py-3 text-center text-sm font-medium text-emerald-600">{stats.present}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-rose-600">{stats.absent}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-amber-600">{stats.late}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{rate}%</span>
                        </div>
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
