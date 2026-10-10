import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  Paperclip,
  Link2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Task, Priority, TaskStatus, TaskChecklist } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  if (!isOpen) return null;

  const isEdit = !!initialTask;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [course, setCourse] = useState(initialTask?.course || 'Pemrograman Dasar');
  const [lecturer, setLecturer] = useState(initialTask?.lecturer || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [givenDate, setGivenDate] = useState(
    initialTask?.given_date || new Date().toISOString().split('T')[0]
  );
  
  // Default deadline: 7 days from now at 23:59
  const defaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return `${d.toISOString().split('T')[0]}T23:59`;
  };

  const [deadline, setDeadline] = useState(initialTask?.deadline || defaultDeadline());
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'sedang');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'belum_dikerjakan');
  const [referenceLink, setReferenceLink] = useState(initialTask?.reference_link || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  
  // Checklists
  const [checklists, setChecklists] = useState<TaskChecklist[]>(
    initialTask?.checklists || [
      { id: 'c1', title: 'Baca instruksi dan spesifikasi tugas', is_completed: false },
      { id: 'c2', title: 'Kerjakan draft awal / implementasi coding', is_completed: false },
      { id: 'c3', title: 'Review dan submit ke portal pengumpulan', is_completed: false },
    ]
  );
  const [newChecklistText, setNewChecklistText] = useState('');

  const coursesList = [
    'Pemrograman Dasar',
    'Sistem Basis Data',
    'Jaringan Komputer',
    'Struktur Data & Algoritma',
    'Kecerdasan Buatan',
    'Etika Profesi & Hukum Cyber',
    'Rekayasa Perangkat Lunak',
    'Matematika Diskrit',
  ];

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists([
      ...checklists,
      { id: `chk-${Date.now()}`, title: newChecklistText.trim(), is_completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklists(checklists.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedTask: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      course: course.trim(),
      lecturer: lecturer.trim() || 'Dosen Pengampu',
      description: description.trim(),
      given_date: givenDate,
      deadline,
      priority,
      status,
      attachments: initialTask?.attachments || [],
      reference_link: referenceLink.trim() || undefined,
      notes: notes.trim() || undefined,
      checklists,
      completed_at: status === 'selesai' ? initialTask?.completed_at || new Date().toISOString() : undefined,
      created_at: initialTask?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah Baru'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Atur rincian tugas, checklist dan deadline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Tugas *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Membuat Program Kasir Mini Market Berbasis OOP"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
              <input
                type="text"
                list="courses-options"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                placeholder="Pilih atau ketik mata kuliah"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <datalist id="courses-options">
                {coursesList.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Dosen</label>
              <input
                type="text"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Contoh: Dr. Ir. Bambang Hermanto, M.T."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Diberikan</label>
              <input
                type="date"
                value={givenDate}
                onChange={(e) => setGivenDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deadline (Asia/Jakarta) *
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="rendah" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Rendah</option>
                <option value="sedang" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sedang</option>
                <option value="tinggi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Tinggi</option>
                <option value="mendesak" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Mendesak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Pengerjaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="belum_dikerjakan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Belum Dikerjakan</option>
                <option value="sedang_dikerjakan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sedang Dikerjakan</option>
                <option value="menunggu_pengumpulan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Menunggu Pengumpulan</option>
                <option value="selesai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Tugas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jelaskan kebutuhan tugas, batasan, fitur yang harus dibuat..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Link Referensi / Link Pengumpulan
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://classroom.google.com/... atau https://github.com/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Pribadi</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (contoh: format pengumpulan ZIP nama_NIM.zip)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Subtask Checklists Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2">
              Checklist Subtugas ({checklists.filter((c) => c.is_completed).length}/{checklists.length})
            </label>

            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {checklists.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs"
                >
                  <span className={c.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-300'}>
                    {c.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(c.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Tambahkan langkah pengerjaan..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {isEdit ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
