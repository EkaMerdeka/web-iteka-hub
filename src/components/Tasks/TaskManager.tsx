import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List as ListIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  MoreVertical,
  Check,
  ChevronDown,
  Paperclip,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../../types';
import { TaskModal } from './TaskModal';

interface TaskManagerProps {
  tasks: Task[];
  onSaveTasks: (tasks: Task[]) => void;
  onShowToast: (message: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onSaveTasks,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPriority, setFilterPriority] = useState('Semua');
  const [sortByDeadline, setSortByDeadline] = useState<'asc' | 'desc'>('asc');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Distinct courses
  const allCourses = ['Semua', ...Array.from(new Set(tasks.map((t) => t.course)))];

  // Helper for deadline status
  const getDeadlineInfo = (deadlineStr: string, status: TaskStatus) => {
    if (status === 'selesai') {
      return {
        text: 'Selesai',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        isOverdue: false,
      };
    }

    const now = new Date();
    const d = new Date(deadlineStr);
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        text: `Terlambat ${overdueDays > 0 ? overdueDays + ' hari' : ''}!`,
        badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold',
        isOverdue: true,
      };
    }

    if (diffDays === 0) {
      return {
        text: 'Jatuh tempo HARI INI',
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold',
        isOverdue: false,
      };
    }

    if (diffDays <= 7) {
      return {
        text: `Mendekati deadline (${diffDays} hari lagi)`,
        badgeClass: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
        isOverdue: false,
      };
    }

    return {
      text: `${diffDays} hari lagi`,
      badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700/60',
      isOverdue: false,
    };
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'mendesak':
        return <span className="text-[10px] font-mono font-bold text-rose-400">Mendesak</span>;
      case 'tinggi':
        return <span className="text-[10px] font-mono text-amber-400 font-medium">Tinggi</span>;
      case 'sedang':
        return <span className="text-[10px] font-mono text-cyan-400">Sedang</span>;
      default:
        return <span className="text-[10px] font-mono text-slate-400">Rendah</span>;
    }
  };

  // Toggle single checklist item
  const handleToggleChecklist = (taskId: string, checklistId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          checklists: t.checklists.map((c) =>
            c.id === checklistId ? { ...c, is_completed: !c.is_completed } : c
          ),
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  // Quick status change
  const handleChangeStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completed_at: newStatus === 'selesai' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });
    onSaveTasks(updated);
    onShowToast(`Status tugas diperbarui ke: ${newStatus.replace('_', ' ')}`);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Hapus tugas ini secara permanen?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      onSaveTasks(updated);
      onShowToast('Tugas berhasil dihapus.');
    }
  };

  // Save from modal
  const handleSaveModal = (savedTask: Task) => {
    const exists = tasks.some((t) => t.id === savedTask.id);
    let updated: Task[];
    if (exists) {
      updated = tasks.map((t) => (t.id === savedTask.id ? savedTask : t));
      onShowToast('Tugas berhasil diperbarui.');
    } else {
      updated = [savedTask, ...tasks];
      onShowToast('Tugas baru berhasil ditambahkan.');
    }
    onSaveTasks(updated);
  };

  // Filter & sort
  const filteredTasks = tasks
    .filter((task) => {
      const matchSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.lecturer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCourse = filterCourse === 'Semua' || task.course === filterCourse;
      const matchStatus = filterStatus === 'Semua' || task.status === filterStatus;
      const matchPriority = filterPriority === 'Semua' || task.priority === filterPriority;

      return matchSearch && matchCourse && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      const da = new Date(a.deadline).getTime();
      const db = new Date(b.deadline).getTime();
      return sortByDeadline === 'asc' ? da - db : db - da;
    });

  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'belum_dikerjakan', label: 'Belum Dikerjakan', color: 'border-slate-700' },
    { id: 'sedang_dikerjakan', label: 'Sedang Dikerjakan', color: 'border-blue-500' },
    { id: 'menunggu_pengumpulan', label: 'Menunggu Pengumpulan', color: 'border-amber-500' },
    { id: 'selesai', label: 'Selesai', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Course Assignments · {tasks.length} Total Tugas</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Manajemen Tugas & Deadline Kuliah
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Pantau progres subtugas, prioritas, lampiran, dan sisa waktu menuju deadline berdasarkan waktu Asia/Jakarta.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul tugas, mata kuliah, nama dosen..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2 text-[11px] text-slate-500">Mata Kuliah:</span>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {allCourses.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2 text-[11px] text-slate-500">Prioritas:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="Semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Semua</option>
                <option value="rendah" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Rendah</option>
                <option value="sedang" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Sedang</option>
                <option value="tinggi" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Tinggi</option>
                <option value="mendesak" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Mendesak</option>
              </select>
            </div>

            <button
              onClick={() => setSortByDeadline(sortByDeadline === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Urutkan Deadline"
            >
              Deadline: {sortByDeadline === 'asc' ? 'Terdekat ↑' : 'Terjauh ↓'}
            </button>

            {/* View Mode */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Kanban Board"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Daftar List"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task View: Kanban or List */}
      {viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 min-h-[500px] flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full border-2 ${col.color}`} />
                    <h3 className="text-xs font-bold text-slate-200">{col.label}</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
                    const completedChecklists = task.checklists.filter((c) => c.is_completed).length;

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 transition-all shadow-md group relative space-y-3"
                      >
                        {/* Header card: Priority and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(task.priority)}
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[110px]">
                              {task.course}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Tugas"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Hapus Tugas"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-100 leading-snug group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Interactive Checklists */}
                        {task.checklists.length > 0 && (
                          <div className="pt-2 border-t border-slate-900 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Checklist Subtugas</span>
                              <span className="font-mono">
                                {completedChecklists}/{task.checklists.length}
                              </span>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {task.checklists.map((chk) => (
                                <div
                                  key={chk.id}
                                  onClick={() => handleToggleChecklist(task.id, chk.id)}
                                  className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white transition-colors"
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                      chk.is_completed
                                        ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                                        : 'border-slate-700 bg-slate-900'
                                    }`}
                                  >
                                    {chk.is_completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`truncate ${
                                      chk.is_completed ? 'line-through text-slate-500' : ''
                                    }`}
                                  >
                                    {chk.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deadline status badge */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${deadlineInfo.badgeClass}`}>
                            {deadlineInfo.text}
                          </span>

                          {/* Quick status dropdown selector */}
                          <select
                            value={task.status}
                            onChange={(e) => handleChangeStatus(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                          >
                            <option value="belum_dikerjakan">Belum</option>
                            <option value="sedang_dikerjakan">Sedang</option>
                            <option value="menunggu_pengumpulan">Menunggu</option>
                            <option value="selesai">Selesai</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-600">
                      Tidak ada tugas di kolom ini.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3.5 w-10 text-center">Status</th>
                  <th className="p-3.5">Judul Tugas & Mata Kuliah</th>
                  <th className="p-3.5">Prioritas</th>
                  <th className="p-3.5">Dosen</th>
                  <th className="p-3.5">Subtugas</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((task) => {
                  const deadlineInfo = getDeadlineInfo(task.deadline, task.status);
                  const completedChecklists = task.checklists.filter((c) => c.is_completed).length;

                  return (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() =>
                            handleChangeStatus(
                              task.id,
                              task.status === 'selesai' ? 'belum_dikerjakan' : 'selesai'
                            )
                          }
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors mx-auto cursor-pointer ${
                            task.status === 'selesai'
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-700 bg-slate-950 hover:border-slate-500'
                          }`}
                          title={task.status === 'selesai' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                        >
                          {task.status === 'selesai' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div>
                          <span
                            className={`font-semibold text-slate-200 block ${
                              task.status === 'selesai' ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {task.course} · Diberikan: {task.given_date}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">{getPriorityBadge(task.priority)}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{task.lecturer}</td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {completedChecklists}/{task.checklists.length}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${deadlineInfo.badgeClass}`}>
                          {deadlineInfo.text}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          {task.deadline.replace('T', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialTask={editingTask}
      />
    </div>
  );
};
