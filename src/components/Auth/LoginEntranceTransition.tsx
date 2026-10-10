import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Database,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LoginEntranceTransitionProps {
  profile: UserProfile;
  onFinish: () => void;
}

export const LoginEntranceTransition: React.FC<LoginEntranceTransitionProps> = ({
  profile,
  onFinish,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'Autentikasi Kredensial Terverifikasi', icon: ShieldCheck },
    { text: 'Memuat Basis Data Akademik & Vault Berkas', icon: Database },
    { text: 'Sinkronisasi Roster Mingguan & Kalender', icon: CalendarDays },
    { text: 'Menyiapkan Workspace AcademicMerdeka', icon: Zap },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 300);
    const timer2 = setTimeout(() => setStepIndex(2), 650);
    const timer3 = setTimeout(() => setStepIndex(3), 1000);
    const timer4 = setTimeout(() => onFinish(), 1550);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-slate-100 p-4 select-none"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col items-center text-center"
      >
        {/* Brand & Avatar Header */}
        <div className="relative mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/30 flex items-center justify-center relative"
          >
            <img
              src={profile.avatar_url || '/src/assets/images/iteka_avatar_male_1791559085074.jpg'}
              alt={profile.name}
              className="w-full h-full object-cover rounded-[14px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-slate-900 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>

        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-1 mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            Otentikasi Berhasil
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
            Selamat Datang, {profile.name}!
          </h2>
          <p className="text-xs text-slate-400">
            {profile.study_program} • {profile.batch} • {profile.nim}
          </p>
        </motion.div>

        {/* Step-by-step loading progression */}
        <div className="w-full space-y-2.5 mb-6 text-left">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = stepIndex > idx;
            const isCurrent = stepIndex === idx;

            return (
              <motion.div
                key={step.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-slate-800/80 border-cyan-500/40 text-slate-200'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11.5px]">{step.text}</span>
                </div>

                <div>
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Skip button for user convenience */}
        <button
          onClick={onFinish}
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-800/60"
        >
          <span>Masuk Langsung ke Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </motion.div>
    </motion.div>
  );
};
