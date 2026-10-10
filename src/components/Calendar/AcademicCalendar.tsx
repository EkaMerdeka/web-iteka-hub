import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Trash2,
  Tag,
} from 'lucide-react';
import { CalendarEvent, Task, ScheduleItem } from '../../types';

interface AcademicCalendarProps {
  events: CalendarEvent[];
  tasks: Task[];
  schedules: ScheduleItem[];
  onSaveEvents: (events: CalendarEvent[]) => void;
  onShowToast: (message: string) => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  events,
  tasks,
  schedules,
  onSaveEvents,
  onShowToast,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // New Event form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('acara_pribadi');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Build grid calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    calendarDays.push({
      dateNumber: d,
      dateString: prevMonthDate.toISOString().split('T')[0],
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateNumber: d,
      dateString: `${year}-${monthStr}-${dayStr}`,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (to complete 42 or 35 slots)
  const remaining = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    calendarDays.push({
      dateNumber: d,
      dateString: nextMonthDate.toISOString().split('T')[0],
      isCurrentMonth: false,
    });
  }

  // Aggregate items for a specific date
  const getItemsForDate = (dateStr: string) => {
    // 1. Calendar custom events
    const dayEvents = events.filter((e) => (e.event_date || e.date) === dateStr);

    // 2. Task deadlines on this date
    const dayTasks = tasks.filter((t) => t.deadline.startsWith(dateStr));

    return { dayEvents, dayTasks };
  };

  const selectedDateItems = getItemsForDate(selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDateStr,
      event_date: selectedDateStr,
      start_time: newStartTime,
      end_time: newEndTime,
      category: newCategory,
      description: newDesc.trim() || undefined,
      color: newColor,
    };

    const updated = [...events, newEv];
    onSaveEvents(updated);
    setIsAddEventModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    onShowToast(`Agenda "${newTitle}" berhasil ditambahkan ke kalender.`);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    onSaveEvents(updated);
    onShowToast('Agenda kalender berhasil dihapus.');
  };

  const categoryLabels: Record<CalendarEvent['category'], string> = {
    deadline: 'Deadline Tugas',
    kuliah: 'Jadwal Kuliah',
    ujian: 'Ujian / UTS / UAS',
    presentasi: 'Presentasi',
    pengumpulan: 'Pengumpulan Proyek',
    acara_pribadi: 'Acara Pribadi',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Academic Calendar · Tahun Akademik 2026</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Kalender Akademik Terpadu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Menghubungkan deadline tugas kuliah, jadwal ujian, presentasi, dan agenda akademik pribadi secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono whitespace-nowrap">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Grid Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800 font-semibold">
            {daysOfWeek.map((d, idx) => (
              <div key={d} className={idx === 0 ? 'text-rose-500 dark:text-rose-400' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {calendarDays.map((cell, idx) => {
              const { dayEvents, dayTasks } = getItemsForDate(cell.dateString);
              const isSelected = cell.dateString === selectedDateStr;
              const isToday =
                cell.dateString === new Date().toISOString().split('T')[0];

              const totalItems = dayEvents.length + dayTasks.length;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateString)}
                  className={`min-h-[75px] md:min-h-[85px] p-2 rounded-xl transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 ring-1 ring-cyan-500/50'
                      : isToday
                      ? 'border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/20'
                      : cell.isCurrentMonth
                      ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      : 'border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/20 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {cell.dateNumber}
                    </span>
                    {totalItems > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 truncate font-mono"
                        title={`Deadline: ${t.title}`}
                      >
                        ⚠️ {t.title}
                      </div>
                    ))}
                    {dayEvents.slice(0, 1).map((e) => (
                      <div
                        key={e.id}
                        className="text-[9px] px-1 py-0.2 rounded truncate font-mono text-cyan-800 dark:text-cyan-200"
                        style={{ backgroundColor: `${e.color}25` }}
                        title={e.title}
                      >
                        • {e.title}
                      </div>
                    ))}
                    {totalItems > 2 && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block">
                        +{totalItems - 2} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda Details Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                  Agenda Tanggal
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Tambah Agenda Tanggal Ini"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {/* Task Deadlines on this date */}
              {selectedDateItems.dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 font-mono text-[10px]">
                    <span className="font-bold">DEADLINE TUGAS</span>
                    <span>{t.deadline.split('T')[1]} WIB</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{t.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{t.course} · Dosen: {t.lecturer}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono uppercase">{t.status.replace('_', ' ')}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-300 font-semibold">{t.priority}</span>
                  </div>
                </div>
              ))}

              {/* Calendar Custom Events on this date */}
              {selectedDateItems.dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1 relative group"
                  style={{ borderLeftWidth: '4px', borderLeftColor: ev.color }}
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400 uppercase font-bold">
                      {categoryLabels[ev.category]}
                    </span>
                    {ev.start_time && (
                      <span>
                        {ev.start_time} - {ev.end_time || ''} WIB
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-200">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{ev.description}</p>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="absolute top-2.5 right-2.5 p-1 rounded text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {selectedDateItems.dayTasks.length === 0 &&
                selectedDateItems.dayEvents.length === 0 && (
                  <div className="py-16 text-center text-xs text-slate-500">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    Tidak ada agenda atau deadline tugas pada tanggal ini.
                  </div>
                )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Zona: Asia/Jakarta (WIB)</span>
            <span>{selectedDateItems.dayTasks.length + selectedDateItems.dayEvents.length} Acara</span>
          </div>
        </div>
      </div>

      {/* ADD AGENDA MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Tambah Agenda Akademik</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
              Tanggal: {selectedDateStr}
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Agenda *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Contoh: Ujian Tengah Semester (UTS) Basis Data"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Agenda</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CalendarEvent['category'])}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ujian" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Ujian (UTS / UAS)</option>
                  <option value="presentasi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Presentasi Proyek</option>
                  <option value="pengumpulan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pengumpulan Tugas / Laporan</option>
                  <option value="kuliah" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Kuliah Pengganti / Seminar</option>
                  <option value="acara_pribadi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Acara Akademik Pribadi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Tambahan</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan materi, ruangan, atau perlengkapan..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Warna Penanda</label>
                <div className="flex items-center gap-2">
                  {['#EF4444', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        newColor === c ? 'ring-2 ring-cyan-500 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
