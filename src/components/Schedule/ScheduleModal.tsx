import React, { useState } from 'react';
import { X, CalendarDays, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { ScheduleItem, DayOfWeek } from '../../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  initialItem?: ScheduleItem | null;
  existingSchedules: ScheduleItem[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  existingSchedules,
}) => {
  if (!isOpen) return null;

  const isEdit = !!initialItem;

  const [courseName, setCourseName] = useState(initialItem?.course_name || '');
  const [lecturer, setLecturer] = useState(initialItem?.lecturer || '');
  const [day, setDay] = useState<DayOfWeek>(initialItem?.day || 'Senin');
  const [startTime, setStartTime] = useState(initialItem?.start_time || '08:00');
  const [endTime, setEndTime] = useState(initialItem?.end_time || '10:30');
  const [room, setRoom] = useState(initialItem?.room || 'Lab Komputer 302');
  const [building, setBuilding] = useState(initialItem?.building || 'Gedung Fasilkom Barat Lt. 3');
  const [color, setColor] = useState(initialItem?.color || '#3B82F6');
  const [sks, setSks] = useState(initialItem?.sks || 3);
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const palette = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

  const checkConflict = (d: DayOfWeek, start: string, end: string) => {
    const overlaps = existingSchedules.filter((s) => {
      if (initialItem && s.id === initialItem.id) return false;
      if (s.day !== d) return false;
      // Overlap logic: (start < s.end && end > s.start)
      return start < s.end_time && end > s.start_time;
    });

    if (overlaps.length > 0) {
      setConflictWarning(
        `Perhatian: Bentrok waktu dengan mata kuliah "${overlaps[0].course_name}" (${overlaps[0].start_time} - ${overlaps[0].end_time}) di hari ${d}.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    checkConflict(day, newStart, newEnd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const saved: ScheduleItem = {
      id: initialItem?.id || `sch-${Date.now()}`,
      course_name: courseName.trim(),
      lecturer: lecturer.trim() || 'Dosen Pengampu',
      day,
      start_time: startTime,
      end_time: endTime,
      room: room.trim(),
      building: building.trim(),
      color,
      sks: Number(sks) || 3,
      notes: notes.trim() || undefined,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan rincian sesi perkuliahan mingguan</p>
          </div>
        </div>

        {conflictWarning && (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>{conflictWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Mata Kuliah *</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
              placeholder="Contoh: Pemrograman Dasar"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Dosen Pengampu</label>
              <input
                type="text"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Contoh: Dr. Ir. Bambang Hermanto, M.T."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hari Kuliah</label>
              <select
                value={day}
                onChange={(e) => {
                  const newDay = e.target.value as DayOfWeek;
                  setDay(newDay);
                  checkConflict(newDay, startTime, endTime);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, endTime)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange(startTime, e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bobot SKS</label>
              <input
                type="number"
                min={1}
                max={6}
                value={sks}
                onChange={(e) => setSks(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Ruangan Kelas / Lab</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Contoh: Lab Komputer 302"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gedung / Lokasi</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="Contoh: Gedung Fasilkom Barat Lt. 3"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Warna Aksen Kartu</label>
            <div className="flex items-center gap-2">
              {palette.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    color === c ? 'ring-2 ring-cyan-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Kuliah</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Bawa laptop, presensi via QR code..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {isEdit ? 'Simpan Jadwal' : 'Tambah Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
