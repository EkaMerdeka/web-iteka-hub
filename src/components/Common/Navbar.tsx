import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Shield,
  LogOut,
  User,
  KeyRound,
  FileUp,
  CheckSquare,
  Calendar,
  Link2,
  Menu,
} from 'lucide-react';
import { UserProfile, AppNotification } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  profile: UserProfile;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenSearch: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onQuickAction: (actionType: 'task' | 'doc' | 'schedule' | 'link') => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenSearch,
  onOpenChangePassword,
  onLogout,
  isDark,
  onToggleTheme,
  onQuickAction,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Time-based greeting in Indonesian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Zone 1: Single text element wordmark / brand + Sidebar Menu button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleSidebar && (
          <button
            data-sidebar-toggle="true"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Buka / Tutup Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <a href="#dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            AM
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap block">
              AcademicMerdeka
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Middle controls - Search & Greeting */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-2 md:mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
            <span className="hidden sm:inline">Cari tugas, dokumen, link, roster...</span>
            <span className="sm:hidden">Cari di AcademicMerdeka...</span>
          </span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          <span>{getGreeting()}, <strong className="text-slate-800 dark:text-slate-200">{profile.name.split(' ')[0]}</strong></span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-500">{currentDateStr}</span>
        </div>
      </div>

      {/* Zone 3: Actions - Quick Action, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Quick Add Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tambah Baru</span>
          </button>

          {showQuickActionMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-200">
              <button
                onClick={() => {
                  onQuickAction('task');
                  setShowQuickActionMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Tambah Tugas Kuliah</span>
              </button>
              <button
                onClick={() => {
                  onQuickAction('doc');
                  setShowQuickActionMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upload Dokumen Vault</span>
              </button>
              <button
                onClick={() => {
                  onQuickAction('schedule');
                  setShowQuickActionMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>Tambah Jadwal Kuliah</span>
              </button>
              <button
                onClick={() => {
                  onQuickAction('link');
                  setShowQuickActionMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Simpan Link Platform</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={onMarkNotificationRead}
              onMarkAllAsRead={onMarkAllNotificationsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={profile.avatar_url || '/src/assets/images/avatar_student_eka_1791559099608.jpg'}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/30"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="hidden lg:block text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
              {profile.name}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{profile.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.study_program} · {profile.batch}</p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">NIM: {profile.nim || '26/512940/TK/59102'}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenChangePassword();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Ganti Password</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer mt-1 border-t border-slate-100 dark:border-slate-800/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
