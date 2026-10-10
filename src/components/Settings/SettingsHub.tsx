import React, { useState } from 'react';
import {
  Settings,
  Database,
  Server,
  Download,
  Copy,
  Check,
  KeyRound,
  FileCode,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  FolderDown,
  ExternalLink,
  Layers,
  Terminal,
} from 'lucide-react';
import { SCHEMA_SQL, PHP_PROJECT_FILES } from '../../services/xamppCodebase';
import { StorageService } from '../../services/storage';

interface SettingsHubProps {
  onOpenChangePassword: () => void;
  onResetFactoryData: () => void;
  onShowToast: (message: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onTriggerEntrancePreview?: () => void;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({
  onOpenChangePassword,
  onResetFactoryData,
  onShowToast,
  isDark,
  onToggleTheme,
  onTriggerEntrancePreview,
}) => {
  const [activeTab, setActiveTab] = useState<'xampp' | 'files' | 'guides' | 'system'>('xampp');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Copy SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    onShowToast('Skrip MySQL schema.sql berhasil disalin!');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Download SQL file
  const handleDownloadSql = () => {
    const blob = new Blob([SCHEMA_SQL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('File schema.sql berhasil diunduh untuk diimpor ke phpMyAdmin.');
  };

  // Copy selected PHP file
  const handleCopyPhpFile = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    onShowToast(`File ${PHP_PROJECT_FILES[selectedFileIndex].path} disalin!`);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Download single PHP file
  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.split('/').pop() || 'file.php';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`File ${fileName} berhasil diunduh.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <Server className="w-3.5 h-3.5" />
            <span>Architecture & Deployment Center</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pengaturan & Ekspor XAMPP / PHP 8.2+
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Paket lengkap kode sumber PHP 8.2+ murni, skrip database MySQL <code className="text-cyan-600 dark:text-cyan-300 font-mono">schema.sql</code>, konfigurasi Apache, dan panduan instalasi lokal di XAMPP serta deploy ke hosting sungguhan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSql}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh schema.sql</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('xampp')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'xampp'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database MySQL & schema.sql</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'files'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Source Code PHP 8.2+ Backend</span>
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'guides'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Panduan XAMPP & Deploy Hosting</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Akun & Sistem</span>
        </button>
      </div>

      {/* TAB 1: DATABASE MYSQL & SCHEMA.SQL */}
      {activeTab === 'xampp' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Skrip SQL Relasional Penuh (schema.sql)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Termasuk tabel users (kredensial akun dengan bcrypt hash), foreign key cascades, dan data awal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={handleDownloadSql}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sql</span>
                </button>
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[500px]">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                {SCHEMA_SQL}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE CODE PHP 8.2+ BACKEND */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Explorer (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl space-y-2 transition-colors">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-2 pb-2 border-b border-slate-200 dark:border-slate-800 font-mono">
              Berkas Proyek PHP & Apache
            </h3>
            <div className="space-y-1 max-h-[550px] overflow-y-auto">
              {PHP_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex flex-col ${
                    selectedFileIndex === idx
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono text-slate-900 dark:text-slate-200 truncate">{file.path}</span>
                  <span className="text-[10px] text-slate-500 truncate mt-0.5">
                    {file.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Content Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div>
                  <h4 className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">
                    {PHP_PROJECT_FILES[selectedFileIndex].path}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {PHP_PROJECT_FILES[selectedFileIndex].description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPhpFile(PHP_PROJECT_FILES[selectedFileIndex].content)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedFile ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedFile ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadFile(
                        PHP_PROJECT_FILES[selectedFileIndex].path,
                        PHP_PROJECT_FILES[selectedFileIndex].content
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[480px]">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                  {PHP_PROJECT_FILES[selectedFileIndex].content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEP-BY-STEP GUIDES (XAMPP & HOSTING) */}
      {activeTab === 'guides' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: XAMPP Localhost */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                <Terminal className="w-4 h-4" />
                <span>1. Langkah Instalasi di Localhost XAMPP</span>
              </div>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Jalankan aplikasi <strong>XAMPP Control Panel</strong>, lalu klik <strong>Start</strong> pada modul <strong>Apache</strong> dan <strong>MySQL</strong>.
                </li>
                <li>
                  Buat folder baru bernama <code className="text-cyan-700 dark:text-cyan-300 font-mono">academic-merdeka</code> di dalam direktori:
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-1 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                    Windows: C:\xampp\htdocs\academic-merdeka\<br />
                    macOS: /Applications/XAMPP/xamppfiles/htdocs/academic-merdeka/
                  </div>
                </li>
                <li>
                  Salin semua file PHP dan folder dari bundle kode di tab <strong>Source Code PHP</strong> ke dalam folder tersebut.
                </li>
                <li>
                  Buka browser ke <code className="text-cyan-700 dark:text-cyan-300 font-mono">http://localhost/phpmyadmin</code>.
                </li>
                <li>
                  Buat database baru bernama <code className="text-cyan-700 dark:text-cyan-300 font-mono">academic_merdeka</code> (Collation: <code className="text-slate-500 font-mono">utf8mb4_unicode_ci</code>).
                </li>
                <li>
                  Klik tab <strong>Import</strong> dan pilih file <code className="text-cyan-700 dark:text-cyan-300 font-mono">schema.sql</code>, lalu klik <strong>Kirim (Go)</strong>.
                </li>
                <li>
                  Buka browser ke <code className="text-cyan-700 dark:text-cyan-300 font-mono">http://localhost/academic-merdeka/</code> untuk login!
                </li>
              </ol>
            </div>

            {/* Guide 2: Credentials & Troubleshooting */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>2. Kredensial & Mengatasi Error Umum</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 leading-relaxed">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="semibold text-slate-800 dark:text-slate-200 block mb-0.5">Kredensial Login:</span>
                  <span className="text-slate-600 dark:text-slate-400">Silakan gunakan username dan password pribadi Anda yang telah disetel.</span>
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Error: Port 3306 MySQL Bentrok</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jika MySQL gagal start, pastikan service MySQL Windows dinonaktifkan atau ubah port ke 3307 di XAMPP <code className="text-slate-600 dark:text-slate-300 font-mono">my.ini</code> dan sesuaikan di <code className="text-slate-600 dark:text-slate-300 font-mono">config/database.php</code>.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Error: File Upload Terlalu Besar</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buka <code className="text-slate-600 dark:text-slate-300 font-mono">php.ini</code> di XAMPP, ubah <code className="text-cyan-600 dark:text-cyan-300 font-mono">upload_max_filesize = 64M</code> dan <code className="text-cyan-600 dark:text-cyan-300 font-mono">post_max_size = 64M</code>, lalu restart Apache.
                  </p>
                </div>
              </div>
            </div>

            {/* Guide 3: Backup & Restore */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Perintah Backup & Pemulihan Database</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                <p>Jalankan perintah ini di Command Prompt / Terminal:</p>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-300 space-y-1">
                  <p># Backup Database</p>
                  <p>mysqldump -u root -p academic_merdeka &gt; backup.sql</p>
                  <p className="mt-2 text-slate-400"># Restore Database</p>
                  <p>mysql -u root -p academic_merdeka &lt; backup.sql</p>
                </div>
              </div>
            </div>

            {/* Guide 4: Deployment to Shared Hosting */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <ExternalLink className="w-4 h-4" />
                <span>4. Deploy ke Hosting (cPanel / Niagahoster)</span>
              </div>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Buka cPanel hosting Anda -&gt; pilih <strong>MySQL Databases</strong>.</li>
                <li>Buat database dan user baru, lalu berikan <strong>ALL PRIVILEGES</strong>.</li>
                <li>Import <code className="text-cyan-600 dark:text-cyan-300 font-mono">schema.sql</code> melalui phpMyAdmin cPanel.</li>
                <li>Kompres seluruh file proyek ke format <code className="text-cyan-600 dark:text-cyan-300 font-mono">.zip</code> dan upload ke <code className="text-slate-600 dark:text-slate-300 font-mono">public_html</code>.</li>
                <li>Sesuaikan nama DB, user, dan password di <code className="text-cyan-600 dark:text-cyan-300 font-mono">config/database.php</code>.</li>
                <li>Pastikan folder <code className="text-cyan-600 dark:text-cyan-300 font-mono">storage/uploads</code> berstatus izin <strong>755</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM SETTINGS */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 max-w-2xl transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800">
            Pengaturan Akun & Keamanan Sesi
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Kata Sandi Akun</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ganti password sistem untuk keamanan tambahan.
                </span>
              </div>
              <button
                onClick={onOpenChangePassword}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Ganti Password
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Tema Tampilan</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Beralih dengan mulus antara Mode Gelap dan Mode Terang.
                </span>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {isDark ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
              </button>
            </div>

            {onTriggerEntrancePreview && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Animasi Sambutan Masuk</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Putar kembali animasi transisi login dan verifikasi workspace.
                  </span>
                </div>
                <button
                  onClick={onTriggerEntrancePreview}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all shadow-md shadow-cyan-600/20 cursor-pointer shrink-0"
                >
                  Uji Animasi Masuk
                </button>
              </div>
            )}

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Zona Waktu Sistem</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Semua kalkulasi deadline dan pengingat disetel ke Asia/Jakarta (WIB).
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                Asia/Jakarta
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">Reset Data Demo Awal</span>
                <span className="text-[11px] text-slate-500">
                  Kembalikan semua tugas, berkas, jadwal, dan tautan ke status awal bawaan.
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Kembalikan semua data ke setelan demo awal?')) {
                    onResetFactoryData();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 rounded-lg transition-colors cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
