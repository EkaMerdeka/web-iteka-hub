import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckSquare, Calendar, Link2, X, ArrowRight } from 'lucide-react';
import { Task, AcademicDocument, ScheduleItem, SavedLink } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  documents: AcademicDocument[];
  schedules: ScheduleItem[];
  links: SavedLink[];
  onSelectView: (viewName: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  documents,
  schedules,
  links,
  onSelectView,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.course.toLowerCase().includes(q) ||
          t.lecturer.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    : [];

  const filteredDocs = q
    ? documents.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          (d.course_name && d.course_name.toLowerCase().includes(q))
      )
    : [];

  const filteredSchedules = q
    ? schedules.filter(
        (s) =>
          s.course_name.toLowerCase().includes(q) ||
          s.lecturer.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          s.day.toLowerCase().includes(q)
      )
    : [];

  const filteredLinks = q
    ? links.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.platform.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    filteredTasks.length + filteredDocs.length + filteredSchedules.length + filteredLinks.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tugas, dokumen, jadwal kuliah, link..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-10 text-center text-sm text-slate-500">
              <p>Ketik kata kunci untuk mencari di seluruh AcademicMerdeka.</p>
              <p className="text-xs text-slate-400 mt-2 font-mono">Tip: Coba cari "Basis Data", "Pemrograman", atau "PDF"</p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada hasil yang cocok dengan "<span className="text-cyan-600 dark:text-cyan-300 font-semibold">{query}</span>"
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Tugas Kuliah ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectView('tugas');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{t.course}</span>
                        <span>·</span>
                        <span>Deadline: {t.deadline.replace('T', ' ')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dokumen & Vault ({filteredDocs.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDocs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectView('dokumen');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{d.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{d.category}</span>
                        <span>·</span>
                        <span className="font-mono uppercase">{d.extension}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredSchedules.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>Jadwal Kuliah ({filteredSchedules.length})</span>
              </div>
              <div className="space-y-1">
                {filteredSchedules.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectView('jadwal');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{s.course_name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{s.day} {s.start_time} - {s.end_time}</span>
                        <span>·</span>
                        <span>{s.room}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Link2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Link Tersimpan ({filteredLinks.length})</span>
              </div>
              <div className="space-y-1">
                {filteredLinks.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      onSelectView('link');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{l.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{l.platform}</span>
                        <span>·</span>
                        <span className="truncate max-w-xs">{l.url}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">ESC</kbd> untuk menutup</span>
          <span>AcademicMerdeka Search</span>
        </div>
      </div>
    </div>
  );
};
