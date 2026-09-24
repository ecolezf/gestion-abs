import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { getLevelName } from '@/lib/helpers';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { Level } from '@/types/database';
import { Plus, Edit2, Trash2, Layers, ArrowUp, ArrowDown } from 'lucide-react';

export function LevelsPage() {
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Level | null>(null);
  const [form, setForm] = useState({ name_ar: '', name_fr: '', name_en: '', sort_order: '0' });

  useEffect(() => {
    loadLevels();
  }, []);

  async function loadLevels() {
    setLoading(true);
    const { data } = await supabase.from('levels').select('*').order('sort_order');
    setLevels(data as Level[] || []);
    setLoading(false);
  }

  function resetForm() {
    setForm({ name_ar: '', name_fr: '', name_en: '', sort_order: '0' });
  }

  async function handleSave() {
    if (!form.name_fr) {
      showToast(t('fillAllFields'), 'error');
      return;
    }

    const payload = {
      name_ar: form.name_ar || form.name_fr,
      name_fr: form.name_fr,
      name_en: form.name_en || form.name_fr,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editing) {
      const { error } = await supabase.from('levels').update(payload).eq('id', editing.id);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('levelUpdated'), 'success');
    } else {
      const { error } = await supabase.from('levels').insert(payload);
      if (error) { showToast(t('errorOccurred'), 'error'); return; }
      showToast(t('levelCreated'), 'success');
    }

    setShowModal(false);
    setEditing(null);
    resetForm();
    loadLevels();
  }

  async function handleDelete(level: Level) {
    if (!confirm(t('confirmDeleteLevel'))) return;
    const { error } = await supabase.from('levels').delete().eq('id', level.id);
    if (error) {
      showToast(t('cannotDeleteLevel') + ' - ' + t('levelInUse'), 'error');
      return;
    }
    showToast(t('levelDeleted'), 'success');
    loadLevels();
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
          <h1 className="text-2xl font-bold text-slate-800">{t('levels')}</h1>
          <p className="text-sm text-slate-500">{t('manageLevels')}</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
          <Plus className="w-4 h-4" />
          {t('addLevel')}
        </Button>
      </div>

      {levels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500">{t('noLevels')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <div key={level.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{getLevelName(level, lang)}</h3>
                    <p className="text-xs text-slate-400">{t('sortOrder')}: {level.sort_order}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(level); setForm({ name_ar: level.name_ar, name_fr: level.name_fr, name_en: level.name_en, sort_order: String(level.sort_order) }); setShowModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(level)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50 space-y-1">
                <p className="text-xs text-slate-400"><span className="text-slate-500 font-medium">FR:</span> {level.name_fr}</p>
                <p className="text-xs text-slate-400"><span className="text-slate-500 font-medium">AR:</span> {level.name_ar}</p>
                <p className="text-xs text-slate-400"><span className="text-slate-500 font-medium">EN:</span> {level.name_en}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); resetForm(); }} title={editing ? t('edit') : t('addLevel')}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameFr')} ({t('required')})</p>
            <Input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder={t('levelName')} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameAr')}</p>
            <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder={t('levelName')} dir="rtl" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t('nameEn')}</p>
            <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder={t('levelName')} />
          </div>
          <Input label={t('sortOrder')} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditing(null); resetForm(); }} className="flex-1">{t('cancel')}</Button>
            <Button onClick={handleSave} className="flex-1">{t('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
