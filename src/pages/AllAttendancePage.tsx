import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import {
  getClassName,
  getLevelName,
  getStudentName,
  formatDate,
  todayString,
  isWeekend,
} from '@/lib/helpers';
import { STATUS_COLORS } from '@/lib/statusStyles';
import { Select } from '@/components/Input';
import type { Level, ClassRoom, Student, AttendanceRecord } from '@/types/database';
import {
  CalendarCheck,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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

  // =========================================================
  // Charger niveaux + classes
  // =========================================================
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [levelsRes, classesRes] = await Promise.all([
        supabase
          .from('levels')
          .select('*')
          .order('sort_order'),

        // IMPORTANT :
        // pas de level(*) ni teacher(*)
        supabase
          .from('classes')
          .select('*')
          .order('created_at'),
      ]);

      if (levelsRes.error) {
        console.error('Erreur chargement niveaux:', levelsRes.error);
      }

      if (classesRes.error) {
        console.error('Erreur chargement classes:', classesRes.error);
      }

      setLevels((levelsRes.data || []) as Level[]);
      setClasses((classesRes.data || []) as ClassRoom[]);

      setLoading(false);
    }

    loadData();
  }, []);

  // =========================================================
  // Charger élèves + présence
  // =========================================================
  useEffect(() => {
    async function loadAttendanceData() {
      let classIds = classes.map((c) => c.id);

      if (filterLevel) {
        classIds = classes
          .filter((c) => c.level_id === filterLevel)
          .map((c) => c.id);
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
        // IMPORTANT :
        // pas de class(*)
        supabase
          .from('students')
          .select('*')
          .in('class_id', classIds)
          .order('created_at'),

        supabase
          .from('attendance')
          .select('*')
          .in('class_id', classIds)
          .eq('date', selectedDate),
      ]);

      if (studentsRes.error) {
        console.error('Erreur chargement élèves:', studentsRes.error);
      }

      if (attRes.error) {
        console.error('Erreur chargement présence:', attRes.error);
      }

      const studentsData = (studentsRes.data || []) as Student[];

      // On rattache manuellement la classe à chaque élève.
      const studentsWithClass = studentsData.map((student) => ({
        ...student,
        class: classes.find((cls) => cls.id === student.class_id),
      }));

      setStudents(studentsWithClass as Student[]);
      setAttendance((attRes.data || []) as AttendanceRecord[]);
    }

    if (classes.length > 0) {
      loadAttendanceData();
    } else if (!loading) {
      setStudents([]);
      setAttendance([]);
    }
  }, [classes, filterLevel, filterClass, selectedDate, loading]);

  // =========================================================
  // Changer de date
  // =========================================================
  function changeDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);

    setSelectedDate(
      d.toISOString().split('T')[0]
    );
  }

  // =========================================================
  // Classes filtrées
  // =========================================================
  const filteredClasses = filterLevel
    ? classes.filter((c) => c.level_id === filterLevel)
    : classes;

  // =========================================================
  // Map des présences
  // =========================================================
  const attendanceMap: Record<string, AttendanceRecord> = {};

  attendance.forEach((record) => {
    attendanceMap[record.student_id] = record;
  });

  // =========================================================
  // Élèves filtrés par recherche
  // =========================================================
  const filteredStudents = students.filter((student) => {
    const name = getStudentName(student, lang).toLowerCase();

    return name.includes(search.toLowerCase());
  });

  // =========================================================
  // Compteurs
  // =========================================================
  const presentCount = attendance.filter(
    (a) => a.status === 'present'
  ).length;

  const absentCount = attendance.filter(
    (a) => a.status === 'absent'
  ).length;

  const lateCount = attendance.filter(
    (a) => a.status === 'late'
  ).length;

  // =========================================================
  // Chargement
  // =========================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const isWeekendDay = isWeekend(dateObj);

  // =========================================================
  // Interface
  // =========================================================
  return (
    <div className="space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t('allAttendance')}
        </h1>

        <p className="text-sm text-slate-500">
          {t('dailyAttendance')}
        </p>
      </div>

      {/* Sélecteur de date */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">

        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {dir === 'rtl' ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
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

            {isWeekendDay && (
              <span className="ms-2 text-amber-600 font-medium">
                ({t('weekend')})
              </span>
            )}
          </p>

        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {dir === 'rtl' ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

      </div>

      {/* Filtres */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <Select
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value);
            setFilterClass('');
          }}
        >
          <option value="">
            {t('allLevels')}
          </option>

          {levels.map((level) => (
            <option
              key={level.id}
              value={level.id}
            >
              {getLevelName(level, lang)}
            </option>
          ))}
        </Select>

        <Select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">
            {t('allClasses')}
          </option>

          {filteredClasses.map((cls) => (
            <option
              key={cls.id}
              value={cls.id}
            >
              {getClassName(cls, lang)}
            </option>
          ))}
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

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {presentCount}
          </p>

          <p className="text-xs text-slate-500">
            {t('present')}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-rose-600">
            {absentCount}
          </p>

          <p className="text-xs text-slate-500">
            {t('absent')}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {lateCount}
          </p>

          <p className="text-xs text-slate-500">
            {t('late')}
          </p>
        </div>

      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

        {filteredStudents.length === 0 ? (

          <div className="text-center py-16">

            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-slate-300" />
            </div>

            <p className="text-slate-500">
              {t('noStudents')}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-100">

                <tr>

                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">
                    #
                  </th>

                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">
                    {t('student')}
                  </th>

                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">
                    {t('class')}
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    {t('status')}
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-50">

                {filteredStudents.map((student, index) => {

                  const record = attendanceMap[student.id];
                  const status = record?.status;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      <td className="px-4 py-3 text-sm text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {getStudentName(student, lang).charAt(0)}
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {getStudentName(student, lang)}
                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {student.class
                          ? getClassName(
                              student.class as ClassRoom,
                              lang
                            )
                          : '-'}
                      </td>

                      <td className="px-4 py-3 text-center">

                        {status ? (

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[status].bg
                            } ${
                              STATUS_COLORS[status].text
                            } ${
                              STATUS_COLORS[status].border
                            } border`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                STATUS_COLORS[status].dot
                              }`}
                            />

                            {t(status as any)}

                          </span>

                        ) : (

                          <span className="text-xs text-slate-300">
                            -
                          </span>

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