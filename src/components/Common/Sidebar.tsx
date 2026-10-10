import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Presentation,
  Link2,
  Image as ImageIcon,
  CalendarDays,
  Calendar,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Calculator,
  Headphones,
  FileText,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type MenuView =
  | 'dashboard'
  | 'dokumen'
  | 'tugas'
  | 'catatan'
  | 'fokus'
  | 'ipk'
  | 'presentasi'
  | 'link'
  | 'media'
  | 'jadwal'
  | 'kalender'
  | 'statistik'
  | 'profil'
  | 'pengaturan';

interface SidebarProps {
  currentView: MenuView;
  onSelectView: (view: MenuView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseSidebar?: () => void;
  profile: UserProfile;
  activeTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  onCloseSidebar,
  profile,
  activeTasksCount,
}) => {
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Auto-close sidebar when clicking outside on empty space
  useEffect(() => {
    if (isCollapsed) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-sidebar-toggle="true"]')) return;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        if (onCloseSidebar) {
          onCloseSidebar();
        } else {
          onToggleCollapse();
        }
      }
    };

    // Use capturing phase or standard listener to reliably catch empty space clicks
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCollapsed, onCloseSidebar, onToggleCollapse]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dokumen', label: 'Semua Dokumen', icon: FolderOpen },
    {
      id: 'tugas',
      label: 'Tugas Kuliah',
      icon: CheckSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    { id: 'catatan', label: 'Catatan Kuliah', icon: FileText },
    { id: 'fokus', label: 'Ruang Fokus Belajar', icon: Headphones },
    { id: 'ipk', label: 'Target & Simulator IPK', icon: Calculator },
    { id: 'presentasi', label: 'Presentasi & PPT', icon: Presentation },
    { id: 'link', label: 'Link Tugas', icon: Link2 },
    { id: 'media', label: 'Gambar & Media', icon: ImageIcon },
    { id: 'jadwal', label: 'Jadwal Kuliah / Roster', icon: CalendarDays },
    { id: 'kalender', label: 'Kalender Akademik', icon: Calendar },
    { id: 'statistik', label: 'Statistik & Grafik', icon: BarChart3 },
    { id: 'profil', label: 'Profil Saya', icon: User },
    { id: 'pengaturan', label: 'Pengaturan & XAMPP', icon: Settings, hasSpecialBadge: true },
  ];

  // Storage calculation for 1 GB limit
  const storageUsedMB = (profile.storage_used / (1024 * 1024)).toFixed(1);
  const storageLimitMB = (profile.storage_limit / (1024 * 1024)).toFixed(0); // 1024 MB (1 GB)
  const storagePercent = Math.min(
    100,
    Math.round((profile.storage_used / profile.storage_limit) * 100)
  );

  return (
    <aside
      ref={sidebarRef}
      className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between shrink-0 select-none shadow-xl md:shadow-none ${
        isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'
      }`}
    >
      {/* Navigation menu list */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 mb-1">
          {!isCollapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workspace Akademik
            </span>
          )}
          <button
            data-sidebar-toggle="true"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-auto"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id as MenuView);
                // On mobile or small screens, auto-close sidebar after selection
                if (window.innerWidth < 768 && onCloseSidebar) {
                  onCloseSidebar();
                }
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-semibold">
                  {item.badge}
                </span>
              )}
              {!isCollapsed && item.hasSpecialBadge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  PHP/SQL
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Storage and System Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Kapasitas Vault
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-300 text-[10px] font-semibold">
                {storageUsedMB} / {storageLimitMB} MB (1 GB)
              </span>
            </div>
            {/* Storage bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{storagePercent}% Terpakai</span>
              <span>Zona: Asia/Jakarta</span>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center py-1 text-slate-600 dark:text-slate-400 cursor-pointer"
            title={`Kapasitas Vault: ${storageUsedMB}MB / ${storageLimitMB}MB (1 GB)`}
          >
            <HardDrive className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
