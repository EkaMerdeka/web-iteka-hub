import {
  Task,
  AcademicDocument,
  ScheduleItem,
  CalendarEvent,
  SavedLink,
  UserProfile,
  AppNotification,
  ActivityLog,
  AcademicNote,
  StudyFocusSession,
  GpaCourseItem,
} from '../types';

const STORAGE_KEYS = {
  AUTH: 'iteka_auth_session',
  TASKS: 'iteka_tasks',
  DOCUMENTS: 'iteka_documents',
  SCHEDULES: 'iteka_schedules',
  EVENTS: 'iteka_calendar_events',
  LINKS: 'iteka_saved_links',
  PROFILE: 'iteka_user_profile',
  NOTIFICATIONS: 'iteka_notifications',
  ACTIVITY: 'iteka_activity_logs',
  CREDENTIALS: 'iteka_credentials',
  NOTES: 'iteka_academic_notes',
  FOCUS_SESSIONS: 'iteka_focus_sessions',
  GPA_COURSES: 'iteka_gpa_courses',
};

// Initial Seed Profile
const DEFAULT_PROFILE: UserProfile = {
  name: 'Eka Merdeka',
  nim: '26/512940/TK/59102',
  study_program: 'Informatika',
  faculty: 'Fakultas Ilmu Komputer & Teknologi Informasi',
  university: 'Universitas Indonesia / Institut Teknologi',
  batch: '2026',
  semester: 'Semester 3 (Ganjil 2026/2027)',
  gpa: '3.88 / 4.00',
  ips_current: '3.92 / 4.00',
  credits_completed: 48,
  credits_current_semester: 22,
  credits_target: 144,
  academic_advisor: 'Dr. Ir. Bambang Hermanto, M.T.',
  academic_advisor_nip: '19780412 200501 1 003',
  specialization: 'Software Engineering & Cybersecurity',
  thesis_topic: 'Rancang Bangun Sistem Keamanan Transaksi Berbasis Zero-Knowledge Proofs dan Enkripsi End-to-End',
  research_lab: 'Lab Rekayasa Perangkat Lunak & Sistem Terdistribusi',
  registration_status: 'KRS Terverifikasi DPA',
  tuition_status: 'Lunas (Bebas Tanggungan UKT)',
  address: 'Kec. Mlati, Kab. Sleman, D.I. Yogyakarta',
  home_city: 'Semarang, Jawa Tengah',
  emergency_contact_name: 'Budi Raharjo',
  emergency_contact_relation: 'Orang Tua / Wali',
  emergency_contact_phone: '+62 813-9876-5432',
  skills: [
    'TypeScript',
    'React',
    'PHP 8.2',
    'MySQL',
    'Python',
    'Tailwind CSS',
    'Docker',
    'Network Security',
    'Git & GitHub',
    'Linux Sysadmin',
  ],
  certifications: [
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
      name: 'Juara 2 Hackathon UI/UX & Web Development',
      issuer: 'Gemastik / TechFest Nasional',
      year: '2025',
    },
  ],
  organizations: [
    'Staff Divisi Web Development — Himpunan Mahasiswa Informatika (HMIF)',
    'Lead Technical Workshop — Google Developer Groups on Campus (GDGoC)',
  ],
  semester_history: [
    { semester: 'Semester 1 (Ganjil 2025)', gpa: 3.82, credits: 20 },
    { semester: 'Semester 2 (Genap 2025)', gpa: 3.94, credits: 22 },
    { semester: 'Semester 3 (Ganjil 2026 - Berjalan)', gpa: 3.88, credits: 22 },
  ],
  bio: 'Mahasiswa Informatika yang fokus pada pengembangan aplikasi web skala besar, arsitektur backend andal, dan keamanan sistem informasi akademik.',
  email: 'ekamerdeka144@gmail.com',
  phone: '+62 812-3456-7890',
  avatar_url: '/src/assets/images/avatar_student_eka_1791559099608.jpg',
  storage_used: 34850000, // ~34.85 MB
  storage_limit: 1073741824, // 1 GB (1024 MB)
  social_links: [
    { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/eka-merdeka' },
    { id: '2', platform: 'GitHub', url: 'https://github.com/eka-merdeka' },
    { id: '3', platform: 'Discord', url: 'https://discordapp.com/users/ekamerdeka' },
  ],
};

// Initial Seed Tasks
const getInitialTasks = (): Task[] => {
  const today = new Date();
  
  const formatDate = (daysOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const formatDateTime = (daysOffset: number, time = '23:59') => {
    return `${formatDate(daysOffset)}T${time}`;
  };

  return [
    {
      id: 'task-1',
      course: 'Pemrograman Dasar',
      title: 'Membuat Program Kasir Mini Market Berbasis OOP',
      lecturer: 'Dr. Ir. Bambang Hermanto, M.T.',
      description: 'Implementasi konsep Object-Oriented Programming (OOP) pada aplikasi kasir minimarket dengan fitur diskon member, struk belanja, dan riwayat transaksi harian.',
      given_date: formatDate(-3),
      deadline: formatDateTime(7), // 7 days from now
      priority: 'tinggi',
      status: 'belum_dikerjakan',
      attachments: [
        { id: 'att-1', name: 'Spesifikasi_Tugas_Kasir.pdf', size: 1250000, type: 'application/pdf' },
      ],
      reference_link: 'https://github.com/university/oop-cashier-template',
      notes: 'Gunakan modularitas class Product, Customer, dan Transaction.',
      checklists: [
        { id: 'c1', title: 'Rancang class diagram UML', is_completed: true },
        { id: 'c2', title: 'Implementasi class Item dan Cart', is_completed: false },
        { id: 'c3', title: 'Fitur diskon dan perhitungan PPN 11%', is_completed: false },
        { id: 'c4', title: 'Unit testing dan cetak format struk', is_completed: false },
      ],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      course: 'Sistem Basis Data',
      title: 'Normalisasi Database Relasional Toko Buku',
      lecturer: 'Prof. Siti Nurhaliza, Ph.D.',
      description: 'Lakukan normalisasi tabel database transaksi penjualan toko buku mulai dari tabel unnormalized (UNF) hingga bentuk 3NF/BCNF beserta DDL script MySQL.',
      given_date: formatDate(-5),
      deadline: formatDateTime(2), // 2 days from now (urgent)
      priority: 'mendesak',
      status: 'sedang_dikerjakan',
      attachments: [
        { id: 'att-2', name: 'Dataset_TokoBuku_Kotor.xlsx', size: 840000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      ],
      reference_link: 'https://docs.oracle.com/cd/E17952_01/mysql-8.0-en/normalization.html',
      notes: 'Pastikan functional dependency terdokumentasi jelas di laporan.',
      checklists: [
        { id: 'c5', title: 'Analisis tabel unnormalized (UNF)', is_completed: true },
        { id: 'c6', title: 'Transformasi ke bentuk 1NF', is_completed: true },
        { id: 'c7', title: 'Hilangkan partial dependency (2NF)', is_completed: true },
        { id: 'c8', title: 'Hilangkan transitive dependency (3NF)', is_completed: false },
        { id: 'c9', title: 'Tulis script DDL schema.sql', is_completed: false },
      ],
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      course: 'Jaringan Komputer',
      title: 'Simulasi Topologi Jaringan Kampus di Cisco Packet Tracer',
      lecturer: 'Ahmad Fauzi, S.Kom., M.Cs.',
      description: 'Rancang topologi jaringan hierarkis kampus 3 gedung dengan subnetting VLSM, VLAN, inter-VLAN routing, DHCP Server, dan konfigurasi firewall dasar.',
      given_date: formatDate(-10),
      deadline: formatDateTime(0, '18:00'), // Today deadline!
      priority: 'mendesak',
      status: 'menunggu_pengumpulan',
      attachments: [
        { id: 'att-3', name: 'Topologi_Kampus_v2.pkt', size: 3400000, type: 'application/octet-stream' },
        { id: 'att-4', name: 'Laporan_Praktikum_Jarkom.docx', size: 2100000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      ],
      reference_link: 'https://classroom.google.com/c/jaringan-komputer-2026',
      notes: 'Tinggal submit ke Google Classroom sebelum jam 18:00 WIB.',
      checklists: [
        { id: 'c10', title: 'Perhitungan tabel subnetting VLSM', is_completed: true },
        { id: 'c11', title: 'Konfigurasi switch trunk dan access port', is_completed: true },
        { id: 'c12', title: 'Testing ping antar VLAN', is_completed: true },
        { id: 'c13', title: 'Export file laporan PDF', is_completed: true },
      ],
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      id: 'task-4',
      course: 'Struktur Data & Algoritma',
      title: 'Analisis Kompleksitas Waktu Algoritma Graf Dijkstra vs A*',
      lecturer: 'Dr. Hendra Wijaya, S.T., M.Kom.',
      description: 'Implementasikan algoritma shortest path Dijkstra dan A* dalam Python, lalu bandingkan runtime Big-O pada dataset graf 10.000 nodes.',
      given_date: formatDate(-14),
      deadline: formatDateTime(-2), // 2 days ago (finished)
      priority: 'sedang',
      status: 'selesai',
      attachments: [
        { id: 'att-5', name: 'Dijkstra_vs_AStar.py', size: 45000, type: 'text/x-python' },
        { id: 'att-6', name: 'Laporan_Algoritma_Graf.pdf', size: 1850000, type: 'application/pdf' },
      ],
      completed_at: formatDate(-2),
      notes: 'Nilai praktikum sudah keluar: A (95)',
      checklists: [
        { id: 'c14', title: 'Implementasi heap queue di Dijkstra', is_completed: true },
        { id: 'c15', title: 'Implementasi heuristik Manhattan pada A*', is_completed: true },
        { id: 'c16', title: 'Plot grafik perbandingan runtime', is_completed: true },
      ],
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      course: 'Kecerdasan Buatan',
      title: 'Klasifikasi Sentimen Ulasan Kampus Menggunakan TF-IDF & Naive Bayes',
      lecturer: 'Dra. Rini Kusuma, M.Sc.',
      description: 'Preprocessing teks bahasa Indonesia (case folding, stopword removal, stemming Sastrawi), ekstraksi fitur TF-IDF, dan klasifikasi Naive Bayes.',
      given_date: formatDate(-2),
      deadline: formatDateTime(12),
      priority: 'sedang',
      status: 'belum_dikerjakan',
      attachments: [],
      notes: 'Gunakan library Scikit-Learn dan NLTK.',
      checklists: [
        { id: 'c17', title: 'Scraping ulasan Twitter / PlayStore', is_completed: false },
        { id: 'c18', title: 'Pembersihan teks (data cleaning)', is_completed: false },
        { id: 'c19', title: 'Evaluasi akurasi confusion matrix & F1-Score', is_completed: false },
      ],
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      course: 'Etika Profesi & Hukum Cyber',
      title: 'Esai Analisis Kasus Kebocoran Data Pribadi Berdasarkan UU PDP',
      lecturer: 'Budi Santoso, S.H., M.H.',
      description: 'Kajian yuridis dan etika profesional insiden kebocoran data di instansi publik mengacu pada Undang-Undang Perlindungan Data Pribadi (UU No. 27 Tahun 2022).',
      given_date: formatDate(-1),
      deadline: formatDateTime(18),
      priority: 'rendah',
      status: 'belum_dikerjakan',
      attachments: [],
      notes: 'Minimal 1.500 kata dengan format APA style referensi.',
      checklists: [
        { id: 'c20', title: 'Pilih studi kasus kebocoran data', is_completed: false },
        { id: 'c21', title: 'Tinjauan pasal relevan UU PDP', is_completed: false },
        { id: 'c22', title: 'Rekomendasi pencegahan tata kelola IT', is_completed: false },
      ],
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];
};

// Initial Seed Documents
const getInitialDocuments = (): AcademicDocument[] => {
  return [
    {
      id: 'doc-1',
      name: 'Modul_Lengkap_Pemrograman_Berorientasi_Objek_2026.pdf',
      original_name: 'Modul_Lengkap_Pemrograman_Berorientasi_Objek_2026.pdf',
      extension: 'pdf',
      mime_type: 'application/pdf',
      size: 4850000, // 4.85 MB
      category: 'Materi Kuliah',
      course_name: 'Pemrograman Dasar',
      description: 'Materi pegangan kuliah semester ini mencakup Encapsulation, Inheritance, Polymorphism, dan Design Patterns.',
      tags: ['Modul', 'OOP', 'Java', 'Pemrograman'],
      is_favorite: true,
      upload_date: '2026-09-15T09:30:00Z',
      updated_at: '2026-09-15T09:30:00Z',
    },
    {
      id: 'doc-2',
      name: 'Slide_Presentasi_Arsitektur_Mikroservis_Pertemuan_06.pptx',
      original_name: 'Slide_Presentasi_Arsitektur_Mikroservis_Pertemuan_06.pptx',
      extension: 'pptx',
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 7200000, // 7.2 MB
      category: 'Presentasi PPT',
      course_name: 'Rekayasa Perangkat Lunak',
      description: 'Slide materi kuliah topik arsitektur Monolithic vs Microservices, API Gateway, Docker, dan Service Mesh.',
      tags: ['Slide', 'PPT', 'Arsitektur', 'Microservices'],
      is_favorite: true,
      upload_date: '2026-09-22T14:15:00Z',
      updated_at: '2026-09-22T14:15:00Z',
    },
    {
      id: 'doc-3',
      name: 'Laporan_Akhir_Praktikum_Jaringan_Komputer.docx',
      original_name: 'Laporan_Akhir_Praktikum_Jaringan_Komputer.docx',
      extension: 'docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 3150000,
      category: 'Tugas & Laporan',
      course_name: 'Jaringan Komputer',
      description: 'Laporan praktikum konfigurasi router, switch VLAN, dan firewall IP tables.',
      tags: ['Laporan', 'Jarkom', 'Praktikum'],
      is_favorite: false,
      upload_date: '2026-09-28T16:40:00Z',
      updated_at: '2026-09-28T16:40:00Z',
    },
    {
      id: 'doc-4',
      name: 'Skema_Relasional_ECommerce_MySQL.sql',
      original_name: 'Skema_Relasional_ECommerce_MySQL.sql',
      extension: 'sql',
      mime_type: 'application/sql',
      size: 145000,
      category: 'Source Code',
      course_name: 'Sistem Basis Data',
      description: 'Script DDL tabel pelanggan, produk, pesanan, payment gateway, dan trigger stock inventory.',
      tags: ['SQL', 'Database', 'MySQL', 'Schema'],
      is_favorite: false,
      upload_date: '2026-10-01T11:20:00Z',
      updated_at: '2026-10-01T11:20:00Z',
    },
    {
      id: 'doc-5',
      name: 'Arsitektur_Sistem_Cloud_ITEKA_Diagram.png',
      original_name: 'Arsitektur_Sistem_Cloud_ITEKA_Diagram.png',
      extension: 'png',
      mime_type: 'image/png',
      size: 2100000,
      category: 'Desain',
      course_name: 'Cloud Computing',
      description: 'Diagram topologi server high-availability dengan load balancer dan database cluster.',
      tags: ['Diagram', 'Architecture', 'Cloud', 'Design'],
      is_favorite: true,
      content_preview: '/src/assets/images/iteka_academic_illustration_1791559085074.jpg',
      upload_date: '2026-10-03T10:00:00Z',
      updated_at: '2026-10-03T10:00:00Z',
    },
    {
      id: 'doc-6',
      name: 'KRS_Semester_Ganjil_2026_Informatika.pdf',
      original_name: 'KRS_Semester_Ganjil_2026_Informatika.pdf',
      extension: 'pdf',
      mime_type: 'application/pdf',
      size: 980000,
      category: 'Dokumen Administrasi',
      course_name: 'Administrasi Akademik',
      description: 'Kartu Rencana Studi (KRS) resmi semester ini telah disetujui Dosen Pembimbing Akademik.',
      tags: ['KRS', 'Administrasi', 'Akademik'],
      is_favorite: false,
      upload_date: '2026-08-25T08:00:00Z',
      updated_at: '2026-08-25T08:00:00Z',
    },
    {
      id: 'doc-7',
      name: 'Paper_Survey_AI_Large_Language_Models_IEEE.pdf',
      original_name: 'Paper_Survey_AI_Large_Language_Models_IEEE.pdf',
      extension: 'pdf',
      mime_type: 'application/pdf',
      size: 5400000,
      category: 'Referensi',
      course_name: 'Kecerdasan Buatan',
      description: 'Paper rujukan riset literatur perkembangan arsitektur transformer dan retrieval-augmented generation.',
      tags: ['Paper', 'IEEE', 'AI', 'LLM', 'Riset'],
      is_favorite: true,
      upload_date: '2026-10-04T13:20:00Z',
      updated_at: '2026-10-04T13:20:00Z',
    },
  ];
};

// Initial Seed Schedules (Weekly Roster)
const getInitialSchedules = (): ScheduleItem[] => {
  return [
    {
      id: 'sch-1',
      day: 'Senin',
      course_name: 'Pemrograman Dasar',
      lecturer: 'Dr. Ir. Bambang Hermanto, M.T.',
      start_time: '08:00',
      end_time: '10:30',
      room: 'Lab Komputer 302',
      building: 'Gedung Fasilkom Barat Lt. 3',
      color: '#3B82F6', // Blue
      notes: 'Bawa laptop sudah terinstall JDK 21 dan VS Code.',
      sks: 3,
    },
    {
      id: 'sch-2',
      day: 'Senin',
      course_name: 'Etika Profesi & Hukum Cyber',
      lecturer: 'Budi Santoso, S.H., M.H.',
      start_time: '13:00',
      end_time: '14:40',
      room: 'Ruang Teori 104',
      building: 'Gedung Rektorat Lt. 1',
      color: '#8B5CF6', // Purple
      notes: 'Diskusi kelompok mengenai UU ITE dan regulasi AI.',
      sks: 2,
    },
    {
      id: 'sch-3',
      day: 'Selasa',
      course_name: 'Sistem Basis Data',
      lecturer: 'Prof. Siti Nurhaliza, Ph.D.',
      start_time: '09:00',
      end_time: '11:30',
      room: 'Lab Database 201',
      building: 'Gedung Fasilkom Timur Lt. 2',
      color: '#06B6D4', // Cyan
      notes: 'Materi SQL indexing, query optimization, dan transactions.',
      sks: 3,
    },
    {
      id: 'sch-4',
      day: 'Rabu',
      course_name: 'Jaringan Komputer',
      lecturer: 'Ahmad Fauzi, S.Kom., M.Cs.',
      start_time: '10:00',
      end_time: '12:30',
      room: 'Lab Jaringan & Hardware 105',
      building: 'Gedung Lab Terpadu Lt. 1',
      color: '#10B981', // Emerald
      notes: 'Praktikum crimping kabel dan setting mikrotik router.',
      sks: 3,
    },
    {
      id: 'sch-5',
      day: 'Kamis',
      course_name: 'Struktur Data & Algoritma',
      lecturer: 'Dr. Hendra Wijaya, S.T., M.Kom.',
      start_time: '08:00',
      end_time: '10:30',
      room: 'Ruang Seminar 401',
      building: 'Gedung Fasilkom Barat Lt. 4',
      color: '#F59E0B', // Amber
      notes: 'Kuis mingguan tentang binary search tree & AVL tree.',
      sks: 3,
    },
    {
      id: 'sch-6',
      day: 'Jumat',
      course_name: 'Kecerdasan Buatan',
      lecturer: 'Dra. Rini Kusuma, M.Sc.',
      start_time: '08:30',
      end_time: '11:00',
      room: 'Auditorium AI & Data 305',
      building: 'Gedung Smart Campus Lt. 3',
      color: '#EC4899', // Pink
      notes: 'Presentasi progress tugas klasifikasi machine learning.',
      sks: 3,
    },
  ];
};

// Initial Seed Links
const getInitialLinks = (): SavedLink[] => {
  return [
    {
      id: 'link-1',
      title: 'Google Classroom — Pemrograman Dasar',
      url: 'https://classroom.google.com/c/pemrograman-dasar-2026',
      platform: 'Google Classroom',
      category: 'Pengumpulan Tugas',
      description: 'Portal resmi kelas untuk penugasan, presensi, dan materi mingguan.',
      course_name: 'Pemrograman Dasar',
      is_favorite: true,
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'link-2',
      title: 'Repository GitHub Tugas Kampus',
      url: 'https://github.com/eka-merdeka/academic-hub-assignments',
      platform: 'GitHub',
      category: 'Source Code',
      description: 'Monorepo untuk menyimpan semua praktikum dan coding assignment.',
      course_name: 'Semua Mata Kuliah',
      is_favorite: true,
      created_at: '2026-09-02T10:00:00Z',
    },
    {
      id: 'link-3',
      title: 'Shared Drive Modul & Rekaman Kuliah',
      url: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      platform: 'Google Drive',
      category: 'Materi & Video',
      description: 'Folder Google Drive kelas untuk backup slide dan rekaman Zoom.',
      course_name: 'Informatika 2026',
      is_favorite: true,
      created_at: '2026-09-05T14:30:00Z',
    },
    {
      id: 'link-4',
      title: 'Figma UI Wireframe Kasir Minimarket',
      url: 'https://www.figma.com/file/sample-academic-cashier-wireframe',
      platform: 'Figma',
      category: 'Desain & Prototipe',
      description: 'Desain layout antarmuka kasir minimarket untuk tugas besar OOP.',
      course_name: 'Pemrograman Dasar',
      is_favorite: false,
      created_at: '2026-09-12T11:00:00Z',
    },
    {
      id: 'link-5',
      title: 'Portal Akademik Kampus (SIAKAD)',
      url: 'https://academic.kampus.ac.id/portal/mahasiswa',
      platform: 'Website Kampus',
      category: 'Administrasi',
      description: 'Cek presensi kuliah, input KRS, dan cek transkrip nilai KHS semester.',
      course_name: 'Administrasi',
      is_favorite: true,
      created_at: '2026-08-20T07:00:00Z',
    },
    {
      id: 'link-6',
      title: 'Moodle E-Learning Kampus',
      url: 'https://elearning.kampus.ac.id/login/index.php',
      platform: 'Moodle',
      category: 'Ujian & Kuis',
      description: 'Platform kuis online dan forum tanya jawab dengan dosen.',
      course_name: 'Sistem Basis Data',
      is_favorite: false,
      created_at: '2026-09-08T09:15:00Z',
    },
  ];
};

// Initial Seed Notifications
const getInitialNotifications = (): AppNotification[] => {
  return [
    {
      id: 'notif-1',
      title: 'Peringatan Deadline Hari Ini!',
      message: 'Tugas "Simulasi Topologi Jaringan Kampus" jatuh tempo hari ini pukul 18:00 WIB.',
      type: 'deadline',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Mendekati Deadline (2 Hari Lagi)',
      message: 'Tugas "Normalisasi Database Relasional Toko Buku" deadline dalam 2 hari.',
      type: 'warning',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Dokumen Berhasil Disimpan',
      message: 'File "Arsitektur_Sistem_Cloud_ITEKA_Diagram.png" berhasil diunggah ke vault.',
      type: 'upload',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'notif-4',
      title: 'Pengingat Jadwal Kuliah',
      message: 'Kuliah Pemrograman Dasar di Lab Komputer 302 akan dimulai Senin depan 08:00 WIB.',
      type: 'schedule',
      is_read: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
};

// Storage helper functions
export const StorageService = {
  // Authentication
  getAuthSession: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  setAuthSession: (isAuth: boolean) => {
    if (isAuth) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  getCredentials: () => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      username: 'ITEKA',
      passwordHash: 'EKAIT26', // In a real PHP environment this is password_hash('EKAIT26', PASSWORD_BCRYPT)
    };
  },

  saveCredentials: (creds: { username: string; passwordHash: string }) => {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  },

  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      const initial = getInitialTasks();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Documents
  getDocuments: (): AcademicDocument[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) {
      const initial = getInitialDocuments();
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveDocuments: (docs: AcademicDocument[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  // Schedules
  getSchedules: (): ScheduleItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!data) {
      const initial = getInitialSchedules();
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveSchedules: (schedules: ScheduleItem[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  },

  // Calendar Events
  getCalendarEvents: (): CalendarEvent[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!data) {
      const initial: CalendarEvent[] = [
        {
          id: 'ev-1',
          title: 'Ujian Tengah Semester (UTS) Pemrograman',
          date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          start_time: '08:00',
          end_time: '10:00',
          category: 'ujian',
          description: 'Materi UTS mencakup Bab 1 sampai Bab 7 OOP.',
          color: '#EF4444',
        },
        {
          id: 'ev-2',
          title: 'Presentasi Proyek Akhir Basis Data',
          date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
          start_time: '13:00',
          end_time: '15:30',
          category: 'presentasi',
          description: 'Demo aplikasi toko buku dan penjelasan query optimization.',
          color: '#8B5CF6',
        },
        {
          id: 'ev-3',
          title: 'Seminar Nasional Cybersecurity & Cloud',
          date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '12:00',
          category: 'acara_pribadi',
          description: 'Mendapat sertifikat kompetensi keamanan siber 4 SKP.',
          color: '#10B981',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveCalendarEvents: (events: CalendarEvent[]) => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  // Links
  getLinks: (): SavedLink[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LINKS);
    if (!data) {
      const initial = getInitialLinks();
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveLinks: (links: SavedLink[]) => {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },

  // Profile
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(data);
    // Ensure 1GB limit and defaults for any newly introduced profile fields
    const updated = {
      ...DEFAULT_PROFILE,
      ...parsed,
      storage_limit: 1073741824, // 1 GB
    };
    return updated;
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Notifications
  getNotifications: (): AppNotification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      const initial = getInitialNotifications();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveNotifications: (notifs: AppNotification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // Academic Notes
  getNotes: (): AcademicNote[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      const initial: AcademicNote[] = [
        {
          id: 'note-1',
          title: 'Arsitektur Microservices vs Monolith & Event-Driven',
          course: 'Rekayasa Perangkat Lunak',
          category: 'kuliah',
          is_pinned: true,
          tags: ['Software Architecture', 'Docker', 'API Gateway'],
          content: 'Kelebihan Microservices: Independent deployment, fault isolation, tech-stack flexibility. Tantangan: Network latency, distributed transactions (Saga Pattern), data consistency, observability tracing.',
          created_at: '2026-10-01T08:30:00Z',
          updated_at: '2026-10-08T14:15:00Z',
        },
        {
          id: 'note-2',
          title: 'Kompleksitas Algoritma Notasi Big-O (Sorting & Search Trees)',
          course: 'Desain & Analisis Algoritma',
          category: 'rumus',
          is_pinned: true,
          tags: ['Big-O', 'Algorithms', 'Data Structures'],
          content: 'QuickSort: Best/Avg O(n log n), Worst O(n^2). MergeSort: O(n log n) stable, memory O(n). Binary Search Tree: Search/Insert O(log n), worst-case skewed O(n). AVL Tree & Red-Black Tree menjamin O(log n) self-balancing.',
          created_at: '2026-10-02T10:00:00Z',
          updated_at: '2026-10-07T09:40:00Z',
        },
        {
          id: 'note-3',
          title: 'Review Kriptografi: Perbedaan RSA, ECC, & Hashing SHA-256',
          course: 'Keamanan Jaringan & Kriptografi',
          category: 'ujian',
          is_pinned: false,
          tags: ['Kriptografi', 'UTS Prep', 'Cybersecurity'],
          content: 'Asymmetric: RSA (faktorisasi bilangan prima besar), ECC (elliptic curve, kunci lebih pendek dengan keamanan setara RSA 2048). Hash SHA-256 adalah one-way function tanpa dekripsi. Garam (Salt) krusial untuk mencegah rainbow table.',
          created_at: '2026-10-05T13:20:00Z',
          updated_at: '2026-10-05T13:20:00Z',
        },
        {
          id: 'note-4',
          title: 'Indexing B-Tree & Query Execution Plan di PostgreSQL & MySQL',
          course: 'Basis Data Lanjut',
          category: 'proyek',
          is_pinned: false,
          tags: ['Database', 'Optimization', 'SQL Index'],
          content: 'Gunakan EXPLAIN ANALYZE untuk membaca cost & actual time. Index B-Tree ideal untuk equality dan range (<, >, BETWEEN). Perhatikan composite index order (kolom paling selektif di depan). Hindari fungsi pada WHERE clause karena bypass index.',
          created_at: '2026-10-06T15:10:00Z',
          updated_at: '2026-10-06T15:10:00Z',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveNotes: (notes: AcademicNote[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  // Study Focus Sessions
  getFocusSessions: (): StudyFocusSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
    if (!data) {
      const initial: StudyFocusSession[] = [
        {
          id: 'focus-1',
          course: 'Rekayasa Perangkat Lunak',
          duration_minutes: 50,
          completed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          ambient_mode: 'Hujan Lembut',
          notes: 'Mengerjakan use case diagram dan arsitektur SRS',
        },
        {
          id: 'focus-2',
          course: 'Desain & Analisis Algoritma',
          duration_minutes: 25,
          completed_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          ambient_mode: 'Brown Noise',
          notes: 'Latihan soal dynamic programming knapsack',
        },
        {
          id: 'focus-3',
          course: 'Basis Data Lanjut',
          duration_minutes: 50,
          completed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          ambient_mode: 'Perpustakaan Kampus',
          notes: 'Optimasi query laporan proyek akhir',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveFocusSessions: (sessions: StudyFocusSession[]) => {
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  },

  // GPA Simulation Courses
  getGpaCourses: (): GpaCourseItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GPA_COURSES);
    if (!data) {
      const initial: GpaCourseItem[] = [
        { id: 'gpa-1', code: 'IF3101', name: 'Rekayasa Perangkat Lunak Terdistribusi', sks: 4, expected_grade: 'A', semester: 'Semester 3' },
        { id: 'gpa-2', code: 'IF3102', name: 'Desain & Analisis Algoritma', sks: 3, expected_grade: 'A', semester: 'Semester 3' },
        { id: 'gpa-3', code: 'IF3103', name: 'Basis Data Lanjut & Big Data', sks: 3, expected_grade: 'A-', semester: 'Semester 3' },
        { id: 'gpa-4', code: 'IF3104', name: 'Sistem Operasi & Linux Kernel', sks: 3, expected_grade: 'A', semester: 'Semester 3' },
        { id: 'gpa-5', code: 'IF3105', name: 'Keamanan Jaringan & Kriptografi', sks: 3, expected_grade: 'A', semester: 'Semester 3' },
        { id: 'gpa-6', code: 'IF3106', name: 'Pemrograman Web Berbasis Komponen', sks: 3, expected_grade: 'A', semester: 'Semester 3' },
        { id: 'gpa-7', code: 'IF3107', name: 'Etika Profesi & Hak Kekayaan Intelektual', sks: 3, expected_grade: 'A', semester: 'Semester 3' },
      ];
      localStorage.setItem(STORAGE_KEYS.GPA_COURSES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveGpaCourses: (courses: GpaCourseItem[]) => {
    localStorage.setItem(STORAGE_KEYS.GPA_COURSES, JSON.stringify(courses));
  },

  // Reset to factory demo state
  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.LINKS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.GPA_COURSES);
  },
};
