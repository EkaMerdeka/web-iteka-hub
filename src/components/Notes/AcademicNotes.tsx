import React, { useState } from 'react';
import {
  FileText,
  Pin,
  Plus,
  Search,
  Copy,
  Download,
  Trash2,
  Tag,
  CheckCircle2,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AcademicNote, ScheduleItem } from '../../types';
import { StorageService } from '../../services/storage';

interface AcademicNotesProps {
  schedules: ScheduleItem[];
  onShowToast: (message: string) => void;
}

export const AcademicNotes: React.FC<AcademicNotesProps> = ({ schedules, onShowToast }) => {
  const [notes, setNotes] = useState<AcademicNote[]>(() => StorageService.getNotes());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Note Form State
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState(
    schedules[0]?.course_name || 'Rekayasa Perangkat Lunak'
  );
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'kuliah' | 'rumus' | 'ujian' | 'tugas' | 'proyek'>('kuliah');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      const matchCat = selectedCategory === 'semua' || n.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.course.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleTogglePin = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, is_pinned: !n.is_pinned, updated_at: new Date().toISOString() } : n
    );
    setNotes(updated);
    StorageService.saveNotes(updated);
    onShowToast('Status pin catatan diperbarui.');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    StorageService.saveNotes(updated);
    onShowToast('Catatan berhasil dihapus.');
  };

  const handleCopyNote = (n: AcademicNote) => {
    navigator.clipboard.writeText(`*${n.title}* (${n.course})\n\n${n.content}`);
    onShowToast('Konten catatan disalin ke clipboard!');
  };

  const handleDownloadMarkdown = (n: AcademicNote) => {
    const md = `# ${n.title}\n**Mata Kuliah:** ${n.course}\n**Kategori:** ${n.category.toUpperCase()}\n**Tanggal:** ${new Date(n.created_at).toLocaleDateString('id-ID')}\n**Tags:** ${n.tags.join(', ')}\n\n---\n\n${n.content}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${n.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('File Markdown berhasil diunduh.');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote: AcademicNote = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      course: course.trim(),
      content: content.trim(),
      category,
      tags: tags.length ? tags : ['Kuliah'],
      is_pinned: isPinned,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    StorageService.saveNotes(updated);

    // Reset Form
    setTitle('');
    setContent('');
    setTagsInput('');
    setIsPinned(false);
    setIsAddModalOpen(false);
    onShowToast('Catatan akademik baru berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Catatan Cepat Kuliah & Ringkasan Materi
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simpan memo ringkas, rumus penting, rumus algoritma, dan catatan dosen per mata kuliah dengan tag terorganisir.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Catatan Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul, materi, atau rumus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['semua', 'kuliah', 'rumus', 'ujian', 'tugas', 'proyek'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              note.is_pinned
                ? 'bg-cyan-500/5 dark:bg-cyan-950/20 border-cyan-500/40 shadow-sm shadow-cyan-500/5'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {note.course}
                </span>

                <button
                  onClick={() => handleTogglePin(note.id)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    note.is_pinned
                      ? 'text-cyan-500 hover:text-cyan-600'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title={note.is_pinned ? 'Lepas Pin' : 'Sematkan ke Atas'}
                >
                  <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                {note.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-sans whitespace-pre-line mb-3">
                {note.content}
              </p>
            </div>

            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">
                  {new Date(note.updated_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyNote(note)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Salin Konten"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadMarkdown(note)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer"
                    title="Unduh Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Buat Catatan Kuliah Baru
              </h2>

              <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Judul Catatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ringkasan Polimorfisme & Pewarisan OOP"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Mata Kuliah
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      {schedules.map((s) => (
                        <option key={s.id} value={s.course_name}>
                          {s.course_name}
                        </option>
                      ))}
                      <option value="Umum & Skripsi">Umum & Skripsi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="kuliah">Materi Kuliah</option>
                      <option value="rumus">Rumus & Notasi</option>
                      <option value="ujian">Review Ujian</option>
                      <option value="tugas">Panduan Tugas</option>
                      <option value="proyek">Catatan Proyek</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Isi Catatan / Ringkasan
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tuliskan poin penting, penjelasan dosen, atau pseudocode..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Tags (pisahkan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="OOP, Inheritance, Java, Exam"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="pinCheckbox" className="text-slate-700 dark:text-slate-300">
                    Sematkan catatan ini di posisi paling atas (Pin)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
