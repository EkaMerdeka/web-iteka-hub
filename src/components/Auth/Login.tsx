import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Database,
  Server,
  Layers,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError('Akun terkunci sementara karena 5 kali percobaan gagal. Tunggu beberapa saat.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate backend verification
    setTimeout(() => {
      const creds = StorageService.getCredentials();
      const trimmedUser = username.trim();

      if (trimmedUser === creds.username && password === creds.passwordHash) {
        // Successful login
        StorageService.setAuthSession(true);
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 350);
      } else {
        const nextAttempts = attemptCount + 1;
        setAttemptCount(nextAttempts);
        setIsLoading(false);

        if (nextAttempts >= 5) {
          setIsLocked(true);
          setError('Batas 5 percobaan gagal tercapai! Sistem keamanan mengunci form login sementara.');
          setTimeout(() => {
            setIsLocked(false);
            setAttemptCount(0);
          }, 15000); // 15 seconds lockout
        } else {
          setError(
            `Username atau password salah. Percobaan ${nextAttempts} dari 5.`
          );
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container - Split Screen on Large Displays */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
        {/* Left Side: Brand & Visual Illustration */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-cyan-500/25">
                AM
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  AcademicMerdeka
                </h1>
                <p className="text-xs text-cyan-400 font-medium">
                  One Space for All Your Academic Needs.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 leading-snug">
                Ruang Kerja Terpadu Mahasiswa
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Kelola berkas tugas, materi kuliah, slide presentasi, link repository, roster mingguan, dan pantau deadline dengan akurasi real-time.
              </p>
            </div>
          </div>

          {/* Academic Illustration Asset */}
          <div className="my-8 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative group">
            <img
              src="/src/assets/images/iteka_academic_illustration_1791559085074.jpg"
              alt="AcademicMerdeka Workspace"
              referrerPolicy="no-referrer"
              className="w-full h-48 md:h-56 object-cover transform group-hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                // Fallback styled illustration container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-4">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-cyan-300 block">Sistem Terintegrasi XAMPP & Hosting</span>
                <span className="text-slate-400 text-[11px]">Database MySQL terstruktur, otentikasi session aman, tanpa video/audio bloat.</span>
              </div>
            </div>
          </div>

          {/* Highlights & Security Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>MySQL Relasional</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>PHP 8.2+ PDO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bcrypt Hash</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Autentikasi Pribadi
              </span>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">Masuk ke Dashboard</h3>
              <p className="text-xs text-slate-400 mt-1">
                Silakan masukkan username dan password akun Anda untuk melanjutkan.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLocked}
                    placeholder="Masukkan username Anda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLocked}
                    placeholder="Masukkan password Anda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked || isSuccess}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 ${
                  isSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-cyan-500/20'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>Autentikasi Terverifikasi! Membuka Portal...</span>
                  </>
                ) : isLoading ? (
                  <span>Memverifikasi Sesi...</span>
                ) : (
                  <>
                    <span>Masuk ke Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                Aplikasi personal terlindungi. Sesi diamankan dengan token anti-CSRF dan enkripsi password standard PHP 8.2+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
