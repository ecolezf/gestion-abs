import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap,
  Shield,
  Users,
  Mail,
  Lock,
  ChevronRight,
  Info,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';

export function AuthPage() {
  const { t, dir } = useI18n();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const [setupAvailable, setSetupAvailable] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const [schoolName, setSchoolName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Création administrateur
  const [firstNameFr, setFirstNameFr] = useState('');
  const [lastNameFr, setLastNameFr] = useState('');

  const [firstNameAr, setFirstNameAr] = useState('');
  const [lastNameAr, setLastNameAr] = useState('');

  const [firstNameEn, setFirstNameEn] = useState('');
  const [lastNameEn, setLastNameEn] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  // -------------------------------------------------------
  // Vérifier si l'application est encore en première
  // utilisation.
  // -------------------------------------------------------

  useEffect(() => {
    const checkInitialSetup = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'director')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Initial setup check error:', error);
          setSetupAvailable(false);
          return;
        }

        // Aucun directeur = première utilisation
        setSetupAvailable(!data);
      } catch (error) {
        console.error('Initial setup check error:', error);
        setSetupAvailable(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkInitialSetup();
  }, []);
useEffect(() => {
  const loadSchoolSettings = async () => {
    const { data, error } = await supabase
      .from('school_settings')
      .select('school_name, logo_url')
      .eq('singleton_key', 'school')
      .maybeSingle();

    if (error) {
      console.error(
        'Erreur chargement établissement AuthPage:',
        error
      );
      return;
    }

    if (data) {
      setSchoolName(data.school_name || '');

      if (data.logo_url) {
        setLogoUrl(
          `${data.logo_url}?v=${Date.now()}`
        );
      } else {
        setLogoUrl(null);
      }
    }
  };

  loadSchoolSettings();
}, []);
  // -------------------------------------------------------
  // Connexion
  // -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      showToast(t('invalidCredentials'), 'error');
      setLoading(false);
      return;
    }
  };

  // -------------------------------------------------------
  // Création du premier administrateur
  // -------------------------------------------------------

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstNameFr.trim() || !lastNameFr.trim()) {
      showToast(t('fillAllFields'), 'error');
      return;
    }

    if (!adminEmail.trim()) {
      showToast(t('invalidEmail'), 'error');
      return;
    }

    if (adminPassword.length < 8) {
      showToast(t('passwordMinimum'), 'error');
      return;
    }

    if (adminPassword !== confirmAdminPassword) {
      showToast(t('passwordsDoNotMatch'), 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'setup-admin',
        {
          body: {
            email: adminEmail.trim().toLowerCase(),
            password: adminPassword,

            first_name_fr: firstNameFr.trim(),
            last_name_fr: lastNameFr.trim(),

            first_name_ar: firstNameAr.trim() || null,
            last_name_ar: lastNameAr.trim() || null,

            first_name_en: firstNameEn.trim() || null,
            last_name_en: lastNameEn.trim() || null,
          },
        }
      );

      if (error) {
        console.error('setup-admin error:', error);

        showToast(
          error.message || t('setupError'),
          'error'
        );

        setLoading(false);
        return;
      }

      if (!data?.success) {
        showToast(
          data?.error || t('setupError'),
          'error'
        );

        setLoading(false);
        return;
      }

      showToast(t('accountCreated'), 'success');

      // ---------------------------------------------------
      // Connecter automatiquement le nouvel administrateur
      // ---------------------------------------------------

      const { error: signInError } = await signIn(
        adminEmail.trim().toLowerCase(),
        adminPassword
      );

      if (signInError) {
        // Le compte est bien créé, même si la connexion
        // automatique échoue.
        showToast(
          t('accountCreated'),
          'success'
        );

        setShowSetup(false);
        setSetupAvailable(false);

        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Unexpected setup error:', error);

      showToast(t('setupError'), 'error');

      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Écran de chargement initial
  // -------------------------------------------------------

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>

          <p className="text-slate-500">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-teal-50"
      dir={dir}
    >
      {/* --------------------------------------------------
          Left panel
      -------------------------------------------------- */}

      <div className="lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 end-20 w-80 h-80 rounded-full bg-cyan-300 blur-3xl" />
        </div>

       <div className="relative z-10 flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de l’établissement"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                console.error(
                  'Erreur chargement logo AuthPage:',
                  logoUrl
                );

                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <GraduationCap className="w-7 h-7 text-teal-700" />
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">
            {schoolName || t('appName')}
          </h1>

          <p className="text-sm text-teal-100 truncate">
            {t('appTagline')}
          </p>
        </div>
      </div>
        <div className="relative z-10 hidden lg:block space-y-6">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-2">
              {t('welcome')}
            </h2>

            <p className="text-teal-100 text-lg">
              {t('appTagline')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>

              <div>
                <p className="font-semibold">
                  {t('director')}
                </p>

                <p className="text-sm text-teal-100">
                  {t('directorCanManageAll')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>

              <div>
                <p className="font-semibold">
                  {t('teacher')}
                </p>

                <p className="text-sm text-teal-100">
                  {t('teacherManagesOwnClass')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <LanguageSwitcher />
        </div>
      </div>

      {/* --------------------------------------------------
          Right panel
      -------------------------------------------------- */}

      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile header */}

       <div className="lg:hidden flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-teal-700 min-w-0">
          <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo de l’établissement"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <GraduationCap className="w-6 h-6" />
            )}
          </div>

          <span className="font-bold text-lg truncate">
            {schoolName || t('appName')}
          </span>
        </div>

  <LanguageSwitcher />
</div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

            {/* =================================================
                CRÉATION ADMINISTRATEUR
            ================================================= */}

            {showSetup && setupAvailable ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSetup(false)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-5"
                >
                  <ArrowLeft className="w-4 h-4" />

                  {t('backToLogin')}
                </button>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                    <UserPlus className="w-6 h-6" />
                  </div>

                  <p className="text-sm font-medium text-teal-600 mb-1">
                    {t('firstUse')}
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {t('createDirectorAccount')}
                  </h2>

                  <p className="text-slate-500 text-sm">
                    {t('createDirectorDescription')}
                  </p>
                </div>

                <form
                  onSubmit={handleCreateAdmin}
                  className="space-y-4"
                >
                  {/* Nom français */}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder={t('firstNameFr')}
                      value={firstNameFr}
                      onChange={(e) =>
                        setFirstNameFr(e.target.value)
                      }
                      required
                    />

                    <Input
                      type="text"
                      placeholder={t('lastNameFr')}
                      value={lastNameFr}
                      onChange={(e) =>
                        setLastNameFr(e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Nom arabe */}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder={t('firstNameAr')}
                      value={firstNameAr}
                      onChange={(e) =>
                        setFirstNameAr(e.target.value)
                      }
                    />

                    <Input
                      type="text"
                      placeholder={t('lastNameAr')}
                      value={lastNameAr}
                      onChange={(e) =>
                        setLastNameAr(e.target.value)
                      }
                    />
                  </div>

                  {/* Nom anglais */}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder={t('firstNameEn')}
                      value={firstNameEn}
                      onChange={(e) =>
                        setFirstNameEn(e.target.value)
                      }
                    />

                    <Input
                      type="text"
                      placeholder={t('lastNameEn')}
                      value={lastNameEn}
                      onChange={(e) =>
                        setLastNameEn(e.target.value)
                      }
                    />
                  </div>

                  {/* Email */}

                  <div className="relative">
                    <Mail
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        dir === 'rtl'
                          ? 'end-3'
                          : 'start-3'
                      } w-5 h-5 text-slate-400 pointer-events-none`}
                    />

                    <Input
                      type="email"
                      placeholder={t('email')}
                      value={adminEmail}
                      onChange={(e) =>
                        setAdminEmail(e.target.value)
                      }
                      required
                      className="ps-10"
                    />
                  </div>

                  {/* Mot de passe */}

                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        dir === 'rtl'
                          ? 'end-3'
                          : 'start-3'
                      } w-5 h-5 text-slate-400 pointer-events-none`}
                    />

                    <Input
                      type="password"
                      placeholder={t('password')}
                      value={adminPassword}
                      onChange={(e) =>
                        setAdminPassword(e.target.value)
                      }
                      required
                      className="ps-10"
                    />
                  </div>

                  {/* Confirmation */}

                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        dir === 'rtl'
                          ? 'end-3'
                          : 'start-3'
                      } w-5 h-5 text-slate-400 pointer-events-none`}
                    />

                    <Input
                      type="password"
                      placeholder={t('confirmPassword')}
                      value={confirmAdminPassword}
                      onChange={(e) =>
                        setConfirmAdminPassword(
                          e.target.value
                        )
                      }
                      required
                      className="ps-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? t('creatingAccount')
                      : t('createAdministrator')}

                    {!loading && (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              /* =================================================
                 CONNEXION
              ================================================= */

              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {t('signIn')}
                </h2>

                <p className="text-slate-500 text-sm mb-6">
                  {t('signInToContinue')}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        dir === 'rtl'
                          ? 'end-3'
                          : 'start-3'
                      } w-5 h-5 text-slate-400 pointer-events-none`}
                    />

                    <Input
                      type="email"
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      className="ps-10"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        dir === 'rtl'
                          ? 'end-3'
                          : 'start-3'
                      } w-5 h-5 text-slate-400 pointer-events-none`}
                    />

                    <Input
                      type="password"
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="ps-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? t('loading')
                      : t('signIn')}

                    {!loading && (
                      <ChevronRight
                        className={`w-4 h-4 ${
                          dir === 'rtl'
                            ? 'rotate-180'
                            : ''
                        }`}
                      />
                    )}
                  </Button>
                </form>

                {/* Première utilisation */}

                {setupAvailable && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-teal-800">
                            {t('firstUse')}
                          </p>

                          <p className="text-sm text-teal-700 mt-1">
                            {t('createDirectorDescription')}
                          </p>

                          <button
                            type="button"
                            onClick={() => setShowSetup(true)}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
                          >
                            <UserPlus className="w-4 h-4" />

                            {t('createDirectorAccount')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />

                    <p className="text-sm text-slate-600">
                      {t('directorCreatesTeachers')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}