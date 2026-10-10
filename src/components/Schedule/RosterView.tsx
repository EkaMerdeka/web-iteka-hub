import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Printer,
  Download,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  List,
  Grid,
  CheckCircle2,
} from 'lucide-react';
import { ScheduleItem, DayOfWeek } from '../../types';
import { ScheduleModal } from './ScheduleModal';

interface RosterViewProps {
  schedules: ScheduleItem[];
  onSaveSchedules: (schedules: ScheduleItem[]) => void;
  onShowToast: (message: string) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  schedules,
  onSaveSchedules,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Current day and next class detection
  const now = new Date();
  const dayIndex = now.getDay(); // 0 Sun, 1 Mon...
  const todayDayName: DayOfWeek =
    dayIndex >= 1 && dayIndex <= 6 ? days[dayIndex - 1] : 'Senin';

  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const todayClasses = schedules
    .filter((s) => s.day === todayDayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const nextUpcomingClass = todayClasses.find(
    (s) => s.start_time >= currentTimeStr || s.end_time >= currentTimeStr
  );

  // Total SKS calculation
  const totalSks = schedules.reduce((acc, curr) => acc + (curr.sks || 3), 0);

  // Handle save
  const handleSaveItem = (item: ScheduleItem) => {
    const exists = schedules.some((s) => s.id === item.id);
    let updated: ScheduleItem[];
    if (exists) {
      updated = schedules.map((s) => (s.id === item.id ? item : s));
      onShowToast('Jadwal kuliah berhasil diperbarui.');
    } else {
      updated = [...schedules, item];
      onShowToast('Jadwal kuliah baru berhasil ditambahkan.');
    }
    onSaveSchedules(updated);
  };

  // Handle delete
  const handleDeleteItem = (id: string) => {
    if (confirm('Hapus sesi jadwal kuliah ini?')) {
      const updated = schedules.filter((s) => s.id !== id);
      onSaveSchedules(updated);
      onShowToast('Jadwal kuliah berhasil dihapus.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Hari', 'Mata Kuliah', 'Dosen', 'Mulai', 'Selesai', 'Ruangan', 'Gedung', 'SKS', 'Catatan'];
    const rows = schedules.map((s) => [
      s.day,
      `"${s.course_name.replace(/"/g, '""')}"`,
      `"${s.lecturer.replace(/"/g, '""')}"`,
      s.start_time,
      s.end_time,
      `"${s.room.replace(/"/g, '""')}"`,
      `"${s.building.replace(/"/g, '""')}"`,
      s.sks,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Kuliah_AcademicMerdeka_Semester_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Jadwal berhasil diekspor ke CSV.');
  };

  // Export iCalendar (.ics)
  const handleExportICS = () => {
    const dayToByDay: Record<DayOfWeek, string> = {
      Senin: 'MO',
      Selasa: 'TU',
      Rabu: 'WE',
      Kamis: 'TH',
      Jumat: 'FR',
      Sabtu: 'SA',
    };

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AcademicMerdeka//Jadwal Roster//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    schedules.forEach((s) => {
      const startTimeClean = s.start_time.replace(':', '') + '00';
      const endTimeClean = s.end_time.replace(':', '') + '00';
      const byDay = dayToByDay[s.day] || 'MO';

      ics.push(
        'BEGIN:VEVENT',
        `SUMMARY:${s.course_name}`,
        `DESCRIPTION:Dosen: ${s.lecturer} | Catatan: ${s.notes || '-'}`,
        `LOCATION:${s.room}, ${s.building}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
        `DTSTART;TZID=Asia/Jakarta:20260901T${startTimeClean}`,
        `DTEND;TZID=Asia/Jakarta:20260901T${endTimeClean}`,
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');

    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Kuliah_AcademicMerdeka_Calendar.ics`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Jadwal berhasil diekspor ke format kalender iCalendar (.ics).');
  };

  // Print Roster
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Roster · Total {totalSks} SKS ({schedules.length} Kelas)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Jadwal Kuliah Mingguan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau ruang kuliah, nama dosen pengampu, jam perkuliahan, dan pengingat kelas berikutnya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportICS}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor ke Kalender Google / Apple (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Export ICS</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor ke Tabel Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cetak Jadwal Roster"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Next upcoming class alert */}
      {nextUpcomingClass && (
        <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-slate-900 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold block">
                Kelas Hari Ini ({todayDayName}):
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {nextUpcomingClass.course_name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {nextUpcomingClass.start_time} - {nextUpcomingClass.end_time} WIB · {nextUpcomingClass.room} ({nextUpcomingClass.building}) · Dosen: {nextUpcomingClass.lecturer}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-semibold">
            {nextUpcomingClass.sks} SKS
          </span>
        </div>
      )}

      {/* View Switcher: Weekly Grid vs List */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {viewMode === 'weekly' ? 'Tampilan Mingguan (Senin - Sabtu)' : 'Daftar Semua Mata Kuliah'}
        </h3>
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid Mingguan</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar Tabel</span>
          </button>
        </div>
      </div>

      {/* View: WEEKLY GRID */}
      {viewMode === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {days.map((dayName) => {
            const daySchedules = schedules
              .filter((s) => s.day === dayName)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            const isToday = dayName === todayDayName;

            return (
              <div
                key={dayName}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-3.5 min-h-[380px] flex flex-col justify-between transition-all shadow-xs dark:shadow-md ${
                  isToday
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 dark:ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isToday ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-semibold">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {daySchedules.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-3 transition-all relative group"
                        style={{ borderLeftWidth: '4px', borderLeftColor: item.color }}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-300 mb-1">
                          <span>
                            {item.start_time} - {item.end_time}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.sks} SKS</span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                          {item.course_name}
                        </h4>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 space-y-0.5">
                          <p className="flex items-center gap-1 truncate text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.room}</span>
                          </p>
                          <p className="flex items-center gap-1 truncate text-slate-500">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.lecturer}</span>
                          </p>
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-900 line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-2 pt-1 border-t border-slate-200 dark:border-slate-900 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {daySchedules.length === 0 && (
                      <div className="py-12 text-center text-[11px] text-slate-400 dark:text-slate-600">
                        Tidak ada kelas
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 font-mono text-center border-t border-slate-100 dark:border-slate-800/60 mt-3">
                  {daySchedules.length} Sesi Kuliah
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View: LIST TABLE */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Hari</th>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Mata Kuliah</th>
                  <th className="p-3.5">Dosen Pengampu</th>
                  <th className="p-3.5">Ruang & Gedung</th>
                  <th className="p-3.5 text-center">SKS</th>
                  <th className="p-3.5">Catatan</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-700 dark:text-cyan-300">{item.day}</td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.start_time} - {item.end_time}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.course_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{item.lecturer}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      {item.room} <span className="text-slate-400 dark:text-slate-500">· {item.building}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-400">{item.sks}</td>
                    <td className="p-3.5 text-slate-500 italic max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Edit & Create Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
        existingSchedules={schedules}
      />
    </div>
  );
};
