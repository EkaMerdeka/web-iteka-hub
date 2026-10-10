import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Waves,
  Coffee,
  Headphones,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Clock,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyFocusSession, ScheduleItem } from '../../types';
import { StorageService } from '../../services/storage';

interface StudyFocusRoomProps {
  schedules: ScheduleItem[];
  onShowToast: (message: string) => void;
}

type AmbientType = 'none' | 'rain' | 'brown' | 'ocean' | 'cafe';

export const StudyFocusRoom: React.FC<StudyFocusRoomProps> = ({ schedules, onShowToast }) => {
  // Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(25 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

  // Selected Course
  const courseOptions = Array.from(
    new Set(schedules.map((s) => s.course_name).filter(Boolean))
  );
  const [selectedCourse, setSelectedCourse] = useState<string>(
    courseOptions[0] || 'Rekayasa Perangkat Lunak'
  );

  // Audio Synth State (Web Audio API)
  const [ambientSound, setAmbientSound] = useState<AmbientType>('none');
  const [volume, setVolume] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio Web API nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  // Fullscreen state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // History sessions
  const [sessions, setSessions] = useState<StudyFocusSession[]>(() =>
    StorageService.getFocusSessions()
  );

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Audio synthesis setup & teardown
  const stopAmbientAudio = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop?.();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      audioCtxRef.current = null;
    }
  };

  const startAmbientAudio = (type: AmbientType) => {
    stopAmbientAudio();
    if (type === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : volume;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // 4-second looping noise buffer
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // gain compensation
        }
      } else if (type === 'rain') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
      } else if (type === 'ocean') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.5;
        }
      } else {
        // cafe / pink-ish
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.3;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      if (type === 'rain') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        noiseSource.connect(filter);
        filter.connect(gain);
      } else if (type === 'ocean') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        // LFO for wave swelling
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // slow waves
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 350;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        noiseSource.connect(filter);
        filter.connect(gain);
      } else {
        noiseSource.connect(gain);
      }

      noiseSource.start();
      sourceNodeRef.current = noiseSource;
    } catch (err) {
      console.warn('Web Audio Ambient synth error:', err);
    }
  };

  // Sync volume changes
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  const handleSelectAmbient = (type: AmbientType) => {
    setAmbientSound(type);
    startAmbientAudio(type);
    if (type !== 'none') {
      onShowToast(`Suara latar: ${type.toUpperCase()} diaktifkan.`);
    }
  };

  const handleSessionComplete = () => {
    if (timerMode === 'focus') {
      const minutesSpent = Math.round(selectedDuration / 60);
      const newSession: StudyFocusSession = {
        id: `focus-${Date.now()}`,
        course: selectedCourse,
        duration_minutes: minutesSpent,
        completed_at: new Date().toISOString(),
        ambient_mode: ambientSound,
        notes: `Sesi fokus ${minutesSpent} menit selesai`,
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      StorageService.saveFocusSessions(updated);
      onShowToast(`🎉 Selamat! Sesi fokus ${minutesSpent} menit untuk ${selectedCourse} selesai!`);
    } else {
      onShowToast('Waktu istirahat selesai! Siap untuk sesi fokus berikutnya?');
    }
  };

  const handleSetDuration = (minutes: number, mode: 'focus' | 'break') => {
    setIsRunning(false);
    setTimerMode(mode);
    const secs = minutes * 60;
    setSelectedDuration(secs);
    setTimeLeft(secs);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
  };

  // Formatter mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress for circle
  const progressPercent =
    selectedDuration > 0 ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0;

  // Stats calculation
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Ruang Fokus Belajar & Pomodoro
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tingkatkan konsentrasi belajar dengan teknik Pomodoro terstruktur dan suara latar sintetis penenang pikiran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZenMode ? 'Keluar Zen Mode' : 'Mode Layar Penuh'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Timer on Left, Ambient & Sessions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Circular Timer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-between">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => handleSetDuration(25, 'focus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === 25 * 60 && timerMode === 'focus'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Pomodoro 25m
            </button>
            <button
              onClick={() => handleSetDuration(50, 'focus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === 50 * 60 && timerMode === 'focus'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Deep Focus 50m
            </button>
            <button
              onClick={() => handleSetDuration(5, 'break')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === 5 * 60 && timerMode === 'break'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Istirahat Singkat 5m
            </button>
            <button
              onClick={() => handleSetDuration(15, 'break')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === 15 * 60 && timerMode === 'break'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Istirahat Panjang 15m
            </button>
          </div>

          {/* Circular Countdown Display */}
          <div className="relative my-4 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-64 h-64 md:w-72 md:h-72 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className={`${
                  timerMode === 'focus' ? 'stroke-cyan-500' : 'stroke-emerald-500'
                } transition-all duration-500`}
                strokeWidth="8"
                strokeDasharray="600"
                strokeDashoffset={600 - (600 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {timerMode === 'focus' ? 'Mode Fokus' : 'Istirahat Santai'}
              </span>
              <span className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight my-1">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium max-w-[180px] truncate text-center">
                {selectedCourse}
              </span>
            </div>
          </div>

          {/* Course Selector */}
          <div className="w-full max-w-xs my-4">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 text-center">
              Target Mata Kuliah yang Dipelajari:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Tugas Akhir / Skripsi">Tugas Akhir / Skripsi</option>
              <option value="Persiapan Ujian / Quiz">Persiapan Ujian / Quiz</option>
              <option value="Eksplorasi Mandiri / Coding">Eksplorasi Mandiri / Coding</option>
            </select>
          </div>

          {/* Action Play / Pause / Reset Controls */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Jeda Waktu</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Mulai Belajar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Ambient Sound Generator & Session History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambient Sound Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Suara Latar Belajar (Ambient Audio)
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Web Audio Synth
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Dihasilkan murni melalui sintesis browser tanpa buffering file eksternal.
            </p>

            {/* Sound Selection Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={() => handleSelectAmbient('rain')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                  ambientSound === 'rain'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CloudRain className="w-4 h-4 text-cyan-500 shrink-0" />
                <div>
                  <span className="block font-semibold">Hujan Tenang</span>
                  <span className="text-[10px] text-slate-400">Soft Rain</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectAmbient('ocean')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                  ambientSound === 'ocean'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Waves className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="block font-semibold">Ombak Laut</span>
                  <span className="text-[10px] text-slate-400">Ocean Waves</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectAmbient('cafe')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                  ambientSound === 'cafe'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="block font-semibold">Perpustakaan</span>
                  <span className="text-[10px] text-slate-400">Warm Ambience</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectAmbient('brown')}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                  ambientSound === 'brown'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                <div>
                  <span className="block font-semibold">Brown Noise</span>
                  <span className="text-[10px] text-slate-400">Deep Focus</span>
                </div>
              </button>
            </div>

            {/* Volume Control */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => {
                  if (ambientSound !== 'none') {
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || ambientSound === 'none' ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-500" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-400 w-9 text-right">
                {Math.round(volume * 100)}%
              </span>
              {ambientSound !== 'none' && (
                <button
                  onClick={() => handleSelectAmbient('none')}
                  className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer ml-1"
                >
                  Matikan
                </button>
              )}
            </div>
          </div>

          {/* Focus Sessions Record Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Riwayat Sesi Belajar
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                {totalMinutesStudied} Menit Total
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[190px]">
                      {s.course}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.completed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-[11px]">
                      +{s.duration_minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
