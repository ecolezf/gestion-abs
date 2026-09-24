import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { I18nProvider } from '@/i18n/I18nContext';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

import { AuthPage } from '@/pages/AuthPage';
import { Layout, type PageKey } from '@/components/Layout';

import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { DirectorDashboard } from '@/pages/DirectorDashboard';
import { MyStudentsPage } from '@/pages/MyStudentsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { LevelsPage } from '@/pages/LevelsPage';
import { ClassesPage } from '@/pages/ClassesPage';
import { TeachersPage } from '@/pages/TeachersPage';
import { AllAttendancePage } from '@/pages/AllAttendancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'light'
          ? 'Activer le mode nuit'
          : 'Activer le mode clair'
      }
      title={
        theme === 'light'
          ? 'Mode nuit'
          : 'Mode clair'
      }
      className="
  fixed
  top-4
  end-1
  z-[9999]
  w-10
  h-10
  rounded-full
  flex
  items-center
  justify-center
  bg-slate-800
  dark:bg-white
  text-white
  dark:text-slate-800
  border
  border-slate-700
  dark:border-slate-200
  shadow-lg
  hover:scale-105
  transition-all
"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}

function AppContent() {
  const { session, profile, loading } = useAuth();

  const [currentPage, setCurrentPage] =
    useState<PageKey>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-slate-400 dark:text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <AuthPage />;
  }

  const isDirector = profile.role === 'director';

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageKey);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return isDirector ? (
          <DirectorDashboard onNavigate={handleNavigate} />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'myClass':
        return <MyStudentsPage />;

      case 'attendance':
        return <AttendancePage />;

      case 'levels':
        return isDirector ? (
          <LevelsPage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'classes':
        return isDirector ? (
          <ClassesPage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'teachers':
        return isDirector ? (
          <TeachersPage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'allAttendance':
        return isDirector ? (
          <AllAttendancePage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'reports':
        return isDirector ? (
          <ReportsPage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      case 'settings':
        return isDirector ? (
          <SettingsPage />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );

      default:
        return isDirector ? (
          <DirectorDashboard onNavigate={handleNavigate} />
        ) : (
          <TeacherDashboard onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ThemeToggle />

            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;