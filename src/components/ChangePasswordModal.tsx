import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function ChangePasswordModal({
  open,
  onClose,
  email,
}: ChangePasswordModalProps) {
  const { t, lang, dir } = useI18n();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] =
    useState('');
  const [newPassword, setNewPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [saving, setSaving] = useState(false);

  const labels = {
    current:
      lang === 'ar'
        ? 'كلمة المرور الحالية'
        : lang === 'en'
          ? 'Current password'
          : 'Mot de passe actuel',
    next:
      lang === 'ar'
        ? 'كلمة المرور الجديدة'
        : lang === 'en'
          ? 'New password'
          : 'Nouveau mot de passe',
    confirm:
      lang === 'ar'
        ? 'تأكيد كلمة المرور الجديدة'
        : lang === 'en'
          ? 'Confirm new password'
          : 'Confirmer le nouveau mot de passe',
    description:
      lang === 'ar'
        ? 'أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة.'
        : lang === 'en'
          ? 'Enter your current password, then choose a new password.'
          : 'Entrez votre mot de passe actuel, puis choisissez un nouveau mot de passe.',
    emailLabel: lang === 'ar' ? 'البريد الإلكتروني' : lang === 'en' ? 'Email' : 'Email',
    saving:
      lang === 'ar'
        ? 'جارٍ الحفظ...'
        : lang === 'en'
          ? 'Saving...'
          : 'Enregistrement...',
    success:
      lang === 'ar'
        ? 'تم تغيير كلمة المرور بنجاح.'
        : lang === 'en'
          ? 'Password changed successfully.'
          : 'Mot de passe modifié avec succès.',
    currentError:
      lang === 'ar'
        ? 'كلمة المرور الحالية غير صحيحة.'
        : lang === 'en'
          ? 'The current password is incorrect.'
          : 'Le mot de passe actuel est incorrect.',
  };

  function resetForm() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function handleClose() {
    if (saving) return;
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (saving) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t('fillAllFields'), 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast(t('passwordTooShort'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(t('passwordsDoNotMatch'), 'error');
      return;
    }

    if (newPassword === currentPassword) {
      showToast(
        lang === 'ar'
          ? 'اختر كلمة مرور مختلفة عن الحالية.'
          : lang === 'en'
            ? 'Choose a password different from the current one.'
            : 'Choisissez un mot de passe différent de l’ancien.',
        'error'
      );
      return;
    }

    setSaving(true);

    try {
      // 1. Vérifier le mot de passe actuel.
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

      if (signInError) {
        showToast(labels.currentError, 'error');
        return;
      }

      // 2. Modifier le mot de passe du compte connecté.
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        console.error(
          'Erreur changement mot de passe:',
          updateError
        );
        showToast(
          updateError.message || t('errorOccurred'),
          'error'
        );
        return;
      }

      showToast(labels.success, 'success');
      resetForm();
      onClose();
    } catch (error) {
      console.error(
        'Erreur changement mot de passe:',
        error
      );
      showToast(t('errorOccurred'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('changePassword')}
      size="lg"
    >
      <div className="space-y-5" dir={dir}>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
          <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-teal-800">
              {t('changePassword')}
            </p>
            <p className="text-sm text-teal-700 mt-1">
              {labels.description}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500">
            {labels.emailLabel}
          </p>
          <p className="text-sm font-medium text-slate-700 break-all mt-1">
            {email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <LockKeyhole
              className={`absolute top-1/2 -translate-y-1/2 ${
                dir === 'rtl' ? 'end-3' : 'start-3'
              } w-4 h-4 text-slate-400 pointer-events-none`}
            />
            <Input
              label={labels.current}
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              className="ps-10"
              autoComplete="current-password"
              disabled={saving}
            />
          </div>

          <div className="relative">
            <LockKeyhole
              className={`absolute top-1/2 -translate-y-1/2 ${
                dir === 'rtl' ? 'end-3' : 'start-3'
              } w-4 h-4 text-slate-400 pointer-events-none`}
            />
            <Input
              label={labels.next}
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="ps-10"
              autoComplete="new-password"
              disabled={saving}
            />
          </div>

          <div className="relative">
            <LockKeyhole
              className={`absolute top-1/2 -translate-y-1/2 ${
                dir === 'rtl' ? 'end-3' : 'start-3'
              } w-4 h-4 text-slate-400 pointer-events-none`}
            />
            <Input
              label={labels.confirm}
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="ps-10"
              autoComplete="new-password"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={saving}
          >
            {t('cancel')}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={saving}
          >
            {saving ? labels.saving : t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
