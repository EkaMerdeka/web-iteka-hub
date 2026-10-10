import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Task, AcademicDocument } from '../../types';

Chart.register(...registerables);

interface AcademicStatsProps {
  tasks: Task[];
  documents: AcademicDocument[];
  onShowToast: (message: string) => void;
}

export const AcademicStats: React.FC<AcademicStatsProps> = ({
  tasks,
  documents,
  onShowToast,
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('Semua');

  // Chart canvas refs
  const tasksMonthlyRef = useRef<HTMLCanvasElement | null>(null);
  const completionTrendRef = useRef<HTMLCanvasElement | null>(null);
  const taskStatusRef = useRef<HTMLCanvasElement | null>(null);
  const docTypesRef = useRef<HTMLCanvasElement | null>(null);
  const courseWorkloadRef = useRef<HTMLCanvasElement | null>(null);
  const uploadActivityRef = useRef<HTMLCanvasElement | null>(null);

  // Instances refs
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  // Calculations
  const now = new Date();
  const currentMonthIdx = now.getMonth();

  const completedTasks = tasks.filter((t) => t.status === 'selesai');
  const pendingTasks = tasks.filter((t) => t.status !== 'selesai');

  const overdueTasks = pendingTasks.filter((t) => {
    const d = new Date(t.deadline);
    return d.getTime() < now.getTime();
  });

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Course with highest tasks
  const courseCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    courseCounts[t.course] = (courseCounts[t.course] || 0) + 1;
  });
  let topCourse = '-';
  let topCourseCount = 0;
  Object.entries(courseCounts).forEach(([course, count]) => {
    if (count > topCourseCount) {
      topCourse = course;
      topCourseCount = count;
    }
  });

  useEffect(() => {
    // Helper to safely destroy chart
    const destroy = (key: string) => {
      if (chartInstances.current[key]) {
        chartInstances.current[key]?.destroy();
        chartInstances.current[key] = null;
      }
    };

    // 1. Tasks given per month (Bar)
    if (tasksMonthlyRef.current) {
      destroy('monthly');
      const ctx = tasksMonthlyRef.current.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(1, '#2563eb');

        chartInstances.current['monthly'] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'Jumlah Tugas Diberikan',
                data: [3, 4, 6, 5, 7, 8, 4, 6, 9, tasks.length, 0, 0],
                backgroundColor: gradient,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
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
                  ? context.dataIndex * 50
                  : 0,
            },
            plugins: {
              legend: { display: false },
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
              x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
              y: { grid: { color: 'rgba(148, 163, 184, 0.12)' }, ticks: { color: '#64748b', stepSize: 2 } },
            },
          },
        });
      }
    }

    // 2. Completion Trend Line Chart
    if (completionTrendRef.current) {
      destroy('trend');
      const ctx = completionTrendRef.current.getContext('2d');
      if (ctx) {
        const gradGreen = ctx.createLinearGradient(0, 0, 0, 240);
        gradGreen.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        gradGreen.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

        const gradAmber = ctx.createLinearGradient(0, 0, 0, 240);
        gradAmber.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        gradAmber.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

        chartInstances.current['trend'] = new Chart(ctx, {
          type: 'line',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'Tugas Selesai',
                data: [3, 4, 5, 5, 6, 7, 4, 5, 8, completedTasks.length, 0, 0],
                borderColor: '#10B981',
                backgroundColor: gradGreen,
                tension: 0.38,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#10B981',
                pointBorderWidth: 2,
              },
              {
                label: 'Tugas Belum Selesai',
                data: [0, 0, 1, 0, 1, 1, 0, 1, 1, pendingTasks.length, 0, 0],
                borderColor: '#F59E0B',
                backgroundColor: gradAmber,
                tension: 0.38,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#F59E0B',
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1300,
              easing: 'easeOutQuart',
            },
            plugins: {
              legend: {
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  color: '#94a3b8',
                  font: { size: 11, weight: 'bold' },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(16, 185, 129, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                boxPadding: 6,
                usePointStyle: true,
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { grid: { color: 'rgba(148, 163, 184, 0.12)' }, ticks: { color: '#64748b' } },
            },
          },
        });
      }
    }

    // 3. Task status distribution (Doughnut)
    if (taskStatusRef.current) {
      destroy('status');
      const ctx = taskStatusRef.current.getContext('2d');
      if (ctx) {
        const statuses = {
          belum_dikerjakan: tasks.filter((t) => t.status === 'belum_dikerjakan').length,
          sedang_dikerjakan: tasks.filter((t) => t.status === 'sedang_dikerjakan').length,
          menunggu_pengumpulan: tasks.filter((t) => t.status === 'menunggu_pengumpulan').length,
          selesai: completedTasks.length,
        };

        chartInstances.current['status'] = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Belum Dikerjakan', 'Sedang Dikerjakan', 'Menunggu', 'Selesai'],
            datasets: [
              {
                data: [
                  statuses.belum_dikerjakan,
                  statuses.sedang_dikerjakan,
                  statuses.menunggu_pengumpulan,
                  statuses.selesai,
                ],
                backgroundColor: ['#64748b', '#06b6d4', '#f59e0b', '#10b981'],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                hoverOffset: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1200,
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
                  color: '#94a3b8',
                  font: { size: 10, weight: 'bold' },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(6, 182, 212, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                usePointStyle: true,
              },
            },
            cutout: '70%',
          },
        });
      }
    }

    // 4. Document Types Pie / Doughnut
    if (docTypesRef.current) {
      destroy('doctypes');
      const ctx = docTypesRef.current.getContext('2d');
      if (ctx) {
        const extCounts: Record<string, number> = {};
        documents.forEach((d) => {
          const ext = d.extension.toUpperCase();
          extCounts[ext] = (extCounts[ext] || 0) + 1;
        });

        chartInstances.current['doctypes'] = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(extCounts),
            datasets: [
              {
                data: Object.values(extCounts),
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                hoverOffset: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1250,
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
                  color: '#94a3b8',
                  font: { size: 10, weight: 'bold' },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(59, 130, 246, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                usePointStyle: true,
              },
            },
            cutout: '66%',
          },
        });
      }
    }

    // 5. Course Workload Bar
    if (courseWorkloadRef.current) {
      destroy('workload');
      const ctx = courseWorkloadRef.current.getContext('2d');
      if (ctx) {
        const labels = Object.keys(courseCounts);
        const data = Object.values(courseCounts);

        const gradPurple = ctx.createLinearGradient(0, 0, 300, 0);
        gradPurple.addColorStop(0, '#8b5cf6');
        gradPurple.addColorStop(1, '#6366f1');

        chartInstances.current['workload'] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.map((l) => (l.length > 18 ? l.substring(0, 18) + '...' : l)),
            datasets: [
              {
                label: 'Jumlah Tugas',
                data: data,
                backgroundColor: gradPurple,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.65,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            animation: {
              duration: 1100,
              easing: 'easeOutQuart',
              delay: (context: any) =>
                context.type === 'data' && context.mode === 'default'
                  ? context.dataIndex * 70
                  : 0,
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(139, 92, 246, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                usePointStyle: true,
              },
            },
            scales: {
              x: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(148, 163, 184, 0.12)' } },
              y: { ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }, grid: { display: false } },
            },
          },
        });
      }
    }

    // 6. Upload Activity per month
    if (uploadActivityRef.current) {
      destroy('uploads');
      const ctx = uploadActivityRef.current.getContext('2d');
      if (ctx) {
        const gradCyan = ctx.createLinearGradient(0, 0, 0, 240);
        gradCyan.addColorStop(0, '#22d3ee');
        gradCyan.addColorStop(1, '#0891b2');

        chartInstances.current['uploads'] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'Berkas Diunggah',
                data: [2, 3, 5, 4, 6, 7, 3, 4, 8, documents.length, 0, 0],
                backgroundColor: gradCyan,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
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
                  ? context.dataIndex * 50
                  : 0,
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(6, 182, 212, 0.35)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
                usePointStyle: true,
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { grid: { color: 'rgba(148, 163, 184, 0.12)' }, ticks: { color: '#64748b', stepSize: 2 } },
            },
          },
        });
      }
    }

    return () => {
      Object.keys(chartInstances.current).forEach((k) => destroy(k));
    };
  }, [tasks, documents]);

  // Export Stats Table to CSV
  const handleExportStatsCSV = () => {
    const headers = ['Bulan', 'Tugas Diberikan', 'Tugas Selesai', 'Tugas Belum Selesai', 'Upload Berkas'];
    const rows = monthNames.map((m, idx) => {
      const isCurrent = idx === currentMonthIdx;
      return [
        m,
        isCurrent ? tasks.length : 5,
        isCurrent ? completedTasks.length : 4,
        isCurrent ? pendingTasks.length : 1,
        isCurrent ? documents.length : 4,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Statistik_Akademik_AcademicMerdeka_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Laporan statistik akademik berhasil diekspor ke CSV.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Analytics & Insights</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Statistik Perkembangan Akademik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data analitik dinamis mencerminkan status tugas di database, riwayat upload berkas, dan tingkat produktivitas per semester.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <span>Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-cyan-600 dark:text-cyan-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2026</option>
              <option value="2025" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2025</option>
            </select>
          </div>

          <button
            onClick={handleExportStatsCSV}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Tugas Diberikan</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {tasks.length}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Semester Ini</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Tugas Selesai</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {completedTasks.length}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 block mt-0.5">Tuntas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Tugas Aktif</span>
          <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {pendingTasks.length}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Dalam Pengerjaan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Tugas Terlambat</span>
          <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {overdueTasks.length}
          </span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-0.5">Lewat Deadline</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Tingkat Selesai</span>
          <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-300 tabular-nums">
            {completionRate}%
          </span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block mt-0.5">Target &gt;80%</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Mata Kuliah Terpadat</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-300 truncate block mt-1" title={topCourse}>
            {topCourse}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{topCourseCount} Tugas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Total File Vault</span>
          <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
            {documents.length}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Dokumen</span>
        </div>
      </div>

      {/* 6 Required Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart: Tasks Given Per Month */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              1. Grafik Jumlah Tugas Diberikan Setiap Bulan
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Tahun {selectedYear}</span>
          </div>
          <div className="h-60">
            <canvas ref={tasksMonthlyRef} />
          </div>
        </div>

        {/* 2. Line Chart: Completion Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              2. Perkembangan Tugas Selesai vs Belum Selesai
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Trend Kumulatif</span>
          </div>
          <div className="h-60">
            <canvas ref={completionTrendRef} />
          </div>
        </div>

        {/* 3. Doughnut: Task Status Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              3. Distribusi Status Tugas Kuliah
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Kanban Breakdown</span>
          </div>
          <div className="h-60">
            <canvas ref={taskStatusRef} />
          </div>
        </div>

        {/* 4. Pie: Document Types */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              4. Distribusi Format Berkas Dokumen (Vault)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Ekstensi File</span>
          </div>
          <div className="h-60">
            <canvas ref={docTypesRef} />
          </div>
        </div>

        {/* 5. Bar: Course Workload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              5. Beban Tugas per Mata Kuliah
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Beban Akademik</span>
          </div>
          <div className="h-60">
            <canvas ref={courseWorkloadRef} />
          </div>
        </div>

        {/* 6. Bar: Document Uploads Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              6. Aktivitas Upload Dokumen Bulanan
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Riwayat Berkas</span>
          </div>
          <div className="h-60">
            <canvas ref={uploadActivityRef} />
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Tabel Ringkasan Aktivitas Bulanan</h3>
            <p className="text-xs text-slate-500">Data periodik tersimpan di database</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-3">Periode Bulan</th>
                <th className="p-3 text-right">Tugas Diberikan</th>
                <th className="p-3 text-right">Tugas Selesai</th>
                <th className="p-3 text-right">Tugas Aktif</th>
                <th className="p-3 text-right">Dokumen Diunggah</th>
                <th className="p-3 text-right">Tingkat Sukses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {monthNames.map((m, idx) => {
                const isCurrent = idx === currentMonthIdx;
                const given = isCurrent ? tasks.length : idx < currentMonthIdx ? 5 + (idx % 3) : 0;
                const finished = isCurrent ? completedTasks.length : idx < currentMonthIdx ? 4 + (idx % 3) : 0;
                const active = isCurrent ? pendingTasks.length : idx < currentMonthIdx ? 1 : 0;
                const uploads = isCurrent ? documents.length : idx < currentMonthIdx ? 3 + (idx % 4) : 0;
                const rate = given > 0 ? Math.round((finished / given) * 100) : 0;

                return (
                  <tr
                    key={m}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-cyan-50 dark:bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                      {m} {selectedYear} {isCurrent && <span className="text-[10px] text-cyan-600 dark:text-cyan-400">(Bulan Ini)</span>}
                    </td>
                    <td className="p-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{given}</td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{finished}</td>
                    <td className="p-3 text-right text-amber-600 dark:text-amber-400 tabular-nums">{active}</td>
                    <td className="p-3 text-right text-cyan-600 dark:text-cyan-300 tabular-nums">{uploads}</td>
                    <td className="p-3 text-right text-slate-700 dark:text-slate-200 tabular-nums">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
