import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { getProfileName } from '@/lib/helpers';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/lib/supabase';

import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  School,
  Layers,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react';

export type PageKey =
  | 'dashboard'
  | 'myClass'
  | 'attendance'
  | 'levels'
  | 'classes'
  | 'teachers'
  | 'allAttendance'
  | 'reports'
  | 'settings';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
}

interface LayoutProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}

interface SchoolSettings {
  school_name: string | null;
  school_name_ar: string | null;
  school_name_en: string | null;
  logo_url: string | null;
}

export function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { t, lang, dir } = useI18n();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const isDirector = profile?.role === 'director';

  /*
   * Charger le nom et le logo de l'établissement
   */
  useEffect(() => {
    const loadSchoolSettings = async () => {
      const { data, error } = await supabase
        .from('school_settings')
        .select(
          'school_name, school_name_ar, school_name_en, logo_url'
        )
        .eq('singleton_key', 'school')
        .maybeSingle();

      if (error) {
        console.error(
          'Erreur chargement établissement dans Layout:',
          error
        );
        return;
      }

      if (data) {
        const settings = data as SchoolSettings;

        /*
         * Choisir le nom selon la langue de l'interface
         *
         * Français  -> school_name
         * Arabe     -> school_name_ar
         * Anglais   -> school_name_en
         *
         * Si une traduction n'existe pas,
         * on utilise automatiquement school_name.
         */
        let translatedName = settings.school_name || '';

        if (lang === 'ar') {
          translatedName =
            settings.school_name_ar ||
            settings.school_name ||
            '';
        } else if (lang === 'en') {
          translatedName =
            settings.school_name_en ||
            settings.school_name ||
            '';
        } else {
          translatedName =
            settings.school_name ||
            '';
        }

        setSchoolName(translatedName);

        /*
         * Logo
         */
        if (settings.logo_url) {
          setLogoUrl(
            `${settings.logo_url}?v=${Date.now()}`
          );
        } else {
          setLogoUrl(null);
        }
      }
    };

    loadSchoolSettings();
  }, [lang]);

  const navItems: NavItem[] = isDirector
    ? [
        {
          key: 'dashboard',
          label: t('dashboard'),
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          key: 'levels',
          label: t('levels'),
          icon: <Layers className="w-5 h-5" />,
        },
        {
          key: 'classes',
          label: t('classes'),
          icon: <School className="w-5 h-5" />,
        },
        {
          key: 'teachers',
          label: t('teachers'),
          icon: <Users className="w-5 h-5" />,
        },
        {
          key: 'allAttendance',
          label: t('allAttendance'),
          icon: <CalendarCheck className="w-5 h-5" />,
        },
        {
          key: 'reports',
          label: t('reports'),
          icon: <ClipboardList className="w-5 h-5" />,
        },
        {
          key: 'settings',
          label: t('settings'),
          icon: <Settings className="w-5 h-5" />,
        },
      ]
    : [
        {
          key: 'dashboard',
          label: t('dashboard'),
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          key: 'myClass',
          label: t('myClass'),
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          key: 'attendance',
          label: t('attendance'),
          icon: <CalendarCheck className="w-5 h-5" />,
        },
      ];

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = getProfileName(profile, lang);

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      dir={dir}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 ${
          dir === 'rtl' ? 'end-0' : 'start-0'
        } h-screen w-64 bg-white border-${
          dir === 'rtl' ? 'l' : 'r'
        } border-slate-200 z-40 transition-transform duration-300 flex flex-col ${
          sidebarOpen
            ? 'translate-x-0'
            : dir === 'rtl'
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* En-tête établissement */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={
                    schoolName ||
                    'Logo de l’établissement'
                  }
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    console.error(
                      'Erreur chargement logo Layout:',
                      logoUrl
                    );

                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-teal-600" />
              )}
            </div>

            {/* Nom établissement */}
            <div className="min-w-0">
              <h1
                className={`font-bold text-slate-800 text-sm leading-tight ${
                  lang === 'ar' ? 'text-right' : ''
                }`}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                title={schoolName || t('appName')}
              >
                {schoolName || t('appName')}
              </h1>

              <p
                className={`text-xs text-slate-400 truncate ${
                  lang === 'ar' ? 'text-right' : ''
                }`}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('appTagline')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                currentPage === item.key
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Utilisateur */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {displayName}
              </p>

              <p className="text-xs text-slate-400">
                {isDirector
                  ? t('director')
                  : t('teacher')}

                {profile?.subject &&
                  !isDirector &&
                  ` - ${t(
                    'subject' +
                      profile.subject.charAt(0).toUpperCase() +
                      profile.subject.slice(1)
                  )}`}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title={t('signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
            {
              navItems.find(
                (i) => i.key === currentPage
              )?.label
            }
          </h2>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}