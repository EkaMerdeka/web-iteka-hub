import React, { useState } from 'react';
import {
  Calculator,
  Award,
  TrendingUp,
  GraduationCap,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  ChevronRight,
  Download,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, GpaCourseItem } from '../../types';
import { StorageService } from '../../services/storage';

interface GpaSimulatorProps {
  profile: UserProfile;
  onShowToast: (message: string) => void;
}

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  'A-': 3.75,
  'B+': 3.5,
  B: 3.0,
  'B-': 2.75,
  'C+': 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

export const GpaSimulator: React.FC<GpaSimulatorProps> = ({ profile, onShowToast }) => {
  const [courses, setCourses] = useState<GpaCourseItem[]>(() =>
    StorageService.getGpaCourses()
  );

  const [targetGraduationGpa, setTargetGraduationGpa] = useState<number>(3.9);

  // Modal / inline add course state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSks, setNewSks] = useState<number>(3);
  const [newGrade, setNewGrade] = useState<'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C'>('A');

  // Baseline data from profile
  const completedCredits = profile.credits_completed || 48;
  const currentGpa = 3.88; // profile GPA float
  const targetCredits = profile.credits_target || 144;

  // Calculation for current simulated semester
  const totalSimulatedSks = courses.reduce((sum, c) => sum + c.sks, 0);
  const totalGradePoints = courses.reduce(
    (sum, c) => sum + c.sks * (GRADE_POINTS[c.expected_grade] || 0),
    0
  );

  const simulatedIps = totalSimulatedSks > 0 ? totalGradePoints / totalSimulatedSks : 0;

  // Cumulative projection
  const totalAllCredits = completedCredits + totalSimulatedSks;
  const totalAllPoints = completedCredits * currentGpa + totalGradePoints;
  const projectedCumulativeGpa =
    totalAllCredits > 0 ? totalAllPoints / totalAllCredits : currentGpa;

  const gpaDelta = projectedCumulativeGpa - currentGpa;

  // Remaining graduation credits
  const remainingCredits = Math.max(0, targetCredits - totalAllCredits);

  // Target GPA required grade for remaining semesters
  // formula: targetGraduationGpa * targetCredits = totalAllPoints + (remainingCredits * requiredAvgGrade)
  // requiredAvgGrade = (targetGraduationGpa * targetCredits - totalAllPoints) / remainingCredits
  const requiredGradeRemaining =
    remainingCredits > 0
      ? (targetGraduationGpa * targetCredits - totalAllPoints) / remainingCredits
      : 0;

  const handleGradeChange = (
    id: string,
    grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E'
  ) => {
    const updated = courses.map((c) => (c.id === id ? { ...c, expected_grade: grade } : c));
    setCourses(updated);
    StorageService.saveGpaCourses(updated);
  };

  const handleRemoveCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    StorageService.saveGpaCourses(updated);
    onShowToast('Mata kuliah dihapus dari simulasi.');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCourse: GpaCourseItem = {
      id: `gpa-${Date.now()}`,
      code: newCode.trim().toUpperCase() || `IF${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName.trim(),
      sks: Number(newSks) || 3,
      expected_grade: newGrade,
      semester: 'Semester 3',
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    StorageService.saveGpaCourses(updated);
    setNewName('');
    setNewCode('');
    onShowToast('Mata kuliah baru ditambahkan ke simulasi!');
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('iteka_gpa_courses');
    const defaults = StorageService.getGpaCourses();
    setCourses(defaults);
    onShowToast('Simulasi dikembalikan ke data semester standar.');
  };

  const handleExportPlan = () => {
    const header = 'Kode MK,Nama Mata Kuliah,SKS,Target Nilai,Bobot Angka,Total Mutu\n';
    const rows = courses
      .map(
        (c) =>
          `"${c.code}","${c.name}",${c.sks},"${c.expected_grade}",${GRADE_POINTS[c.expected_grade]},${(
            c.sks * GRADE_POINTS[c.expected_grade]
          ).toFixed(2)}`
      )
      .join('\n');
    const summary = `\n\nTotal SKS Semester,${totalSimulatedSks}\nProyeksi IPS,${simulatedIps.toFixed(
      2
    )}\nProyeksi IPK Kumulatif,${projectedCumulativeGpa.toFixed(2)}`;
    const blob = new Blob([header + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rencana_Studi_Simulasi_IPK_${profile.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('File simulasi rencana studi berhasil diekspor.');
  };

  // Predicate evaluation
  const getPredicate = (gpa: number) => {
    if (gpa >= 3.51) return { title: 'Dengan Pujian (Cum Laude)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (gpa >= 3.0) return { title: 'Sangat Memuaskan', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (gpa >= 2.76) return { title: 'Memuaskan', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    return { title: 'Cukup', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  };

  const currentPred = getPredicate(projectedCumulativeGpa);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kalkulator & Simulator Target IPK
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulasikan nilai mata kuliah semester berjalan, proyeksikan IPK kumulatif, dan rencanakan target predikat kelulusan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExportPlan}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Rencana CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current IPK */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>IPK Saat Ini (Semester 1-2)</span>
            <Award className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {currentGpa.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Terakumulasi dari <span className="font-semibold text-slate-700 dark:text-slate-200">{completedCredits} SKS</span> lulus
          </div>
        </motion.div>

        {/* Simulated IPS */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Proyeksi IPS (Semester Ini)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {simulatedIps.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Total <span className="font-semibold text-slate-700 dark:text-slate-200">{totalSimulatedSks} SKS</span> • Mutu: {totalGradePoints.toFixed(1)}
          </div>
        </motion.div>

        {/* Projected Cumulative GPA */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Proyeksi IPK Baru</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {projectedCumulativeGpa.toFixed(2)}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                gpaDelta >= 0
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {gpaDelta >= 0 ? `+${gpaDelta.toFixed(3)}` : gpaDelta.toFixed(3)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Total SKS kumulatif: <span className="font-semibold text-slate-700 dark:text-slate-200">{totalAllCredits} SKS</span>
          </div>
        </motion.div>

        {/* Target Predicate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Predikat Kelulusan</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${currentPred.color} mt-1`}>
            {currentPred.title}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Sisa <span className="font-semibold text-slate-700 dark:text-slate-200">{remainingCredits} SKS</span> menuju wisuda
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Course Simulator & Graduation Target Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Courses Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mata Kuliah Semester Berjalan (Semester 3)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah target nilai huruf pada tiap mata kuliah untuk melihat perubahan IPK secara instan.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {courses.length} Mata Kuliah
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-semibold">Kode</th>
                  <th className="pb-3 font-semibold">Mata Kuliah</th>
                  <th className="pb-3 font-semibold text-center">SKS</th>
                  <th className="pb-3 font-semibold text-center">Target Nilai</th>
                  <th className="pb-3 font-semibold text-center">Bobot</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {courses.map((c) => {
                  const pts = GRADE_POINTS[c.expected_grade] || 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                        {c.code}
                      </td>
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {c.name}
                      </td>
                      <td className="py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {c.sks}
                      </td>
                      <td className="py-3 text-center">
                        <select
                          value={c.expected_grade}
                          onChange={(e) => handleGradeChange(c.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-lg font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                        >
                          <option value="A">A (4.00)</option>
                          <option value="A-">A- (3.75)</option>
                          <option value="B+">B+ (3.50)</option>
                          <option value="B">B (3.00)</option>
                          <option value="B-">B- (2.75)</option>
                          <option value="C+">C+ (2.50)</option>
                          <option value="C">C (2.00)</option>
                          <option value="D">D (1.00)</option>
                          <option value="E">E (0.00)</option>
                        </select>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {(c.sks * pts).toFixed(1)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRemoveCourse(c.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Hapus mata kuliah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Add Course Form */}
          <form
            onSubmit={handleAddCourse}
            className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
          >
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Kode (mis. IF3108)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="Nama Mata Kuliah Baru"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={newSks}
                onChange={(e) => setNewSks(Number(e.target.value))}
                className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
              >
                <option value={1}>1 SKS</option>
                <option value={2}>2 SKS</option>
                <option value={3}>3 SKS</option>
                <option value={4}>4 SKS</option>
                <option value={6}>6 SKS (Skripsi)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-cyan-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah MK</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Graduation Planner & Scenario Calculator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Kelulusan Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Simulasi Target Kelulusan
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tentukan target IPK kelulusan impian Anda untuk mengetahui standar nilai rata-rata yang harus dijaga pada sisa semester.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Target IPK Akhir
                  </span>
                  <span className="font-mono font-bold text-amber-500 text-sm">
                    {targetGraduationGpa.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="3.00"
                  max="4.00"
                  step="0.05"
                  value={targetGraduationGpa}
                  onChange={(e) => setTargetGraduationGpa(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>3.00</span>
                  <span>3.50 (Cum Laude)</span>
                  <span>4.00</span>
                </div>
              </div>

              {/* Requirement Analysis Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sisa SKS ke Wisuda:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{remainingCredits} SKS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total SKS Terencana:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalAllCredits} / 144 SKS</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Nilai Rata-rata Diperlukan:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      requiredGradeRemaining > 4.0
                        ? 'text-rose-500'
                        : requiredGradeRemaining <= 3.5
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {requiredGradeRemaining > 4.0
                      ? 'Tidak Memungkinkan (>4.0)'
                      : requiredGradeRemaining.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-cyan-500/5 dark:bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400 block mb-0.5">
                  Tips Akademik:
                </span>
                {requiredGradeRemaining <= 3.5 ? (
                  <span>
                    Target sangat realistis! Mempertahankan rata-rata nilai B+ hingga A pada 74 SKS tersisa akan memastikan predikat Cum Laude.
                  </span>
                ) : (
                  <span>
                    Anda perlu konsisten meraih nilai A pada hampir semua mata kuliah lanjutan dan tugas akhir/skripsi.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SKS Completion Progress Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Progres Kelulusan (Kurikulum 144 SKS)
            </h3>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(completedCredits / targetCredits) * 100}%` }}
                  className="bg-cyan-500 h-full"
                  title={`Lulus: ${completedCredits} SKS`}
                />
                <div
                  style={{ width: `${(totalSimulatedSks / targetCredits) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title={`Semester Ini: ${totalSimulatedSks} SKS`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Lulus ({completedCredits} SKS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Sedang Berjalan ({totalSimulatedSks} SKS)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
