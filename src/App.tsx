/**
 * AcademicMerdeka — Personal Student Management System
 * One Space for All Your Academic Needs.
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  Task,
  AcademicDocument,
  ScheduleItem,
  CalendarEvent,
  SavedLink,
  UserProfile,
  AppNotification,
} from './types';
import { Navbar } from './components/Common/Navbar';
import { Sidebar, MenuView } from './components/Common/Sidebar';
import { GlobalSearchModal } from './components/Common/GlobalSearchModal';
import { Login } from './components/Auth/Login';
import { ChangePasswordModal } from './components/Auth/ChangePasswordModal';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { DocumentVault } from './components/Documents/DocumentVault';
import { TaskManager } from './components/Tasks/TaskManager';
import { RosterView } from './components/Schedule/RosterView';
import { AcademicCalendar } from './components/Calendar/AcademicCalendar';
import { LinkManager } from './components/Links/LinkManager';
import { AcademicStats } from './components/Statistics/AcademicStats';
import { ProfilePage } from './components/Profile/ProfilePage';
import { SettingsHub } from './components/Settings/SettingsHub';
import { LoginEntranceTransition } from './components/Auth/LoginEntranceTransition';
import { GpaSimulator } from './components/AcademicPlanner/GpaSimulator';
import { StudyFocusRoom } from './components/Focus/StudyFocusRoom';
import { AcademicNotes } from './components/Notes/AcademicNotes';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return StorageService.getAuthSession();
  });
  const [showEntranceTransition, setShowEntranceTransition] = useState<boolean>(false);

  // App Data States
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [documents, setDocuments] = useState<AcademicDocument[]>(() =>
    StorageService.getDocuments()
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() =>
    StorageService.getSchedules()
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() =>
    StorageService.getCalendarEvents()
  );
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>(() =>
    StorageService.getLinks()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.getNotifications()
  );

  // Navigation & UI States
  const [currentView, setCurrentView] = useState<MenuView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  // Theme State (default dark)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('academic_merdeka_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // Synchronize 'dark' class with <html> element so Tailwind's dark: variant works flawlessly
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('academic_merdeka_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('academic_merdeka_theme', 'light');
    }
  }, [isDark]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Keyboard shortcut listener for Ctrl+K global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Handlers with LocalStorage Sync
  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleSaveDocuments = (newDocs: AcademicDocument[]) => {
    setDocuments(newDocs);
    StorageService.saveDocuments(newDocs);
  };

  const handleUpdateStorage = (deltaBytes: number) => {
    const updated = {
      ...profile,
      storage_used: Math.max(0, profile.storage_used + deltaBytes),
      storage_limit: 1073741824, // 1 GB
    };
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleSaveSchedules = (newSchedules: ScheduleItem[]) => {
    setSchedules(newSchedules);
    StorageService.saveSchedules(newSchedules);
  };

  const handleSaveCalendarEvents = (newEvents: CalendarEvent[]) => {
    setCalendarEvents(newEvents);
    StorageService.saveCalendarEvents(newEvents);
  };

  const handleSaveLinks = (newLinks: SavedLink[]) => {
    setSavedLinks(newLinks);
    StorageService.saveLinks(newLinks);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    const merged = { ...newProfile, storage_limit: 1073741824 };
    setProfile(merged);
    StorageService.saveProfile(merged);
  };

  // Notification actions
  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    showToast('Semua notifikasi ditandai telah dibaca.');
  };

  // Quick Action triggers
  const handleQuickAction = (actionType: 'task' | 'doc' | 'schedule' | 'link') => {
    switch (actionType) {
      case 'task':
        setCurrentView('tugas');
        break;
      case 'doc':
        setCurrentView('dokumen');
        break;
      case 'schedule':
        setCurrentView('jadwal');
        break;
      case 'link':
        setCurrentView('link');
        break;
    }
  };

  // Toggle complete on dashboard
  const handleToggleTaskComplete = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: (t.status === 'selesai' ? 'belum_dikerjakan' : 'selesai') as any,
            completed_at: t.status !== 'selesai' ? new Date().toISOString() : undefined,
          }
        : t
    );
    handleSaveTasks(updated);
    showToast('Status tugas diperbarui!');
  };

  // Logout
  const handleLogout = () => {
    StorageService.setAuthSession(false);
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari akun.');
  };

  // Factory reset demo data
  const handleResetFactoryData = () => {
    StorageService.resetAllData();
    setTasks(StorageService.getTasks());
    setDocuments(StorageService.getDocuments());
    setSchedules(StorageService.getSchedules());
    setCalendarEvents(StorageService.getCalendarEvents());
    setSavedLinks(StorageService.getLinks());
    setProfile(StorageService.getProfile());
    setNotifications(StorageService.getNotifications());
    showToast('Seluruh data berhasil dikembalikan ke status awal demo.');
  };

  // Active tasks count for sidebar badge
  const activeTasksCount = tasks.filter((t) => t.status !== 'selesai').length;

  // Unauthenticated screen
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setShowEntranceTransition(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-150`}>
      {/* Login Welcome Entrance Transition Overlay */}
      <AnimatePresence>
        {showEntranceTransition && (
          <LoginEntranceTransition
            profile={profile}
            onFinish={() => setShowEntranceTransition(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <Navbar
        profile={profile}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onQuickAction={handleQuickAction}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex relative">
        {/* Backdrop Overlay: Clicking empty space outside closes the sidebar */}
        {!isSidebarCollapsed && (
          <div
            onClick={() => setIsSidebarCollapsed(true)}
            className="fixed inset-0 top-16 bg-slate-950/40 backdrop-blur-2xs z-20 md:hidden transition-opacity cursor-pointer"
          />
        )}

        {/* Collapsible Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseSidebar={() => setIsSidebarCollapsed(true)}
          profile={profile}
          activeTasksCount={activeTasksCount}
        />

        {/* Main Content Area - Auto collapses sidebar when clicking empty background space */}
        <main
          onClick={(e) => {
            // Auto collapse the sidebar when clicking empty space
            if (!isSidebarCollapsed) {
              const target = e.target as HTMLElement;
              const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], canvas');
              if (window.innerWidth < 768 || !isInteractive) {
                setIsSidebarCollapsed(true);
              }
            }
          }}
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full min-h-[calc(100vh-4rem)]"
        >
          {currentView === 'dashboard' && (
            <DashboardOverview
              tasks={tasks}
              documents={documents}
              schedules={schedules}
              links={savedLinks}
              profile={profile}
              onNavigate={(v) => setCurrentView(v)}
              onToggleTaskComplete={handleToggleTaskComplete}
              onQuickAction={handleQuickAction}
            />
          )}

          {currentView === 'dokumen' && (
            <DocumentVault
              documents={documents}
              profile={profile}
              onSaveDocuments={handleSaveDocuments}
              onUpdateStorage={handleUpdateStorage}
              onShowToast={showToast}
            />
          )}

          {currentView === 'presentasi' && (
            <DocumentVault
              documents={documents}
              profile={profile}
              onSaveDocuments={handleSaveDocuments}
              onUpdateStorage={handleUpdateStorage}
              onShowToast={showToast}
              filterInitialCategory="Presentasi PPT"
            />
          )}

          {currentView === 'media' && (
            <DocumentVault
              documents={documents}
              profile={profile}
              onSaveDocuments={handleSaveDocuments}
              onUpdateStorage={handleUpdateStorage}
              onShowToast={showToast}
              filterInitialCategory="Desain"
            />
          )}

          {currentView === 'tugas' && (
            <TaskManager
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
              onShowToast={showToast}
            />
          )}

          {currentView === 'catatan' && (
            <AcademicNotes
              schedules={schedules}
              onShowToast={showToast}
            />
          )}

          {currentView === 'fokus' && (
            <StudyFocusRoom
              schedules={schedules}
              onShowToast={showToast}
            />
          )}

          {currentView === 'ipk' && (
            <GpaSimulator
              profile={profile}
              onShowToast={showToast}
            />
          )}

          {currentView === 'jadwal' && (
            <RosterView
              schedules={schedules}
              onSaveSchedules={handleSaveSchedules}
              onShowToast={showToast}
            />
          )}

          {currentView === 'kalender' && (
            <AcademicCalendar
              events={calendarEvents}
              tasks={tasks}
              schedules={schedules}
              onSaveEvents={handleSaveCalendarEvents}
              onShowToast={showToast}
            />
          )}

          {currentView === 'link' && (
            <LinkManager
              links={savedLinks}
              onSaveLinks={handleSaveLinks}
              onShowToast={showToast}
            />
          )}

          {currentView === 'statistik' && (
            <AcademicStats
              tasks={tasks}
              documents={documents}
              onShowToast={showToast}
            />
          )}

          {currentView === 'profil' && (
            <ProfilePage
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onShowToast={showToast}
            />
          )}

          {currentView === 'pengaturan' && (
            <SettingsHub
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onResetFactoryData={handleResetFactoryData}
              onShowToast={showToast}
              isDark={isDark}
              onToggleTheme={() => setIsDark(!isDark)}
              onTriggerEntrancePreview={() => setShowEntranceTransition(true)}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        documents={documents}
        schedules={schedules}
        links={savedLinks}
        onSelectView={(v) => setCurrentView(v as MenuView)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccessToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-medium backdrop-blur-xl transition-all ${
              toastMessage.isError
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200'
                : 'bg-white dark:bg-slate-900/95 border-slate-200 dark:border-cyan-500/40 text-slate-800 dark:text-slate-100 shadow-slate-200/50 dark:shadow-cyan-500/10'
            }`}
          >
            {toastMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
