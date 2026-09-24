import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { getProfileName, getClassName, getSubjectLabel, canTeacherTeachLevel, SUBJECT_LEVEL_RULES } from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { Profile, ClassRoom, Level, TeacherSubject } from '@/types/database';
import { Mail, UserCheck, School, Users, Shield, Plus, BookOpen, Dumbbell, Languages, Globe, X, Info } from 'lucide-react';

const SUBJECT_ICONS: Record<TeacherSubject, React.ReactNode> = {
  arabic: <BookOpen className="w-4 h-4" />,
  french: <Languages className="w-4 h-4" />,
  english: <Globe className="w-4 h-4" />,
  sport: <Dumbbell className="w-4 h-4" />,
};

export function TeachersPage() {
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [teacherClassesMap, setTeacherClassesMap] = useState<Record<string, ClassRoom[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Profile | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    email: '', password: '', subject: '' as TeacherSubject | '',
    first_name_fr: '', first_name_ar: '', first_name_en: '',
    last_name_fr: '', last_name_ar: '', last_name_en: '',
  });

  useEffect(() => {
    loadData();
  }, []);

 async function loadData() {
  setLoading(true);

  const [teachersRes, classesRes, levelsRes, ctRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher'),

    // IMPORTANT :
    // On récupère les classes sans faire de relation level(*)
    // car cette relation provoquait une erreur 400.
    supabase
      .from('classes')
      .select('*')
      .order('created_at'),

    supabase
      .from('levels')
      .select('*')
      .order('sort_order'),

    supabase
      .from('class_teachers')
      .select('class_id, teacher_id'),
  ]);

  if (teachersRes.error) {
    console.error('Erreur chargement enseignants:', teachersRes.error);
  }

  if (classesRes.error) {
    console.error('Erreur chargement classes:', classesRes.error);
  }

  if (levelsRes.error) {
    console.error('Erreur chargement niveaux:', levelsRes.error);
  }

  if (ctRes.error) {
    console.error('Erreur chargement affectations enseignants/classes:', ctRes.error);
  }

  const teachersData = (teachersRes.data || []) as Profile[];
  const rawClassesData = (classesRes.data || []) as ClassRoom[];
  const levelsData = (levelsRes.data || []) as Level[];

  // Création d'une map des niveaux par ID
  const levelsMap: Record<string, Level> = {};

  levelsData.forEach((level) => {
    levelsMap[level.id] = level;
  });

  // On rattache manuellement le niveau à chaque classe
  const classesData: ClassRoom[] = rawClassesData.map((cls) => ({
    ...cls,
    level: cls.level_id ? levelsMap[cls.level_id] : undefined,
  }));

  // Création de la map :
  // teacher_id -> classes affectées
  const tcMap: Record<string, ClassRoom[]> = {};

  (ctRes.data || []).forEach((ct: any) => {
    const cls = classesData.find((c) => c.id === ct.class_id);

    if (cls) {
      if (!tcMap[ct.teacher_id]) {
        tcMap[ct.teacher_id] = [];
      }

      tcMap[ct.teacher_id].push(cls);
    }
  });

  setTeachers(teachersData);
  setClasses(classesData);
  setLevels(levelsData);
  setTeacherClassesMap(tcMap);

  setLoading(false);
}

  async function removeClassFromTeacher(teacherId: string, classId: string) {
    const { error } = await supabase.from('class_teachers')
      .delete().eq('class_id', classId).eq('teacher_id', teacherId);
    if (error) { showToast(t('errorOccurred'), 'error'); return; }
    showToast(t('classUnassigned'), 'success');
    loadData();
  }

  function resetCreateForm() {
    setCreateForm({
      email: '', password: '', subject: '',
      first_name_fr: '', first_name_ar: '', first_name_en: '',
      last_name_fr: '', last_name_ar: '', last_name_en: '',
    });
  }

  async function handleCreateTeacher() {
    if (!createForm.email || !createForm.password || !createForm.first_name_fr || !createForm.last_name_fr) {
      showToast(t('fillAllFields'), 'error');
      return;
    }
    if (createForm.password.length < 6) {
      showToast(t('passwordTooShort'), 'error');
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          subject: createForm.subject || null,
          first_name_fr: createForm.first_name_fr,
          first_name_ar: createForm.first_name_ar || createForm.first_name_fr,
          first_name_en: createForm.first_name_en || createForm.first_name_fr,
          last_name_fr: createForm.last_name_fr,
          last_name_ar: createForm.last_name_ar || createForm.last_name_fr,
          last_name_en: createForm.last_name_en || createForm.last_name_fr,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        showToast(result.error || t('errorOccurred'), 'error');
        setCreating(false);
        return;
      }

      showToast(t('teacherAccountCreated'), 'success');
      setShowCreateModal(false);
      resetCreateForm();
      loadData();
    } catch {
      showToast(t('errorOccurred'), 'error');
    }
    setCreating(false);
  }

  function getAvailableClassesForTeacher(teacher: Profile): ClassRoom[] {
    if (!teacher.subject) return [];
    const assignedClassIds = (teacherClassesMap[teacher.id] || []).map((c) => c.id);

    // Check which subjects are already on each class
    return classes.filter((cls) => {
      if (assignedClassIds.includes(cls.id)) return false;
      if (!cls.level) return false;
      if (!canTeacherTeachLevel(teacher.subject, cls.level.sort_order)) return false;

      // Check subject not already on this class
      const teachersOnClass = teachers.filter((tch) =>
        teacherClassesMap[tch.id]?.some((c) => c.id === cls.id)
      );
      if (teachersOnClass.some((tch) => tch.subject === teacher.subject)) return false;

      // Arabic: already has a class
      if (teacher.subject === 'arabic' && (teacherClassesMap[teacher.id] || []).length > 0) return false;

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
          <h1 className="text-2xl font-bold text-slate-800">{t('teachers')}</h1>
          <p className="text-sm text-slate-500">{t('manageTeachersDesc')}</p>
        </div>
        <Button size="sm" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}>
          <Plus className="w-4 h-4" />
          {t('addTeacher')}
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

      {teachers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500">{t('noTeachers')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => {
            const teacherClasses = teacherClassesMap[teacher.id] || [];
            const initials = getProfileName(teacher, lang).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={teacher.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{getProfileName(teacher, lang)}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" />
                      {teacher.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      {teacher.subject ? SUBJECT_ICONS[teacher.subject] : <BookOpen className="w-3 h-3" />}
                    </div>
                    <span className="text-slate-600">{getSubjectLabel(teacher.subject, lang) || t('noSubject')}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <School className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      {teacherClasses.length === 0 ? (
                        <span className="text-amber-600 text-xs">{t('noClassAssigned')}</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {teacherClasses.map((cls) => (
                            <span key={cls.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
                              {getClassName(cls, lang)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => { setSelectedTeacher(teacher); setShowAssignModal(true); }}
                >
                  <UserCheck className="w-4 h-4" />
                  {t('manageAssignments')}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Teacher Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetCreateForm(); }}
        title={t('createTeacherAccount')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{t('enterTeacherDetails')}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label={t('email')}
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <Input
              label={t('temporaryPassword')}
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
          </div>

          <Select
            label={t('teacherSubject')}
            value={createForm.subject}
            onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value as TeacherSubject | '' })}
          >
            <option value="">{t('selectSubject')}</option>
            <option value="arabic">{t('subjectArabic')}</option>
            <option value="french">{t('subjectFrench')}</option>
            <option value="english">{t('subjectEnglish')}</option>
            <option value="sport">{t('subjectSport')}</option>
          </Select>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('firstName')} ({t('required')})</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder={t('firstNameFr')} value={createForm.first_name_fr} onChange={(e) => setCreateForm({ ...createForm, first_name_fr: e.target.value })} required />
              <Input placeholder={t('firstNameAr')} value={createForm.first_name_ar} onChange={(e) => setCreateForm({ ...createForm, first_name_ar: e.target.value })} dir="rtl" />
              <Input placeholder={t('firstNameEn')} value={createForm.first_name_en} onChange={(e) => setCreateForm({ ...createForm, first_name_en: e.target.value })} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('lastName')} ({t('required')})</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder={t('lastNameFr')} value={createForm.last_name_fr} onChange={(e) => setCreateForm({ ...createForm, last_name_fr: e.target.value })} required />
              <Input placeholder={t('lastNameAr')} value={createForm.last_name_ar} onChange={(e) => setCreateForm({ ...createForm, last_name_ar: e.target.value })} dir="rtl" />
              <Input placeholder={t('lastNameEn')} value={createForm.last_name_en} onChange={(e) => setCreateForm({ ...createForm, last_name_en: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleCreateTeacher} disabled={creating} className="flex-1">
              {creating ? t('loading') : t('createTeacherAccount')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Assignments Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={t('manageAssignments')}
        size="lg"
      >
        {selectedTeacher && (() => {
          const assignedClasses = teacherClassesMap[selectedTeacher.id] || [];
          const available = getAvailableClassesForTeacher(selectedTeacher);
          return (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {getProfileName(selectedTeacher, lang).charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{getProfileName(selectedTeacher, lang)}</p>
                  <p className="text-xs text-slate-400">
                    {getSubjectLabel(selectedTeacher.subject, lang) || t('noSubject')}
                  </p>
                </div>
              </div>

              {selectedTeacher.subject && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <p className="text-xs text-teal-700">
                    {selectedTeacher.subject === 'arabic' ? t('arabicLevelRange') :
                     selectedTeacher.subject === 'french' ? t('frenchLevelRange') :
                     selectedTeacher.subject === 'english' ? t('englishLevelRange') :
                     t('sportLevelRange')}
                  </p>
                </div>
              )}

              {assignedClasses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('assignedTeachers')}</p>
                  <div className="space-y-2">
                    {assignedClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 border border-teal-100">
                        <School className="w-5 h-5 text-teal-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{getClassName(cls, lang)}</p>
                          <p className="text-xs text-slate-400">{cls.level ? cls.level.name_fr : ''}</p>
                        </div>
                        <button
                          onClick={() => removeClassFromTeacher(selectedTeacher.id, cls.id)}
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
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('addClass')}</p>
                  <div className="space-y-2">
                    {available.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => assignClassToTeacher(selectedTeacher.id, cls.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 text-start hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                      >
                        <School className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{getClassName(cls, lang)}</p>
                          <p className="text-xs text-slate-400">{cls.level ? cls.level.name_fr : ''}</p>
                        </div>
                        <Plus className="w-4 h-4 text-teal-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {available.length === 0 && assignedClasses.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">{t('noClasses')}</p>
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
