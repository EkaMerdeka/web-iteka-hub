import React, { useEffect, useRef } from 'react';
import {
  FileText,
  CheckSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Link2,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  HardDrive,
  FileUp,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import {
  Task,
  AcademicDocument,
  ScheduleItem,
  SavedLink,
  UserProfile,
  DayOfWeek,
} from '../../types';

Chart.register(...registerables);

interface DashboardOverviewProps {
  tasks: Task[];
  documents: AcademicDocument[];
  schedules: ScheduleItem[];
  links: SavedLink[];
  profile: UserProfile;
  onNavigate: (viewName: any) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onQuickAction: (actionType: 'task' | 'doc' | 'schedule' | 'link') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  documents,
  schedules,
  links,
  profile,
  onNavigate,
  onToggleTaskComplete,
  onQuickAction,
}) => {
  const taskChartRef = useRef<HTMLCanvasElement | null>(null);
  const docChartRef = useRef<HTMLCanvasElement | null>(null);
  const taskChartInstance = useRef<Chart | null>(null);
  const docChartInstance = useRef<Chart | null>(null);

  // Filter metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTasks = tasks.filter((t) => {
    const d = new Date(t.given_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const pendingTasks = tasks.filter((t) => t.status !== 'selesai');
  const completedTasks = tasks.filter((t) => t.status === 'selesai');

  // Tasks approaching deadline (within 7 days and not completed)
  const approachingDeadlineTasks = pendingTasks.filter((t) => {
    const d = new Date(t.deadline);
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  });

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Today's schedule
  const indonesianDays: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
  const todayDayName: DayOfWeek = dayIndex >= 1 && dayIndex <= 6 ? indonesianDays[dayIndex - 1] : 'Senin';
  
  const todaySchedules = schedules
    .filter((s) => s.day === todayDayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Storage metric (1 GB limit)
  const storageMB = (profile.storage_used / (1024 * 1024)).toFixed(1);
  const storageLimitMB = (profile.storage_limit / (1024 * 1024)).toFixed(0);

  // Setup Chart.js instances
  useEffect(() => {
    // 1. Monthly tasks activity chart (Last 6 months)
    if (taskChartRef.current) {
      if (taskChartInstance.current) {
        taskChartInstance.current.destroy();
      }

      const ctx = taskChartRef.current.getContext('2d');
      if (ctx) {
        const monthNames = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];

        // High-fidelity vertical gradients
        const gradientBlue = ctx.createLinearGradient(0, 0, 0, 240);
        gradientBlue.addColorStop(0, '#38bdf8'); // cyan-400
        gradientBlue.addColorStop(1, '#2563eb'); // blue-600

        const gradientGreen = ctx.createLinearGradient(0, 0, 0, 240);
        gradientGreen.addColorStop(0, '#34d399'); // emerald-400
        gradientGreen.addColorStop(1, '#059669'); // emerald-600

        taskChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'Tugas Diberikan',
                data: [4, 6, 8, 5, 9, tasks.length],
                backgroundColor: gradientBlue,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.65,
              },
              {
                label: 'Tugas Selesai',
                data: [4, 5, 7, 5, 8, completedTasks.length],
                backgroundColor: gradientGreen,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.65,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1100,
              easing: 'easeOutQuart',
              delay: (context: any) =>
                context.type === 'data' && context.mode === 'default'
                  ? context.dataIndex * 85
                  : 0,
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                  boxHeight: 12,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  color: '#64748b',
                  font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(56, 189, 248, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                boxPadding: 6,
                usePointStyle: true,
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11, weight: 'bold' } },
              },
              y: {
                grid: { color: 'rgba(148, 163, 184, 0.12)' },
                ticks: { color: '#64748b', stepSize: 2, font: { size: 11 } },
              },
            },
          },
        });
      }
    }

    // 2. Document categories distribution chart
    if (docChartRef.current) {
      if (docChartInstance.current) {
        docChartInstance.current.destroy();
      }

      const ctx = docChartRef.current.getContext('2d');
      if (ctx) {
        const categoryCounts: Record<string, number> = {};
        documents.forEach((d) => {
          categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
        });

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        docChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels.length ? labels : ['Dokumen'],
            datasets: [
              {
                data: data.length ? data : [1],
                backgroundColor: [
                  '#06b6d4', // cyan-500
                  '#3b82f6', // blue-500
                  '#8b5cf6', // purple-500
                  '#10b981', // emerald-500
                  '#f59e0b', // amber-500
                  '#ec4899', // pink-500
                  '#64748b', // slate-500
                ],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1300,
              easing: 'easeOutCubic',
            },
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  color: '#64748b',
                  font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                boxPadding: 6,
                usePointStyle: true,
              },
            },
            cutout: '72%',
          },
        });
      }
    }

    return () => {
      taskChartInstance.current?.destroy();
      docChartInstance.current?.destroy();
    };
  }, [tasks, documents, completedTasks.length]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-blue-600/30 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-200 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <span>AcademicMerdeka Workspace</span>
            <span>·</span>
            <span>Semester Ganjil 2026</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold">
            Selamat Datang di Hub Akademik, {profile.name}
          </h2>
          <p className="text-xs md:text-sm text-cyan-100/80 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Anda memiliki <span className="text-white font-semibold">{pendingTasks.length} tugas aktif</span>,{' '}
            <span className="text-amber-200 dark:text-amber-300 font-semibold">{approachingDeadlineTasks.length} mendekati deadline</span>, dan{' '}
            <span className="text-cyan-200 dark:text-cyan-300 font-semibold">{todaySchedules.length} mata kuliah</span> pada hari {todayDayName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => onQuickAction('task')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Tambah Tugas</span>
          </button>
          <button
            onClick={() => onQuickAction('doc')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-cyan-200" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => onNavigate('dokumen')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Dokumen</span>
            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {documents.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{storageMB} MB / 1 GB</p>
        </div>

        <div
          onClick={() => onNavigate('tugas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Tugas Bulan Ini</span>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {currentMonthTasks.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Diberikan dosen</p>
        </div>

        <div
          onClick={() => onNavigate('tugas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Tugas Aktif</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {pendingTasks.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Belum diselesaikan</p>
        </div>

        <div
          onClick={() => onNavigate('tugas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Tugas Selesai</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {completedTasks.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{completionRate}% tingkat selesai</p>
        </div>

        <div
          onClick={() => onNavigate('tugas')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Mendekati Deadline</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {approachingDeadlineTasks.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">≤ 7 hari tersisa</p>
        </div>

        <div
          onClick={() => onNavigate('link')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Link</span>
            <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {links.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Repository & portal</p>
        </div>
      </div>

      {/* Progress & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Aktivitas Tugas Bulanan</h3>
              <p className="text-xs text-slate-500">Perbandingan tugas diberikan vs tugas selesai</p>
            </div>
            <button
              onClick={() => onNavigate('statistik')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              Lihat Statistik
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <canvas ref={taskChartRef} />
          </div>
        </div>

        {/* Document Categories Distribution Doughnut */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Distribusi Vault Dokumen</h3>
                <p className="text-xs text-slate-500">Kategori berkas akademik tersimpan (Kapasitas 1 GB)</p>
              </div>
              <button
                onClick={() => onNavigate('dokumen')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                Buka Vault
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-56 flex items-center justify-center">
              <canvas ref={docChartRef} />
            </div>
          </div>

          {/* Completion Rate Meter */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400">Tingkat Penyelesaian Semester</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{completionRate}% Selesai</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Deadlines & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deadline Radar: Closest Tasks */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Deadline Terdekat</h3>
            </div>
            <button
              onClick={() => onNavigate('tugas')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              Semua Tugas ({tasks.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.slice(0, 4).map((task) => {
              const deadlineDate = new Date(task.deadline);
              const diffMs = deadlineDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
              const isOverdue = diffMs < 0;
              const isToday = diffDays === 0;

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Tandai Selesai"
                    >
                      <Check className="w-3 h-3 text-transparent group-hover:text-slate-400" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{task.course}</span>
                        <span>·</span>
                        <span>Dosen: {task.lecturer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          : isToday
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : diffDays <= 7
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isOverdue
                        ? 'Terlambat!'
                        : isToday
                        ? 'Hari Ini'
                        : `${diffDays} hari lagi`}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {task.deadline.replace('T', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}

            {pendingTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                Luar biasa! Semua tugas kuliah sudah diselesaikan.
              </div>
            )}
          </div>
        </div>

        {/* Today's Class Schedule */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Kuliah Hari Ini ({todayDayName})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('jadwal')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                Roster Lengkap
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaySchedules.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {item.course_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.room} · {item.building}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-medium text-cyan-600 dark:text-cyan-300">
                      {item.start_time} - {item.end_time}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                      {item.sks} SKS
                    </span>
                  </div>
                </div>
              ))}

              {todaySchedules.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Tidak ada jadwal kuliah untuk hari ini. Waktunya belajar mandiri atau mengerjakan tugas!
                </div>
              )}
            </div>
          </div>

          {/* Quick Roster Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">Total {schedules.length} Kelas Mingguan</span>
          </div>
        </div>
      </div>

      {/* Recent Document Vault Activity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-lg transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Aktivitas Dokumen Terbaru</h3>
          </div>
          <button
            onClick={() => onNavigate('dokumen')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            Lihat Semua Berkas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {documents.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onNavigate('dokumen')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                  {doc.extension}
                </span>
                <span className="text-[10px]">{(doc.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {doc.name}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{doc.category}</span>
                <span>{doc.upload_date.split('T')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
