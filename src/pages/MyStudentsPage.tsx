import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { getStudentName, getClassName } from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { ClassRoom, Student } from '@/types/database';
import {
  Plus, Upload, Search, Edit2, Trash2, FileSpreadsheet, Download, Users, X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export function MyStudentsPage() {
  const { profile } = useAuth();
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [form, setForm] = useState({
    first_name_fr: '', first_name_ar: '', first_name_en: '',
    last_name_fr: '', last_name_ar: '', last_name_en: '',
    student_number: '',
  });

  const [importData, setImportData] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

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
      loadStudents(selectedClass.id);
    }
  }, [selectedClass]);

  async function loadStudents(classId: string) {
    const { data: studs } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('created_at');
    setStudents(studs as Student[] || []);
  }

  function resetForm() {
    setForm({
      first_name_fr: '', first_name_ar: '', first_name_en: '',
      last_name_fr: '', last_name_ar: '', last_name_en: '',
      student_number: '',
    });
  }

  async function handleSaveStudent() {
    if (!selectedClass) return;
    if (!form.first_name_fr || !form.last_name_fr) {
      showToast(t('fillAllFields'), 'error');
      return;
    }

    const payload = {
      class_id: selectedClass.id,
      first_name_fr: form.first_name_fr,
      first_name_ar: form.first_name_ar || form.first_name_fr,
      first_name_en: form.first_name_en || form.first_name_fr,
      last_name_fr: form.last_name_fr,
      last_name_ar: form.last_name_ar || form.last_name_fr,
      last_name_en: form.last_name_en || form.last_name_fr,
      student_number: form.student_number || null,
    };

    if (editingStudent) {
      const { error } = await supabase.from('students').update(payload).eq('id', editingStudent.id);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('studentUpdated'), 'success');
    } else {
      const { error } = await supabase.from('students').insert(payload);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('studentCreated'), 'success');
    }

    setShowAddModal(false);
    setEditingStudent(null);
    resetForm();
    loadStudents(selectedClass.id);
  }

  async function handleDeleteStudent(student: Student) {
    if (!confirm(t('confirmDeleteStudent'))) return;
    const { error } = await supabase.from('students').delete().eq('id', student.id);
    if (error) { showToast(t('errorOccurred'), 'error'); return; }
    showToast(t('studentDeleted'), 'success');
    if (selectedClass) loadStudents(selectedClass.id);
  }

  function openEdit(student: Student) {
    setEditingStudent(student);
    setForm({
      first_name_fr: student.first_name_fr,
      first_name_ar: student.first_name_ar,
      first_name_en: student.first_name_en,
      last_name_fr: student.last_name_fr,
      last_name_ar: student.last_name_ar,
      last_name_en: student.last_name_en,
      student_number: student.student_number || '',
    });
    setShowAddModal(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });
        setImportData(rows);
        setImportStep('preview');
      } catch {
        showToast(t('invalidFileFormat'), 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function processImport() {
    if (!selectedClass || importData.length === 0) return;

    const rows = importData.map((row) => {
      const fn = row['first_name'] || row['prénom'] || row['Prénom'] || row['firstName'] || row['name'] || row['nom'] || Object.values(row)[0] || '';
      const ln = row['last_name'] || row['nom'] || row['Nom'] || row['lastName'] || row['surname'] || Object.values(row)[1] || '';
      const num = row['number'] || row['numéro'] || row['Numéro'] || row['student_number'] || '';
      return {
        class_id: selectedClass.id,
        first_name_fr: String(fn).trim(),
        first_name_ar: String(fn).trim(),
        first_name_en: String(fn).trim(),
        last_name_fr: String(ln).trim(),
        last_name_ar: String(ln).trim(),
        last_name_en: String(ln).trim(),
        student_number: num ? String(num).trim() : null,
      };
    }).filter(r => r.first_name_fr && r.last_name_fr);

    if (rows.length === 0) {
      showToast(t('noValidRows'), 'error');
      return;
    }

    const { error } = await supabase.from('students').insert(rows);
    if (error) {
      showToast(t('importError'), 'error');
      return;
    }

    showToast(`${rows.length} ${t('studentsImported')}`, 'success');
    setShowImportModal(false);
    setImportData([]);
    setImportStep('upload');
    loadStudents(selectedClass.id);
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      { first_name: 'Ahmed', last_name: 'Benali', student_number: '001' },
      { first_name: 'Fatima', last_name: 'Zahra', student_number: '002' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_template.xlsx');
    showToast(t('templateDownloaded'), 'success');
  }

  function exportStudents() {
    if (students.length === 0) return;
    const data = students.map((s, i) => ({
      '#': i + 1,
      first_name: s.first_name_fr,
      last_name: s.last_name_fr,
      student_number: s.student_number || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  const filteredStudents = students.filter((s) => {
    const name = getStudentName(s, lang).toLowerCase();
    return name.includes(search.toLowerCase());
  });

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
          <Users className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('noClassAssigned')}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('myClass')}</h1>
          {myClasses.length > 1 ? (
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
          ) : (
            selectedClass && <p className="text-sm text-slate-500">{getClassName(selectedClass, lang)} - {students.length} {t('students')}</p>
          )}
          {selectedClass && myClasses.length > 1 && (
            <p className="text-sm text-slate-500 mt-1">{students.length} {t('students')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportStudents} disabled={students.length === 0}>
            <Download className="w-4 h-4" />
            {t('exportExcel')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4" />
            {t('importExcel')}
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setEditingStudent(null); setShowAddModal(true); }}>
            <Plus className="w-4 h-4" />
            {t('addStudent')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400 pointer-events-none" />
        <Input
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Students table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">{search ? t('noSearchResults') : t('noStudents')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">#</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('studentName')}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold text-slate-600">{t('studentNumber')}</th>
                  <th className="px-4 py-3 text-end text-sm font-semibold text-slate-600">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student, i) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {getStudentName(student, lang).charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{getStudentName(student, lang)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{student.student_number || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(student)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingStudent(null); resetForm(); }}
        title={editingStudent ? t('edit') : t('addStudent')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('firstName')} ({t('required')})</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder={t('firstNameFr')} value={form.first_name_fr} onChange={(e) => setForm({ ...form, first_name_fr: e.target.value })} />
              <Input placeholder={t('firstNameAr')} value={form.first_name_ar} onChange={(e) => setForm({ ...form, first_name_ar: e.target.value })} />
              <Input placeholder={t('firstNameEn')} value={form.first_name_en} onChange={(e) => setForm({ ...form, first_name_en: e.target.value })} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('lastName')} ({t('required')})</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder={t('lastNameFr')} value={form.last_name_fr} onChange={(e) => setForm({ ...form, last_name_fr: e.target.value })} />
              <Input placeholder={t('lastNameAr')} value={form.last_name_ar} onChange={(e) => setForm({ ...form, last_name_ar: e.target.value })} />
              <Input placeholder={t('lastNameEn')} value={form.last_name_en} onChange={(e) => setForm({ ...form, last_name_en: e.target.value })} />
            </div>
          </div>
          <Input
            label={t('studentNumber') + ' (' + t('optional') + ')'}
            placeholder="001"
            value={form.student_number}
            onChange={(e) => setForm({ ...form, student_number: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); setEditingStudent(null); resetForm(); }} className="flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveStudent} className="flex-1">
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={showImportModal}
        onClose={() => { setShowImportModal(false); setImportData([]); setImportStep('upload'); }}
        title={t('importExcel')}
        size="lg"
      >
        {importStep === 'upload' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50 border border-teal-100">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <span className="text-sm text-teal-700">{t('excelTemplate')}</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4" />
                {t('downloadTemplate')}
              </Button>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">{t('dragDropFile')}</p>
              <p className="text-sm text-slate-400">{t('orClickToBrowse')}</p>
              <p className="text-xs text-slate-400 mt-2">{t('onlyExcelFiles')} - {t('maxFileSize')}</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">{t('importInstructions')}:</p>
              <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                <li>{t('excelTemplate')}: first_name, last_name, student_number</li>
                <li>prénom, nom, numéro (FR)</li>
                <li>{t('maxFileSize')}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{importData.length} {t('rowsFound')}</p>
              <Button variant="ghost" size="sm" onClick={() => setImportStep('upload')}>
                <X className="w-4 h-4" />
                {t('back')}
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-start text-xs font-semibold text-slate-600">#</th>
                    <th className="px-3 py-2 text-start text-xs font-semibold text-slate-600">{t('firstName')}</th>
                    <th className="px-3 py-2 text-start text-xs font-semibold text-slate-600">{t('lastName')}</th>
                    <th className="px-3 py-2 text-start text-xs font-semibold text-slate-600">{t('studentNumber')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {importData.slice(0, 50).map((row, i) => {
                    const fn = row['first_name'] || row['prénom'] || row['Prénom'] || row['firstName'] || row['name'] || row['nom'] || Object.values(row)[0] || '';
                    const ln = row['last_name'] || row['nom'] || row['Nom'] || row['lastName'] || row['surname'] || Object.values(row)[1] || '';
                    const num = row['number'] || row['numéro'] || row['Numéro'] || row['student_number'] || '';
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-xs text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 text-xs text-slate-700">{String(fn)}</td>
                        <td className="px-3 py-2 text-xs text-slate-700">{String(ln)}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{String(num)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {importData.length > 50 && (
                <p className="text-center text-xs text-slate-400 py-2">
                  {t('showing')} 50 {t('of')} {importData.length}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setImportStep('upload')} className="flex-1">
                {t('cancel')}
              </Button>
              <Button onClick={processImport} className="flex-1">
                <Upload className="w-4 h-4" />
                {t('confirmImport')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
