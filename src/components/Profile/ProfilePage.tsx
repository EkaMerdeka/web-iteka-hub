import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Save,
  Camera,
  Linkedin,
  Github,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  HardDrive,
  Award,
  BookOpen,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  X,
  FileText,
  Users,
  CheckCircle2,
  TrendingUp,
  BookmarkCheck,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { UserProfile, SocialLink, CertificationItem, SemesterGpaRecord } from '../../types';

interface ProfilePageProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onShowToast: (message: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onSaveProfile,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    nim: profile.nim || '26/512940/TK/59102',
    faculty: profile.faculty || 'Fakultas Ilmu Komputer & Teknologi Informasi',
    semester: profile.semester || 'Semester 3 (Ganjil 2026/2027)',
    gpa: profile.gpa || '3.88 / 4.00',
    ips_current: profile.ips_current || '3.92 / 4.00',
    credits_completed: profile.credits_completed ?? 48,
    credits_current_semester: profile.credits_current_semester ?? 22,
    credits_target: profile.credits_target ?? 144,
    academic_advisor: profile.academic_advisor || 'Dr. Ir. Bambang Hermanto, M.T.',
    academic_advisor_nip: profile.academic_advisor_nip || '19780412 200501 1 003',
    specialization: profile.specialization || 'Software Engineering & Cybersecurity',
    thesis_topic:
      profile.thesis_topic ||
      'Rancang Bangun Sistem Keamanan Transaksi Berbasis Zero-Knowledge Proofs dan Enkripsi End-to-End',
    research_lab:
      profile.research_lab || 'Lab Rekayasa Perangkat Lunak & Sistem Terdistribusi',
    registration_status: profile.registration_status || 'KRS Terverifikasi DPA',
    tuition_status: profile.tuition_status || 'Lunas (Bebas Tanggungan UKT)',
    address: profile.address || 'Kec. Mlati, Kab. Sleman, D.I. Yogyakarta',
    home_city: profile.home_city || 'Semarang, Jawa Tengah',
    emergency_contact_name: profile.emergency_contact_name || 'Budi Raharjo',
    emergency_contact_relation: profile.emergency_contact_relation || 'Orang Tua / Wali',
    emergency_contact_phone: profile.emergency_contact_phone || '+62 813-9876-5432',
    skills: profile.skills || [
      'TypeScript',
      'React',
      'PHP 8.2',
      'MySQL',
      'Python',
      'Tailwind CSS',
      'Docker',
      'Cybersecurity',
    ],
    certifications: profile.certifications || [
      {
        id: 'cert-1',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2026',
        credential_url: 'https://aws.amazon.com/verification',
      },
      {
        id: 'cert-2',
        name: 'Menjadi Back-End Developer Expert',
        issuer: 'Dicoding Academy Indonesia',
        year: '2026',
        credential_url: 'https://dicoding.com/certificates',
      },
      {
        id: 'cert-3',
        name: 'Juara 2 Hackathon Web UI/UX Nasional',
        issuer: 'TechFest Indonesia',
        year: '2025',
      },
    ],
    organizations: profile.organizations || [
      'Staff Divisi Web Development — Himpunan Mahasiswa Informatika (HMIF)',
      'Lead Technical Workshop — Google Developer Groups on Campus (GDGoC)',
    ],
    semester_history: profile.semester_history || [
      { semester: 'Semester 1 (Ganjil 2025)', gpa: 3.82, credits: 20 },
      { semester: 'Semester 2 (Genap 2025)', gpa: 3.94, credits: 22 },
      { semester: 'Semester 3 (Ganjil 2026 - Berjalan)', gpa: 3.88, credits: 22 },
    ],
  });

  const [activeTab, setActiveTab] = useState<'akademik' | 'pribadi' | 'prestasi' | 'sosial'>('akademik');

  // Input states for modal / inline adds
  const [newPlatform, setNewPlatform] = useState('LinkedIn');
  const [newUrl, setNewUrl] = useState('');
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  
  const [newSkill, setNewSkill] = useState('');
  const [newOrg, setNewOrg] = useState('');

  // Cert state
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('2026');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [isAddingCert, setIsAddingCert] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormData((prev) => ({
            ...prev,
            avatar_url: uploadEvent.target!.result as string,
          }));
          onShowToast('Foto profil baru berhasil dimuat. Klik Simpan Profil.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const skillsList = formData.skills || [];
    if (!skillsList.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...skillsList, newSkill.trim()] }));
      setNewSkill('');
      onShowToast(`Keahlian "${newSkill.trim()}" ditambahkan.`);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.trim()) return;
    const orgs = formData.organizations || [];
    setFormData((prev) => ({ ...prev, organizations: [...orgs, newOrg.trim()] }));
    setNewOrg('');
    onShowToast(`Kegiatan organisasi ditambahkan.`);
  };

  const handleRemoveOrg = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      organizations: (prev.organizations || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertIssuer.trim()) return;

    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: newCertName.trim(),
      issuer: newCertIssuer.trim(),
      year: newCertYear.trim() || '2026',
      credential_url: newCertUrl.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert],
    }));

    setNewCertName('');
    setNewCertIssuer('');
    setNewCertUrl('');
    setIsAddingCert(false);
    onShowToast('Sertifikasi akademik berhasil ditambahkan.');
  };

  const handleRemoveCert = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((c) => c.id !== id),
    }));
    onShowToast('Sertifikasi berhasil dihapus.');
  };

  const handleAddSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: newPlatform,
      url: newUrl.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, newLink],
    }));

    setNewUrl('');
    setIsAddingSocial(false);
    onShowToast(`Tautan ${newPlatform} berhasil ditambahkan.`);
  };

  const handleRemoveSocialLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((s) => s.id !== id),
    }));
    onShowToast('Tautan sosial berhasil dihapus.');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveProfile(formData);
    onShowToast('Profil mahasiswa berhasil disimpan ke database!');
  };

  const getSocialIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-500" />;
      case 'github':
        return <Github className="w-4 h-4 text-slate-800 dark:text-slate-100" />;
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      default:
        return <Globe className="w-4 h-4 text-cyan-500" />;
    }
  };

  // 1 GB Storage calculation
  const storageUsedMB = (formData.storage_used / (1024 * 1024)).toFixed(1);
  const storageLimitMB = (formData.storage_limit / (1024 * 1024)).toFixed(0); // 1024 MB
  const storagePercent = Math.min(
    100,
    Math.round((formData.storage_used / formData.storage_limit) * 100)
  );

  const creditsPercent = Math.min(
    100,
    Math.round(((formData.credits_completed ?? 48) / (formData.credits_target ?? 144)) * 100)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner & Avatar Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        {/* Decorative banner top */}
        <div className="h-32 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            <div className="relative group">
              <img
                src={formData.avatar_url || '/src/assets/images/avatar_student_eka_1791559099608.jpg'}
                alt={formData.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-200 dark:bg-slate-800"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs gap-1"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
                <span>Ganti</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formData.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-semibold">
                  Angkatan {formData.batch}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Mahasiswa Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {formData.study_program} · {formData.faculty}
              </p>
              <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                NIM: {formData.nim} · IPK: {formData.gpa} · IPS: {formData.ips_current}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleSave()}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/60 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('akademik')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'akademik'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Akademik & Kurikulum</span>
          </button>
          <button
            onClick={() => setActiveTab('pribadi')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pribadi'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Biodata & Wali</span>
          </button>
          <button
            onClick={() => setActiveTab('prestasi')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'prestasi'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sertifikasi & Organisasi ({formData.certifications?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('sosial')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sosial'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Tautan & Vault (1 GB)</span>
          </button>
        </div>
      </div>

      {/* 4 Academic KPI Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium">IPK Kumulatif</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{formData.gpa}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">IPS Saat Ini: {formData.ips_current}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Progres SKS Lulus</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{formData.credits_completed} / {formData.credits_target} SKS</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${creditsPercent}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">{creditsPercent}% terpenuhi</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Semester Berjalan</span>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{formData.semester}</div>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5 block">{formData.credits_current_semester} SKS Diambil</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Kapasitas Vault</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">1 GB</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">{storageUsedMB} MB / 1,024 MB ({storagePercent}%)</span>
        </div>
      </div>

      {/* TAB 1: AKADEMIK & KURIKULUM */}
      {activeTab === 'akademik' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <GraduationCap className="w-4 h-4 text-cyan-500" />
              <span>Detail Akademik & Dosen Pembimbing</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                <input
                  type="text"
                  value={formData.nim || ''}
                  onChange={(e) => handleInputChange('nim', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Program Studi</label>
                <input
                  type="text"
                  value={formData.study_program}
                  onChange={(e) => handleInputChange('study_program', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Fakultas</label>
                <input
                  type="text"
                  value={formData.faculty || ''}
                  onChange={(e) => handleInputChange('faculty', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Universitas / Institut</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Peminatan / Konsentrasi Studi</label>
                <input
                  type="text"
                  value={formData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Registrasi & UKT</label>
                <input
                  type="text"
                  value={formData.registration_status || ''}
                  onChange={(e) => handleInputChange('registration_status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dosen Pembimbing Akademik (DPA)</label>
                <input
                  type="text"
                  value={formData.academic_advisor || ''}
                  onChange={(e) => handleInputChange('academic_advisor', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">NIP Dosen Pembimbing</label>
                <input
                  type="text"
                  value={formData.academic_advisor_nip || ''}
                  onChange={(e) => handleInputChange('academic_advisor_nip', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Laboratorium Riset</label>
                <input
                  type="text"
                  value={formData.research_lab || ''}
                  onChange={(e) => handleInputChange('research_lab', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Rencana Judul / Topik Penelitian Tugas Akhir (Skripsi)
              </label>
              <textarea
                value={formData.thesis_topic || ''}
                onChange={(e) => handleInputChange('thesis_topic', e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Riwayat Indeks Prestasi per Semester (KHS) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Riwayat Indeks Prestasi per Semester (Kartu Hasil Studi)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(formData.semester_history || []).map((sem, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      {sem.semester}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Beban SKS: {sem.credits} SKS
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      {sem.gpa.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Sangat Memuaskan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BIODATA & WALI */}
      {activeTab === 'pribadi' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <User className="w-4 h-4 text-cyan-500" />
            <span>Biodata Pribadi & Kontak Darurat / Wali</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Mahasiswa</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kota Asal (Daerah Asal)</label>
              <input
                type="text"
                value={formData.home_city || ''}
                onChange={(e) => handleInputChange('home_city', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili Kampus (Kos / Tempat Tinggal)</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Kontak Darurat / Data Orang Tua / Wali</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Wali</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hubungan</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon Darurat</label>
                <input
                  type="text"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Biografi Pribadi & Minat Akademik</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* TAB 3: SERTIFIKASI, ORGANISASI & KEAHLIAN */}
      {activeTab === 'prestasi' && (
        <div className="space-y-6">
          {/* Certifications Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Sertifikasi Kompetensi & Prestasi Akademik</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCert(!isAddingCert)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sertifikat</span>
              </button>
            </div>

            {isAddingCert && (
              <form onSubmit={handleAddCert} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Nama Sertifikasi / Prestasi *</label>
                    <input
                      type="text"
                      value={newCertName}
                      onChange={(e) => setNewCertName(e.target.value)}
                      required
                      placeholder="Contoh: Certified Web Developer"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Lembaga Penerbit / Penyelenggara *</label>
                    <input
                      type="text"
                      value={newCertIssuer}
                      onChange={(e) => setNewCertIssuer(e.target.value)}
                      required
                      placeholder="Contoh: BNSP / AWS / Kemendikbud"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Tahun Perolehan</label>
                    <input
                      type="text"
                      value={newCertYear}
                      onChange={(e) => setNewCertYear(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Tautan Verifikasi / Portofolio (Opsional)</label>
                  <input
                    type="url"
                    value={newCertUrl}
                    onChange={(e) => setNewCertUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCert(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Simpan Sertifikat
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(formData.certifications || []).map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {cert.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cert.issuer} · {cert.year}
                      </p>
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline mt-1"
                        >
                          <span>Verifikasi Kredensial</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                    title="Hapus Sertifikat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Organizations & Campus Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Pengalaman Organisasi & Kepanitiaan Kampus</span>
            </h3>

            <div className="space-y-2.5">
              {(formData.organizations || []).map((org, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{org}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOrg(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddOrg} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder="Tambah organisasi atau kepanitiaan baru..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>
          </div>

          {/* Skills & Tech Stack */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Keahlian & Penguasaan Teknologi (Tech Stack)</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {(formData.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ketik keahlian (contoh: PostgreSQL, Next.js, Git, Linux)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Keahlian</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SOSIAL, LINK & VAULT (1 GB) */}
      {activeTab === 'sosial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Social Links Card (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Tautan Sosial & Portfolio Mahasiswa</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingSocial(!isAddingSocial)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Link</span>
              </button>
            </div>

            {isAddingSocial && (
              <form onSubmit={handleAddSocialLink} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Discord">Discord</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Portfolio Web">Portfolio Web</option>
                  </select>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSocial(false)}
                    className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Simpan Tautan
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {formData.social_links.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                      {getSocialIcon(item.platform)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block truncate">
                        {item.platform}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline truncate block font-mono max-w-[260px]"
                      >
                        {item.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors"
                      title="Buka Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1 GB Storage Vault Info (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <HardDrive className="w-4 h-4 text-cyan-500" />
              <span>Kapasitas Vault Penyimpanan (1 GB)</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Penyimpanan Terpakai</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                  {storageUsedMB} MB / 1,024 MB (1 GB)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{storagePercent}% Terpakai</span>
                <span>{(1024 - parseFloat(storageUsedMB)).toFixed(1)} MB Tersedia</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800/80">
                Kapasitas 1 GB (1,024 MB) dialokasikan penuh untuk berkas dokumen, modul PPT, PDF, tugas, dan source code Anda. Sistem menerapkan proteksi otomatis penolakan berkas audio dan video.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
