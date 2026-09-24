import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { getClassName, getLevelName, getProfileName, getSubjectLabel, canTeacherTeachLevel } from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { Level, ClassRoom, Profile, TeacherSubject } from '@/types/database';
import { Plus, Edit2, Trash2, School, UserCheck, Users, X, BookOpen, Info } from 'lucide-react';

export function ClassesPage() {
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [classTeachersMap, setClassTeachersMap] = useState<Record<string, Profile[]>>({});
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClass, setAssignClass] = useState<ClassRoom | null>(null);
  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [form, setForm] = useState({ name_ar: '', name_fr: '', name_en: '', level_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [levelsRes, classesRes, teachersRes, ctRes] = await Promise.all([
      supabase.from('levels').select('*').order('sort_order'),
      supabase.from('classes').select('*').order('created_at'),
      supabase.from('profiles').select('*').eq('role', 'teacher'),
      supabase.from('class_teachers').select('class_id, teacher_id'),
    ]);

    const levelsData = (levelsRes.data || []) as Level[];
    const teachersData = (teachersRes.data || []) as Profile[];
    const rawClasses = (classesRes.data || []) as ClassRoom[];

    const ctMap: Record<string, Profile[]> = {};
    (ctRes.data || []).forEach((ct: any) => {
      const teacher = teachersData.find((tch) => tch.id === ct.teacher_id);
      if (teacher) {
        if (!ctMap[ct.class_id]) ctMap[ct.class_id] = [];
        ctMap[ct.class_id].push(teacher);
      }
    });

    const cls = rawClasses.map((c) => ({
      ...c,
      teachers: ctMap[c.id] || [],
      level: levelsData.find((l) => l.id === c.level_id) || null,
    }));

    setLevels(levelsData);
    setTeachers(teachersData);
    setClasses(cls);
    setClassTeachersMap(ctMap);

    const counts: Record<string, number> = {};
    await Promise.all(
      cls.map(async (c) => {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', c.id);
        counts[c.id] = count || 0;
      })
    );
    setStudentCounts(counts);
    setLoading(false);
  }

  function resetForm() {
    setForm({ name_ar: '', name_fr: '', name_en: '', level_id: '' });
  }

  async function handleSave() {
    if (!form.name_fr || !form.level_id) {
      showToast(t('fillAllFields'), 'error');
      return;
    }

    const payload = {
      level_id: form.level_id,
      name_ar: form.name_ar || form.name_fr,
      name_fr: form.name_fr,
      name_en: form.name_en || form.name_fr,
    };

    if (editing) {
      const { error } = await supabase.from('classes').update(payload).eq('id', editing.id);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('classUpdated'), 'success');
    } else {
      const { error } = await supabase.from('classes').insert(payload);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('classCreated'), 'success');
    }

    setShowModal(false);
    setEditing(null);
    resetForm();
    loadData();
  }

  async function handleDelete(cls: ClassRoom) {
    if (!confirm(t('confirmDeleteClass'))) return;
    const { error } = await supabase.from('classes').delete().eq('id', cls.id);
    if (error) { showToast(t('cannotDeleteClass') + ' - ' + t('classInUse'), 'error'); return; }
    showToast(t('classDeleted'), 'success');
    loadData();
  }

  async function addTeacherToClass(classId: string, teacherId: string) {
    const teacher = teachers.find((tch) => tch.id === teacherId);
    if (!teacher || !teacher.subject) return;

    const cls = classes.find((c) => c.id === classId);
    if (!cls || !cls.level) return;

    // Check level restriction
    if (!canTeacherTeachLevel(teacher.subject, cls.level.sort_order)) {
      showToast(t('levelNotAllowed'), 'error');
      return;
    }

    // Check if subject already assigned to this class
    const existing = classTeachersMap[classId] || [];
    if (existing.some((tch) => tch.subject === teacher.subject)) {
      showToast(t('subjectAlreadyAssigned'), 'error');
      return;
    }

    // Arabic teachers can only have 1 class
    if (teacher.subject === 'arabic') {
      const allCt = Object.entries(classTeachersMap);
      const isAssignedElsewhere = allCt.some(([cid, tchs]) =>
        cid !== classId && tchs.some((tch) => tch.id === teacherId)
      );
      if (isAssignedElsewhere) {
        showToast(t('arabicMaxOneClass'), 'error');
        return;
      }
    }

    const { error } = await supabase.from('class_teachers').insert({ class_id: classId, teacher_id: teacherId });
    if (error) { showToast(t('errorOccurred'), 'error'); return; }
    showToast(t('teacherAssigned'), 'success');
    loadData();
  }

  async function removeTeacherFromClass(classId: string, teacherId: string) {
    const { error } = await supabase.from('class_teachers')
      .delete().eq('class_id', classId).eq('teacher_id', teacherId);
    if (error) { showToast(t('errorOccurred'), 'error'); return; }
    showToast(t('teacherUnassigned'), 'success');
    loadData();
  }

  function getAvailableTeachersForClass(cls: ClassRoom): Profile[] {
    const assigned = classTeachersMap[cls.id] || [];
    const assignedIds = assigned.map((t) => t.id);
    const assignedSubjects = assigned.map((t) => t.subject);

    return teachers.filter((tch) => {
      if (!tch.subject) return false;
      if (assignedIds.includes(tch.id)) return false;
      if (assignedSubjects.includes(tch.subject)) return false;
      if (!cls.level || !canTeacherTeachLevel(tch.subject, cls.level.sort_order)) return false;
      // Arabic: check not assigned elsewhere
      if (tch.subject === 'arabic') {
        const allCt = Object.entries(classTeachersMap);
        if (allCt.some(([cid, tchs]) => tchs.some((tc) => tc.id === tch.id))) return false;
      }
      return true;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('classes')}</h1>
          <p className="text-sm text-slate-500">{t('manageClasses')}</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
          <Plus className="w-4 h-4" />
          {t('addClass')}
        </Button>
      </div>

      {/* Subject restriction info */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-teal-700 space-y-1">
            <p className="font-medium">{t('subjectLevelRestriction')}:</p>
            <p>{t('arabicLevelRange')}</p>
            <p>{t('frenchLevelRange')}</p>
            <p>{t('englishLevelRange')}</p>
            <p>{t('sportLevelRange')}</p>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500">{t('noClasses')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const assignedTeachers = classTeachersMap[cls.id] || [];
            return (
              <div key={cls.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{getClassName(cls, lang)}</h3>
                      <p className="text-xs text-slate-400">{cls.level ? getLevelName(cls.level, lang) : '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(cls); setForm({ name_ar: cls.name_ar, name_fr: cls.name_fr, name_en: cls.name_en, level_id: cls.level_id }); setShowModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cls)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">{studentCounts[cls.id] || 0} {t('students')}</span>
                  </div>

                  {/* Assigned teachers */}
                  <div className="space-y-1.5">
                    {assignedTeachers.length === 0 ? (
                      <p className="text-amber-600 text-xs">{t('noTeachersAssigned')}</p>
                    ) : (
                      assignedTeachers.map((tch) => (
                        <div key={tch.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {getProfileName(tch, lang).charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{getProfileName(tch, lang)}</p>
                            <p className="text-[10px] text-slate-400">{tch.subject && getSubjectLabel(tch.subject, lang)}</p>
                          </div>
                          <button
                            onClick={() => removeTeacherFromClass(cls.id, tch.id)}
                            className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => { setAssignClass(cls); setShowAssignModal(true); }}
                  >
                    <UserCheck className="w-4 h-4" />
                    {t('assignTeachers')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Class Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); resetForm(); }} title={editing ? t('edit') : t('addClass')}>
        <div className="space-y-4">
          <Select label={t('level')} value={form.level_id} onChange={(e) => setForm({ ...form, level_id: e.target.value })}>
            <option value="">{t('selectLevel')}</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{getLevelName(l, lang)}</option>)}
          </Select>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameFr')} ({t('required')})</p>
            <Input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder={t('className')} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameAr')}</p>
            <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder={t('className')} dir="rtl" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameEn')}</p>
            <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder={t('className')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditing(null); resetForm(); }} className="flex-1">{t('cancel')}</Button>
            <Button onClick={handleSave} className="flex-1">{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Assign Teachers Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={t('assignTeachers')}
        size="lg"
      >
        {assignClass && (() => {
          const assigned = classTeachersMap[assignClass.id] || [];
          const available = getAvailableTeachersForClass(assignClass);
          return (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="font-medium text-slate-800">{getClassName(assignClass, lang)}</p>
                <p className="text-xs text-slate-400">{assignClass.level ? getLevelName(assignClass.level, lang) : ''}</p>
              </div>

              {assigned.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('assignedTeachers')}</p>
                  <div className="space-y-2">
                    {assigned.map((tch) => (
                      <div key={tch.id} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 border border-teal-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {getProfileName(tch, lang).charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{getProfileName(tch, lang)}</p>
                          <p className="text-xs text-teal-600">{tch.subject && getSubjectLabel(tch.subject, lang)}</p>
                        </div>
                        <button
                          onClick={() => removeTeacherFromClass(assignClass.id, tch.id)}
                          className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {available.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('addTeacherToClass')}</p>
                  <div className="space-y-2">
                    {available.map((tch) => (
                      <button
                        key={tch.id}
                        onClick={() => addTeacherToClass(assignClass.id, tch.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 text-start hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {getProfileName(tch, lang).charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{getProfileName(tch, lang)}</p>
                          <p className="text-xs text-slate-400">{tch.subject && getSubjectLabel(tch.subject, lang)}</p>
                        </div>
                        <Plus className="w-4 h-4 text-teal-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {available.length === 0 && assigned.length > 0 && (
                <p className="text-sm text-slate-400 text-center py-4">{t('noTeachers')}</p>
              )}

              <Button variant="secondary" className="w-full" onClick={() => setShowAssignModal(false)}>
                {t('close')}
              </Button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
