import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import {
  getStudentName,
  getClassName,
  getProfileName,
  isWeekend,
} from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type {
  ClassRoom,
  Student,
  AttendanceRecord,
  AttendanceStatus,
} from '@/types/database';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface SchoolHoliday {
  id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  start_date: string;
  end_date: string;
}

interface DayInfo {
  date: string;
  day: number;
  isWeekend: boolean;
  holiday?: SchoolHoliday;
  outsideSchoolYear: boolean;
  isSchoolYearStart: boolean;
}

interface StudentMonthlyStats {
  student: Student;
  present: number;
  absent: number;
  late: number;
  recorded: number;
  attendanceRate: number;
  records: Record<string, AttendanceRecord>;
}

function getMonthStart(month: string) {
  return `${month}-01`;
}

function getMonthEnd(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);

  const lastDay = new Date(
    year,
    monthNumber,
    0
  ).getDate();

  return `${month}-${String(lastDay).padStart(2, '0')}`;
}

function formatMonthTitle(month: string, lang: string) {
  const [year, monthNumber] = month.split('-').map(Number);

  const date = new Date(year, monthNumber - 1, 1);

  const locale =
    lang === 'ar'
      ? 'ar-DZ'
      : lang === 'en'
        ? 'en-US'
        : 'fr-FR';

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatSchoolDate(dateString: string, lang: string) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const locale =
    lang === 'ar'
      ? 'ar-DZ'
      : lang === 'en'
        ? 'en-US'
        : 'fr-FR';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getSchoolYearStartLabel(lang: string) {
  if (lang === 'ar') {
    return 'تاريخ الدخول المدرسي';
  }

  if (lang === 'en') {
    return 'School start date';
  }

  return 'Date de rentrée scolaire';
}

function getBackToSchoolShortLabel(lang: string) {
  if (lang === 'ar') {
    return 'دخول';
  }

  if (lang === 'en') {
    return 'Start';
  }

  return 'Rentrée';
}

function buildMonthDays(
  month: string,
  holidays: SchoolHoliday[],
  schoolYearStart: string | null,
  schoolYearEnd: string | null
): DayInfo[] {
  const [year, monthNumber] = month.split('-').map(Number);

  const daysInMonth = new Date(
    year,
    monthNumber,
    0
  ).getDate();

  const days: DayInfo[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;

    const holiday = holidays.find(
      (item) =>
        date >= item.start_date &&
        date <= item.end_date
    );

    const outsideSchoolYear =
      (!!schoolYearStart && date < schoolYearStart) ||
      (!!schoolYearEnd && date > schoolYearEnd);

    const isSchoolYearStart =
      !!schoolYearStart && date === schoolYearStart;

    days.push({
      date,
      day,
      isWeekend: isWeekend(
        new Date(`${date}T00:00:00`)
      ),
      holiday,
      outsideSchoolYear,
      isSchoolYearStart,
    });
  }

  return days;
}

function getHolidayName(
  holiday: SchoolHoliday,
  lang: string
) {
  if (lang === 'ar') {
    return (
      holiday.name_ar ||
      holiday.name_fr ||
      'عطلة'
    );
  }

  if (lang === 'en') {
    return (
      holiday.name_en ||
      holiday.name_fr ||
      'Holiday'
    );
  }

  return holiday.name_fr || 'Vacances';
}

function isHolidayDate(
  date: string,
  holidays: SchoolHoliday[]
) {
  return holidays.some(
    (holiday) =>
      date >= holiday.start_date &&
      date <= holiday.end_date
  );
}

function changeMonth(month: string, amount: number) {
  const [year, monthNumber] = month
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    monthNumber - 1 + amount,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
}

export function TeacherMonthlyReportPage() {
  const { profile } = useAuth();
  const { t, lang, dir } = useI18n();

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const [myClasses, setMyClasses] = useState<ClassRoom[]>(
    []
  );

  const [selectedClass, setSelectedClass] =
    useState<ClassRoom | null>(null);

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);

  const [students, setStudents] = useState<Student[]>([]);

  const [attendance, setAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [schoolName, setSchoolName] = useState('');
  const [schoolYearStart, setSchoolYearStart] = useState<string | null>(null);
  const [schoolYearEnd, setSchoolYearEnd] = useState<string | null>(null);

  const [holidays, setHolidays] = useState<SchoolHoliday[]>([]);

  const [showPreview, setShowPreview] = useState(false);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);

  /*
   * ---------------------------------------------------------
   * Charger les classes de l'enseignant
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadClasses() {
      if (!profile) return;

      setLoading(true);

      const { data: classTeacherData, error } =
        await supabase
          .from('class_teachers')
          .select('class_id')
          .eq('teacher_id', profile.id);

      if (error) {
        console.error(
          'Erreur chargement affectations enseignant:',
          error
        );

        setMyClasses([]);
        setSelectedClass(null);
        setLoading(false);
        return;
      }

      const classIds = (
        classTeacherData || []
      ).map((item: any) => item.class_id);

      if (classIds.length === 0) {
        setMyClasses([]);
        setSelectedClass(null);
        setLoading(false);
        return;
      }

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

      const classes = (classesData ||
        []) as ClassRoom[];

      setMyClasses(classes);

      setSelectedClass((current) => {
        if (
          current &&
          classes.some((cls) => cls.id === current.id)
        ) {
          return current;
        }

        return classes[0] || null;
      });

      setLoading(false);
    }

    loadClasses();
  }, [profile]);

  /*
   * ---------------------------------------------------------
   * Charger le nom de l'école
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadSchoolSettings() {
      const { data, error } = await supabase
        .from('school_settings')
        .select(
          'school_name, school_name_ar, school_name_en, school_year, start_date, end_date'
        )
        .eq('singleton_key', 'school')
        .maybeSingle();

      if (error) {
        console.error(
          'Erreur chargement établissement:',
          error
        );
        return;
      }

      if (!data) return;

      let name = data.school_name || '';

      if (lang === 'ar') {
        name =
          data.school_name_ar ||
          data.school_name ||
          '';
      } else if (lang === 'en') {
        name =
          data.school_name_en ||
          data.school_name ||
          '';
      }

      setSchoolName(name);
      setSchoolYearStart(data.start_date || null);
      setSchoolYearEnd(data.end_date || null);
    }

    loadSchoolSettings();
  }, [lang]);

  /*
   * ---------------------------------------------------------
   * Charger les vacances scolaires
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadHolidays() {
      const { data, error } = await supabase
        .from('school_holidays')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error(
          'Erreur chargement vacances scolaires:',
          error
        );
        setHolidays([]);
        return;
      }

      setHolidays(
        (data || []) as SchoolHoliday[]
      );
    }

    loadHolidays();
  }, []);

  /*
   * ---------------------------------------------------------
   * Charger élèves + présence du mois
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadMonthlyData() {
      if (!selectedClass) {
        setStudents([]);
        setAttendance([]);
        return;
      }

      setLoading(true);

      const startDate = getMonthStart(
        selectedMonth
      );

      const endDate = getMonthEnd(
        selectedMonth
      );

      const [studentsRes, attendanceRes] =
        await Promise.all([
          supabase
            .from('students')
            .select('*')
            .eq('class_id', selectedClass.id)
            .order('created_at'),

          supabase
            .from('attendance')
            .select('*')
            .eq('class_id', selectedClass.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date'),
        ]);

      if (studentsRes.error) {
        console.error(
          'Erreur chargement élèves:',
          studentsRes.error
        );
      }

      if (attendanceRes.error) {
        console.error(
          'Erreur chargement présence:',
          attendanceRes.error
        );
      }

      setStudents(
        (studentsRes.data || []) as Student[]
      );

      setAttendance(
        (attendanceRes.data ||
          []) as AttendanceRecord[]
      );

      setLoading(false);
    }

    loadMonthlyData();
  }, [selectedClass, selectedMonth]);

  /*
   * ---------------------------------------------------------
   * Jours du mois
   * ---------------------------------------------------------
   */
  const monthDays = useMemo(
    () =>
      buildMonthDays(
        selectedMonth,
        holidays,
        schoolYearStart,
        schoolYearEnd
      ),
    [selectedMonth, holidays, schoolYearStart, schoolYearEnd]
  );

  const monthHolidays = useMemo(() => {
    const startDate = getMonthStart(selectedMonth);
    const endDate = getMonthEnd(selectedMonth);

    return holidays.filter(
      (holiday) =>
        holiday.start_date <= endDate &&
        holiday.end_date >= startDate
    );
  }, [selectedMonth, holidays]);

  /*
   * ---------------------------------------------------------
   * Map présence
   * ---------------------------------------------------------
   */
  const schoolAttendance = useMemo(
    () =>
      attendance.filter(
        (record) =>
          !isHolidayDate(
            record.date,
            holidays
          ) &&
          (!schoolYearStart || record.date >= schoolYearStart) &&
          (!schoolYearEnd || record.date <= schoolYearEnd)
      ),
    [attendance, holidays, schoolYearStart, schoolYearEnd]
  );

  const attendanceMap = useMemo(() => {
    const map: Record<
      string,
      Record<string, AttendanceRecord>
    > = {};

    schoolAttendance.forEach((record) => {
      if (!map[record.student_id]) {
        map[record.student_id] = {};
      }

      map[record.student_id][record.date] =
        record;
    });

    return map;
  }, [schoolAttendance]);

  /*
   * ---------------------------------------------------------
   * Statistiques par élève
   * ---------------------------------------------------------
   */
  const studentStats = useMemo(() => {
    const result: StudentMonthlyStats[] = [];

    students.forEach((student) => {
      const records =
        attendanceMap[student.id] || {};

      let present = 0;
      let absent = 0;
      let late = 0;

      Object.values(records).forEach((record) => {
        if (record.status === 'present') {
          present++;
        } else if (record.status === 'absent') {
          absent++;
        } else if (record.status === 'late') {
          late++;
        }
      });

      const recorded =
        present + absent + late;

      const attendanceRate =
        recorded > 0
          ? Math.round(
              (present / recorded) * 100
            )
          : 0;

      result.push({
        student,
        present,
        absent,
        late,
        recorded,
        attendanceRate,
        records,
      });
    });

    return result;
  }, [students, attendanceMap]);

  /*
   * ---------------------------------------------------------
   * Statistiques générales
   * ---------------------------------------------------------
   */
  const totalPresent = schoolAttendance.filter(
    (record) =>
      record.status === 'present'
  ).length;

  const totalAbsent = schoolAttendance.filter(
    (record) =>
      record.status === 'absent'
  ).length;

  const totalLate = schoolAttendance.filter(
    (record) =>
      record.status === 'late'
  ).length;

  const totalRecorded =
    totalPresent +
    totalAbsent +
    totalLate;

  const overallAttendanceRate =
    totalRecorded > 0
      ? Math.round(
          (totalPresent / totalRecorded) *
            100
        )
      : 0;

  const overallAbsenceRate =
    totalRecorded > 0
      ? Math.round(
          (totalAbsent / totalRecorded) *
            100
        )
      : 0;

  const overallLateRate =
    totalRecorded > 0
      ? Math.round(
          (totalLate / totalRecorded) *
            100
        )
      : 0;

  const schoolDays = monthDays.filter(
    (day) =>
      !day.isWeekend &&
      !day.holiday &&
      !day.outsideSchoolYear
  ).length;

  const recordedDays = new Set(
    schoolAttendance.map((record) => record.date)
  ).size;


  /*
   * ---------------------------------------------------------
   * Aperçu et téléchargement PDF
   * ---------------------------------------------------------
   */
  function loadExternalScript(
    src: string,
    id: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null;

      if (existing?.dataset.loaded === 'true') {
        resolve();
        return;
      }

      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Impossible de charger ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Impossible de charger ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async function downloadPdf() {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);

    try {
      // Le rapport doit être visible pour que html2canvas puisse le capturer.
      if (!showPreview) {
        setShowPreview(true);
        await new Promise((resolve) =>
          window.setTimeout(resolve, 180)
        );
      }

      await loadExternalScript(
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        'school-report-html2canvas'
      );

      await loadExternalScript(
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
        'school-report-jspdf'
      );

      const reportElement = previewRef.current;

      if (!reportElement) {
        throw new Error('Aperçu du rapport introuvable.');
      }

      const html2canvas = (window as any).html2canvas;
      const jsPDF = (window as any).jspdf?.jsPDF;

      if (!html2canvas || !jsPDF) {
        throw new Error('Les bibliothèques PDF ne sont pas disponibles.');
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const margin = 4;
      const pageWidth = 297 - margin * 2;
      const pageHeight = 210 - margin * 2;
      const imageRatio = canvas.width / canvas.height;

      let imageWidth = pageWidth;
      let imageHeight = imageWidth / imageRatio;

      if (imageHeight > pageHeight) {
        imageHeight = pageHeight;
        imageWidth = imageHeight * imageRatio;
      }

      const x = (297 - imageWidth) / 2;
      const y = (210 - imageHeight) / 2;

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        'FAST'
      );

      const className = selectedClass
        ? getClassName(selectedClass, 'fr')
        : 'classe';

      const safeClassName = className
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      pdf.save(
        `rapport-mensuel-${safeClassName || 'classe'}-${selectedMonth}.pdf`
      );
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      window.alert(
        lang === 'ar'
          ? 'تعذر تنزيل ملف PDF.'
          : lang === 'en'
            ? 'Unable to download the PDF.'
            : 'Impossible de télécharger le PDF.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function openPreview() {
    setShowPreview(true);
  }

  function closePreview() {
    setShowPreview(false);
  }

  /*
   * ---------------------------------------------------------
   * Chargement
   * ---------------------------------------------------------
   */
  if (loading && myClasses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Aucune classe
   * ---------------------------------------------------------
   */
  if (!loading && myClasses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {t('noClassAssigned')}
        </h3>

        <p className="text-sm text-slate-500">
          {t('noClasses')}
        </p>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Fonctions d'affichage
   * ---------------------------------------------------------
   */
  function getStatusLabel(
    status: AttendanceStatus | undefined
  ) {
    if (status === 'present') {
      return t('presentShort');
    }

    if (status === 'absent') {
      return t('absentShort');
    }

    if (status === 'late') {
      return t('lateShort');
    }

    return '—';
  }

  function getStatusClass(
    status: AttendanceStatus | undefined
  ) {
    if (status === 'present') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }

    if (status === 'absent') {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }

    if (status === 'late') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }

    return 'bg-slate-50 text-slate-300 border-slate-100';
  }

  function getStatusTitle(
    status: AttendanceStatus | undefined
  ) {
    if (status === 'present') {
      return t('present');
    }

    if (status === 'absent') {
      return t('absent');
    }

    if (status === 'late') {
      return t('late');
    }

    return t('noAttendanceRecorded');
  }

  /*
   * ---------------------------------------------------------
   * Affichage
   * ---------------------------------------------------------
   */
  return (
    <div id="monthly-report" dir={dir} className="monthly-report space-y-6 print:space-y-3">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('monthlyReport')}
              </h1>

              <p className="text-sm text-slate-500">
                {formatMonthTitle(
                  selectedMonth,
                  lang
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openPreview}
            size="lg"
            variant="outline"
            className="shadow-sm"
          >
            <FileText className="w-5 h-5" />
            Aperçu
          </Button>

          <Button
            onClick={downloadPdf}
            size="lg"
            className="shadow-md"
            disabled={isGeneratingPdf}
          >
            <Download className="w-5 h-5" />
            {isGeneratingPdf
              ? lang === 'ar'
                ? 'جارٍ التحميل...'
                : lang === 'en'
                  ? 'Downloading...'
                  : 'Téléchargement...'
              : lang === 'ar'
                ? 'تنزيل PDF'
                : lang === 'en'
                  ? 'Download PDF'
                  : 'Télécharger PDF'}
          </Button>
        </div>
      </div>

      {/* =====================================================
          ENTÊTE DU RAPPORT POUR IMPRESSION
      ====================================================== */}
      <div className="hidden print:block report-print-header">
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
          {schoolName && (
            <h1 className="text-xl font-bold text-slate-900">
              {schoolName}
            </h1>
          )}

          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {t('monthlyReport')}
          </h2>

          <p className="text-sm text-slate-600 mt-1">
            {formatMonthTitle(
              selectedMonth,
              lang
            )}
          </p>

          {selectedClass && (
            <p className="text-sm font-medium text-slate-700 mt-2">
              {getClassName(
                selectedClass,
                lang
              )}
            </p>
          )}

          {profile && (
            <p className="text-xs text-slate-500 mt-1">
              {getProfileName(profile, lang)}
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Classe */}
          {myClasses.length > 1 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('selectClass')}
              </label>

              <select
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const cls = myClasses.find(
                    (item) =>
                      item.id === e.target.value
                  );

                  setSelectedClass(
                    cls || null
                  );
                }}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {myClasses.map((cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                  >
                    {getClassName(
                      cls,
                      lang
                    )}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mois */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('month') || 'Mois'}
            </label>

            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
            />
          </div>

          {/* Navigation mois */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedMonth(
                  changeMonth(
                    selectedMonth,
                    -1
                  )
                )
              }
              className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              title={t('previous')}
            >
              {dir === 'rtl' ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedMonth(
                  changeMonth(
                    selectedMonth,
                    1
                  )
                )
              }
              className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              title={t('next')}
            >
              {dir === 'rtl' ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          INFOS RAPPORT
      ====================================================== */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/80">
              {schoolName}
            </p>

            <h2 className="text-xl font-bold mt-1">
              {selectedClass
                ? getClassName(
                    selectedClass,
                    lang
                  )
                : ''}
            </h2>

            <p className="text-sm text-white/80 mt-1">
              {formatMonthTitle(
                selectedMonth,
                lang
              )}
            </p>

            {schoolYearStart && (
              <p className="text-xs text-white/90 mt-2 font-medium">
                {getSchoolYearStartLabel(lang)}: {formatSchoolDate(schoolYearStart, lang)}
              </p>
            )}
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs text-white/70">
              {t('teacherName')}
            </p>

            <p className="font-semibold">
              {profile
                ? getProfileName(
                    profile,
                    lang
                  )
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}
      <div className="grid grid-cols-6 gap-2">
        {/* Élèves */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-800 leading-none">
              {students.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('totalStudents')}
            </p>
          </div>
        </div>

        {/* Jours scolaires */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-800 leading-none">
              {schoolDays}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('schoolDay')}
            </p>
          </div>
        </div>

        {/* Jours enregistrés */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-800 leading-none">
              {recordedDays}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('attendanceByDay')}
            </p>
          </div>
        </div>

        {/* Présence */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-emerald-600 leading-none">
              {totalPresent}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('present')}
            </p>
          </div>
        </div>

        {/* Absences */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-rose-600 leading-none">
              {totalAbsent}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('absent')}
            </p>
          </div>
        </div>

        {/* Retards */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-amber-600 leading-none">
              {totalLate}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {t('late')}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          TAUX GLOBAL
      ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />

              <h3 className="font-semibold text-slate-800">
                {t('attendanceRate')}
              </h3>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              {totalRecorded > 0
                ? `${totalRecorded} ${t('results')}`
                : t('noAttendanceRecorded')}
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="text-center min-w-[72px]">
              <p className="text-3xl font-bold text-emerald-600">
                {overallAttendanceRate}%
              </p>
              <p className="text-xs text-slate-500">
                {t('presentRate')}
              </p>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-center min-w-[72px]">
              <p className="text-2xl font-bold text-rose-600">
                {overallAbsenceRate}%
              </p>
              <p className="text-xs text-slate-500">
                {t('absent')}
              </p>
            </div>

            <div className="text-center min-w-[72px]">
              <p className="text-2xl font-bold text-amber-600">
                {overallLateRate}%
              </p>
              <p className="text-xs text-slate-500">
                {t('late')}
              </p>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-5">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
              style={{
                width: `${overallAttendanceRate}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          LÉGENDE
      ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-semibold text-slate-700">
            {t('attendanceByStatus')} :
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700">
              {t('presentShort')}
            </span>
            {t('present')}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-rose-100 border border-rose-200 flex items-center justify-center text-xs font-bold text-rose-700">
              {t('absentShort')}
            </span>
            {t('absent')}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-xs font-bold text-amber-700">
              {t('lateShort')}
            </span>
            {t('late')}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-slate-200 border border-slate-300" />
            {t('weekend')}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300" />
            {t('outsideSchoolYear')}
          </span>

          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-700">
              {t('holidayShort')}
            </span>
            {t('schoolHoliday')}
          </span>
        </div>
      </div>

      {monthHolidays.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                {t('schoolHolidaysThisMonth')}
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {monthHolidays.map((holiday) => (
                  <span
                    key={holiday.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800"
                  >
                    <span className="font-semibold">
                      {getHolidayName(
                        holiday,
                        lang
                      )}
                    </span>
                    <span className="text-amber-600">
                      {holiday.start_date} → {holiday.end_date}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TABLEAU MENSUEL
      ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">
              {formatMonthTitle(
                selectedMonth,
                lang
              )}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {t('attendanceHistory')}
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {students.length}{' '}
            {t('totalStudents')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse text-xs min-w-max w-full">
            <thead>
              <tr>
                <th
                  className={`sticky ${dir === 'rtl' ? 'right-0' : 'left-0'} z-20 bg-slate-800 text-white px-3 py-3 text-start min-w-[190px] border-r border-slate-700`}
                >
                  {t('studentName')}
                </th>

                {monthDays.map((day) => (
                  <th
                    key={day.date}
                    className={`w-10 min-w-[40px] px-1 py-2 text-center border-r ${
                      day.holiday
                        ? 'bg-amber-200 text-amber-900 border-amber-300'
                        : day.outsideSchoolYear
                          ? 'bg-slate-100 text-slate-400 border-slate-300'
                          : day.isWeekend
                            ? 'bg-slate-300 text-slate-600 border-slate-400'
                            : day.isSchoolYearStart
                              ? 'bg-teal-200 text-teal-900 border-teal-300'
                              : 'bg-slate-700 text-white border-slate-600'
                    }`}
                    title={
                      day.holiday
                        ? getHolidayName(
                            day.holiday,
                            lang
                          )
                        : day.outsideSchoolYear
                          ? t('outsideSchoolYear')
                          : day.isWeekend
                            ? t('weekend')
                            : day.isSchoolYearStart
                              ? t('schoolYearStart')
                              : ''
                    }
                  >
                    <div className="font-bold">
                      {day.day}
                    </div>

                    {day.holiday && (
                      <div className="text-[8px] font-normal mt-0.5 leading-none">
                        {t('holidayShort')}
                      </div>
                    )}

                    {!day.holiday && !day.outsideSchoolYear && day.isWeekend && (
                      <div className="text-[8px] font-normal mt-0.5">
                        {t('weekend')}
                      </div>
                    )}

                    {!day.holiday && !day.outsideSchoolYear && !day.isWeekend && day.isSchoolYearStart && (
                      <div className="text-[8px] font-normal mt-0.5 leading-none">
                        {getBackToSchoolShortLabel(lang)}
                      </div>
                    )}
                  </th>
                ))}

                <th className="bg-emerald-700 text-white px-3 py-3 text-center min-w-[75px]">
                  {t('presentShort')}
                </th>

                <th className="bg-rose-700 text-white px-3 py-3 text-center min-w-[75px]">
                  {t('absentShort')}
                </th>

                <th className="bg-amber-600 text-white px-3 py-3 text-center min-w-[75px]">
                  {t('lateShort')}
                </th>

                <th className="bg-teal-700 text-white px-3 py-3 text-center min-w-[80px]">
                  %
                </th>
              </tr>
            </thead>

            <tbody>
              {studentStats.map(
                (item, index) => (
                  <tr
                    key={item.student.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50'
                    }
                  >
                    {/* Nom élève */}
                    <td
                      className={`sticky ${
                        dir === 'rtl'
                          ? 'right-0'
                          : 'left-0'
                      } z-10 px-3 py-2 border-r border-b border-slate-200 font-medium text-slate-700 ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-slate-400">
                          {index + 1}
                        </span>

                        <span>
                          {getStudentName(
                            item.student,
                            lang
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Jours */}
                    {monthDays.map(
                      (day) => {
                        const record =
                          item.records[
                            day.date
                          ];

                        const status =
                          record?.status;

                        if (day.holiday) {
                          return (
                            <td
                              key={day.date}
                              className="w-10 min-w-[40px] h-10 bg-amber-100 border-r border-b border-amber-200 text-center align-middle"
                              title={`${getHolidayName(
                                day.holiday,
                                lang
                              )} (${day.holiday.start_date} → ${day.holiday.end_date})`}
                            >
                              <span className="text-amber-700 font-bold text-[9px] leading-none">
                                {t('holidayShort')}
                              </span>
                            </td>
                          );
                        }

                        if (day.outsideSchoolYear) {
                          return (
                            <td
                              key={day.date}
                              className="w-10 min-w-[40px] h-10 bg-slate-100 border-r border-b border-slate-300 text-center align-middle"
                              title={`${t('outsideSchoolYear')}${schoolYearStart ? ` — ${getSchoolYearStartLabel(lang)}: ${formatSchoolDate(schoolYearStart, lang)}` : ''}`}
                            >
                            </td>
                          );
                        }

                        if (
                          day.isWeekend
                        ) {
                          return (
                            <td
                              key={
                                day.date
                              }
                              className="w-10 min-w-[40px] h-10 bg-slate-200 border-r border-b border-slate-300 text-center"
                              title={t(
                                'weekend'
                              )}
                            >
                              <span className="text-slate-400">
                                •
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={
                              day.date
                            }
                            className="w-10 min-w-[40px] h-10 border-r border-b border-slate-200 text-center p-1"
                            title={
                              status
                                ? getStatusTitle(
                                    status
                                  )
                                : t(
                                    'noAttendanceRecorded'
                                  )
                            }
                          >
                            <span
                              className={`inline-flex w-7 h-7 items-center justify-center rounded-md border text-[10px] font-bold ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusLabel(
                                status
                              )}
                            </span>
                          </td>
                        );
                      }
                    )}

                    {/* Présents */}
                    <td className="px-3 py-2 text-center border-b border-slate-200 bg-emerald-50/70">
                      <span className="font-bold text-emerald-700">
                        {item.present}
                      </span>
                    </td>

                    {/* Absents */}
                    <td className="px-3 py-2 text-center border-b border-slate-200 bg-rose-50/70">
                      <span className="font-bold text-rose-700">
                        {item.absent}
                      </span>
                    </td>

                    {/* Retards */}
                    <td className="px-3 py-2 text-center border-b border-slate-200 bg-amber-50/70">
                      <span className="font-bold text-amber-700">
                        {item.late}
                      </span>
                    </td>

                    {/* Taux */}
                    <td className="px-3 py-2 text-center border-b border-slate-200 bg-teal-50/70">
                      <span
                        className={`font-bold ${
                          item.attendanceRate >=
                          90
                            ? 'text-emerald-700'
                            : item.attendanceRate >=
                                75
                              ? 'text-amber-700'
                              : 'text-rose-700'
                        }`}
                      >
                        {
                          item.attendanceRate
                        }
                        %
                      </span>
                    </td>
                  </tr>
                )
              )}

              {studentStats.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      monthDays.length +
                      5
                    }
                    className="py-16 text-center text-slate-400"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />

                    {t('noStudents')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          DÉTAIL DES OBSERVATIONS
      ====================================================== */}
      {attendance.some(
        (record) =>
          record.note &&
          record.note.trim()
      ) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">
              {t('attendanceDetails')}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {t('attendanceHistory')}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {attendance
              .filter(
                (record) =>
                  record.note &&
                  record.note.trim()
              )
              .sort((a, b) =>
                a.date.localeCompare(
                  b.date
                )
              )
              .map((record) => {
                const student =
                  students.find(
                    (item) =>
                      item.id ===
                      record.student_id
                  );

                if (!student) {
                  return null;
                }

                const statusColor =
                  record.status ===
                  'absent'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={record.id}
                    className="p-4 flex flex-col md:flex-row md:items-center gap-3"
                  >
                    <div className="md:w-48">
                      <p className="font-medium text-slate-800">
                        {getStudentName(
                          student,
                          lang
                        )}
                      </p>

                      <p className="text-xs text-slate-400">
                        {record.date}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusColor}`}
                    >
                      {record.status ===
                      'absent'
                        ? t('absent')
                        : t('late')}
                    </span>

                    <p className="text-sm text-slate-600 flex-1">
                      {record.note}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================
          PIED DE PAGE IMPRESSION
      ====================================================== */}
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-300">
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {schoolName}
          </span>

          <span>
            {formatMonthTitle(
              selectedMonth,
              lang
            )}
          </span>
        </div>
      </div>

      {/* =====================================================
          STYLE IMPRESSION A4 — UNE SEULE PAGE
      ====================================================== */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm;
          }

          html,
          body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            overflow: hidden !important;
          }

          #monthly-report {
            zoom: 0.38;
            width: 263% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .report-print-header {
            display: block !important;
            margin: 0 0 5px 0 !important;
            padding: 0 !important;
          }

          .report-print-header > div {
            padding-bottom: 4px !important;
            margin-bottom: 4px !important;
            border-bottom-width: 1px !important;
          }

          .report-print-header h1 {
            font-size: 14px !important;
            line-height: 1 !important;
          }

          .report-print-header h2 {
            font-size: 17px !important;
            line-height: 1 !important;
            margin-top: 2px !important;
          }

          .report-print-header p {
            font-size: 8px !important;
            line-height: 1 !important;
            margin-top: 2px !important;
          }

          #monthly-report > .bg-gradient-to-r {
            padding: 6px !important;
            border-radius: 4px !important;
            box-shadow: none !important;
          }

          #monthly-report > .bg-gradient-to-r h2 {
            font-size: 11px !important;
            margin-top: 1px !important;
          }

          #monthly-report > .bg-gradient-to-r p {
            font-size: 7px !important;
            margin-top: 1px !important;
          }

          #monthly-report .grid {
            gap: 3px !important;
          }

          #monthly-report .grid.grid-cols-6 {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
            gap: 3px !important;
          }

          #monthly-report .grid.grid-cols-6 > div {
            display: flex !important;
            align-items: center !important;
            min-width: 0 !important;
            padding: 3px !important;
            gap: 3px !important;
          }

          #monthly-report .grid > div {
            padding: 4px !important;
            border-radius: 4px !important;
            box-shadow: none !important;
          }

          #monthly-report .grid > div > div:first-child {
            width: 18px !important;
            height: 18px !important;
            margin-bottom: 2px !important;
          }

          #monthly-report .grid svg {
            width: 10px !important;
            height: 10px !important;
          }

          #monthly-report .grid p.text-2xl {
            font-size: 12px !important;
            line-height: 1 !important;
          }

          #monthly-report .grid p.text-xs {
            font-size: 6px !important;
            margin-top: 1px !important;
            line-height: 1 !important;
          }

          #monthly-report .bg-white.rounded-2xl {
            box-shadow: none !important;
            border-radius: 4px !important;
          }

          #monthly-report .p-5 {
            padding: 5px !important;
          }

          #monthly-report .p-4 {
            padding: 4px !important;
          }

          #monthly-report .mt-5 {
            margin-top: 3px !important;
          }

          #monthly-report .mt-4 {
            margin-top: 3px !important;
          }

          #monthly-report .mt-3 {
            margin-top: 2px !important;
          }

          #monthly-report .mb-4 {
            margin-bottom: 3px !important;
          }

          #monthly-report table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 6px !important;
          }

          #monthly-report table th,
          #monthly-report table td {
            padding: 0 1px !important;
            height: 14px !important;
            min-height: 14px !important;
            line-height: 1.15 !important;
            vertical-align: middle !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }

          #monthly-report[dir="rtl"] table {
            font-family: Tahoma, Arial, sans-serif !important;
          }

          #monthly-report table th:first-child,
          #monthly-report table td:first-child {
            width: 105px !important;
            min-width: 105px !important;
            max-width: 105px !important;
            font-size: 7px !important;
            padding-left: 2px !important;
            padding-right: 2px !important;
          }

          #monthly-report table th:not(:first-child):not(:nth-last-child(-n+4)),
          #monthly-report table td:not(:first-child):not(:nth-last-child(-n+4)) {
            width: 18px !important;
            min-width: 18px !important;
            max-width: 18px !important;
          }

          #monthly-report table th {
            font-size: 6px !important;
          }

          #monthly-report table th div {
            font-size: 6px !important;
          }

          #monthly-report table th div.text-\\[8px\\] {
            font-size: 4px !important;
          }

          #monthly-report table td span {
            width: 13px !important;
            height: 13px !important;
            min-width: 13px !important;
            min-height: 13px !important;
            font-size: 6px !important;
            border-radius: 2px !important;
          }

          #monthly-report table th:nth-last-child(-n+4),
          #monthly-report table td:nth-last-child(-n+4) {
            width: 27px !important;
            min-width: 27px !important;
            max-width: 27px !important;
          }

          #monthly-report table tr,
          #monthly-report table tbody,
          #monthly-report table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #monthly-report thead {
            display: table-header-group !important;
          }

          #monthly-report .sticky {
            position: static !important;
          }

          #monthly-report .divide-y > div {
            padding: 3px !important;
            gap: 3px !important;
          }

          #monthly-report .divide-y p {
            font-size: 6px !important;
            line-height: 1.15 !important;
          }

          #monthly-report > .hidden.print\\:block {
            display: block !important;
            margin-top: 3px !important;
            padding-top: 3px !important;
          }

          #monthly-report > * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {showPreview && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 p-4 md:p-8 flex flex-col print:hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-white">
              <h2 className="text-lg font-semibold">Aperçu du rapport</h2>
              <p className="text-xs text-white/70">A4 paysage — aperçu avant PDF</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closePreview}
                className="bg-white text-slate-700"
              >
                Fermer
              </Button>

              <Button
                type="button"
                onClick={downloadPdf}
                className="shadow-md"
                disabled={isGeneratingPdf}
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf
                  ? lang === 'ar'
                    ? 'جارٍ التحميل...'
                    : lang === 'en'
                      ? 'Downloading...'
                      : 'Téléchargement...'
                  : lang === 'ar'
                    ? 'تنزيل PDF'
                    : lang === 'en'
                      ? 'Download PDF'
                      : 'Télécharger PDF'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-slate-500/40 p-4">
            <div className="mx-auto bg-white shadow-2xl w-full max-w-[1123px] min-h-[794px] p-[15px] overflow-auto">
              <div ref={previewRef} dir={dir} className="preview-a4-report">
                <div className="text-center border-b border-slate-800 pb-2 mb-2">
                  {schoolName && (
                    <h1 className="text-sm font-bold text-slate-900">
                      {schoolName}
                    </h1>
                  )}
                  <h2 className="text-lg font-bold text-slate-900">
                    {t('monthlyReport')}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {formatMonthTitle(selectedMonth, lang)}
                  </p>
                  {schoolYearStart && (
                    <p className="text-[8px] text-slate-600">
                      {getSchoolYearStartLabel(lang)}: {formatSchoolDate(schoolYearStart, lang)}
                    </p>
                  )}
                  {selectedClass && (
                    <p className="text-xs font-medium text-slate-700">
                      {getClassName(selectedClass, lang)}
                      {' — '}
                      {profile ? getProfileName(profile, lang) : '—'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-1 mb-2">
                  <div className="border rounded p-1 text-center"><b>{students.length}</b><div className="text-[8px]">{t('totalStudents')}</div></div>
                  <div className="border rounded p-1 text-center"><b>{schoolDays}</b><div className="text-[8px]">{t('schoolDay')}</div></div>
                  <div className="border rounded p-1 text-center"><b>{recordedDays}</b><div className="text-[8px]">{t('attendanceByDay')}</div></div>
                  <div className="border rounded p-1 text-center text-emerald-700"><b>{totalPresent}</b><div className="text-[8px]">{t('present')}</div></div>
                  <div className="border rounded p-1 text-center text-rose-700"><b>{totalAbsent}</b><div className="text-[8px]">{t('absent')}</div></div>
                  <div className="border rounded p-1 text-center text-amber-700"><b>{totalLate}</b><div className="text-[8px]">{t('late')}</div></div>
                </div>

                <div className="border rounded p-1 mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold">{t('attendanceRate')}</span>
                  <div className="flex items-center gap-4 font-bold">
                    <span className="text-emerald-700">{overallAttendanceRate}% {t('present')}</span>
                    <span className="text-rose-700">{overallAbsenceRate}% {t('absent')}</span>
                    <span className="text-amber-700">{overallLateRate}% {t('late')}</span>
                  </div>
                </div>

                <table className="w-full border-collapse text-[7px] table-fixed">
                  <thead>
                    <tr>
                      <th className="border bg-slate-800 text-white p-1 text-start w-[150px]">{t('studentName')}</th>
                      {monthDays.map((day) => (
                        <th
                          key={day.date}
                          title={
                            day.holiday
                              ? getHolidayName(day.holiday, lang)
                              : day.isWeekend
                                ? t('weekend')
                                : ''
                          }
                          className={`border p-0.5 text-center align-middle w-[22px] ${
                            day.holiday
                              ? 'bg-amber-200 text-amber-900'
                              : day.outsideSchoolYear
                                ? 'bg-slate-100 text-slate-400'
                                : day.isWeekend
                                  ? 'bg-slate-300 text-slate-700'
                                  : day.isSchoolYearStart
                                    ? 'bg-teal-200 text-teal-900'
                                    : 'bg-slate-700 text-white'
                          }`}
                        >
                          <div>{day.day}</div>
                          {(day.holiday || (!day.outsideSchoolYear && day.isWeekend)) && (
                            <div className="text-[5px] leading-none">
                              {day.holiday ? t('holidayShort') : t('weekend')}
                            </div>
                          )}
                          {!day.holiday && !day.outsideSchoolYear && !day.isWeekend && day.isSchoolYearStart && (
                            <div className="text-[5px] leading-none">
                              {getBackToSchoolShortLabel(lang)}
                            </div>
                          )}
                        </th>
                      ))}
                      <th className="border bg-emerald-700 text-white w-[32px]">{t('presentShort')}</th>
                      <th className="border bg-rose-700 text-white w-[32px]">{t('absentShort')}</th>
                      <th className="border bg-amber-600 text-white w-[32px]">{t('lateShort')}</th>
                      <th className="border bg-teal-700 text-white w-[36px]">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats.map((item, index) => (
                      <tr key={item.student.id}>
                        <td className="border p-0.5 font-medium text-slate-700 truncate">
                          {index + 1}. {getStudentName(item.student, lang)}
                        </td>
                        {monthDays.map((day) => {
                          const record = item.records[day.date];
                          const status = record?.status;

                          return (
                            <td
                              key={day.date}
                              className={`border text-center align-middle p-0 leading-none ${
                                day.holiday
                                  ? 'bg-amber-100 text-amber-700 font-bold'
                                  : day.outsideSchoolYear
                                    ? 'bg-slate-100 text-slate-400 font-bold'
                                    : day.isWeekend
                                      ? 'bg-slate-200 text-slate-400'
                                      : day.isSchoolYearStart
                                        ? 'bg-teal-100 text-teal-700 font-bold'
                                        : ''
                              }`}
                            >
                              {day.holiday
                                ? t('holidayShort')
                                : day.outsideSchoolYear
                                  ? ''
                                  : day.isWeekend
                                    ? '•'
                                    : getStatusLabel(status)}
                            </td>
                          );
                        })}
                        <td className="border text-center bg-emerald-50 font-bold text-emerald-700">{item.present}</td>
                        <td className="border text-center bg-rose-50 font-bold text-rose-700">{item.absent}</td>
                        <td className="border text-center bg-amber-50 font-bold text-amber-700">{item.late}</td>
                        <td className="border text-center bg-teal-50 font-bold text-teal-700">{item.attendanceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-wrap gap-3 text-[8px] mt-2">
                  <span><b>{t('presentShort')}</b> {t('present')}</span>
                  <span><b>{t('absentShort')}</b> {t('absent')}</span>
                  <span><b>{t('lateShort')}</b> {t('late')}</span>
                  <span><b>■</b> {t('weekend')}</span>
                  <span><b>{t('holidayShort')}</b> {t('schoolHoliday')}</span>
                  <span><b>—</b> {t('outsideSchoolYear')}</span>
                </div>

                {schoolAttendance.some((record) => record.note && record.note.trim()) && (
                  <div className="border-t mt-2 pt-1 text-[7px]">
                    <b>{t('attendanceDetails')}</b>
                    <div className="mt-1 space-y-0.5">
                      {schoolAttendance.filter((record) => record.note && record.note.trim()).map((record) => {
                        const student = students.find((item) => item.id === record.student_id);
                        if (!student) return null;
                        return (
                          <div key={record.id} className="flex gap-2">
                            <span className="font-medium">{getStudentName(student, lang)}</span>
                            <span>{record.date}</span>
                            <span>{record.status === 'absent' ? t('absent') : t('late')}:</span>
                            <span>{record.note}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t mt-2 pt-1 flex justify-between text-[7px] text-slate-500">
                  <span>{schoolName}</span>
                  <span>{formatMonthTitle(selectedMonth, lang)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Rendre tous les textes du rapport réellement visibles
           sans couper les caractères, en français comme en arabe. */
        .preview-a4-report,
        .preview-a4-report table {
          font-family: Arial, Tahoma, sans-serif !important;
        }

        .preview-a4-report table {
          border-collapse: collapse !important;
        }

        .preview-a4-report table th,
        .preview-a4-report table td {
          vertical-align: middle !important;
          box-sizing: border-box !important;
          line-height: 1.4 !important;
          overflow: visible !important;
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }

        .preview-a4-report table thead th {
          height: 24px !important;
          min-height: 24px !important;
          line-height: 1.25 !important;
          padding-top: 3px !important;
          padding-bottom: 3px !important;
          white-space: nowrap !important;
        }

        .preview-a4-report table tbody td {
          height: 18px !important;
          min-height: 18px !important;
          line-height: 1.4 !important;
          white-space: nowrap !important;
        }

        /* Le nom de l'élève ne doit pas être coupé par overflow:hidden
           provenant de la classe Tailwind truncate. */
        .preview-a4-report table td.truncate {
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: nowrap !important;
        }

        .preview-a4-report[dir="rtl"],
        .preview-a4-report[dir="rtl"] table {
          font-family: Tahoma, Arial, sans-serif !important;
        }

        .preview-a4-report[dir="rtl"] table th,
        .preview-a4-report[dir="rtl"] table td {
          line-height: 1.5 !important;
        }
      `}</style>

    </div>
  );
}