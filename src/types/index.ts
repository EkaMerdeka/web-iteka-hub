export type Priority = 'rendah' | 'sedang' | 'tinggi' | 'mendesak';
export type TaskStatus = 'belum_dikerjakan' | 'sedang_dikerjakan' | 'menunggu_pengumpulan' | 'selesai';

export interface TaskChecklist {
  id: string;
  title: string;
  is_completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Task {
  id: string;
  course: string;
  title: string;
  lecturer: string;
  description: string;
  given_date: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DDTHH:mm
  priority: Priority;
  status: TaskStatus;
  attachments: TaskAttachment[];
  reference_link?: string;
  notes?: string;
  checklists: TaskChecklist[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory = 
  | 'Materi Kuliah'
  | 'Presentasi PPT'
  | 'Tugas & Laporan'
  | 'Source Code'
  | 'Desain'
  | 'Dokumen Administrasi'
  | 'Referensi';

export interface AcademicDocument {
  id: string;
  name: string;
  original_name: string;
  extension: string;
  mime_type: string;
  size: number; // in bytes
  category: DocumentCategory;
  folder_id?: string;
  course_id?: string;
  course_name?: string;
  description: string;
  tags: string[];
  is_favorite: boolean;
  content_preview?: string; // base64 or text preview
  upload_date: string;
  updated_at: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  course_name: string;
  lecturer: string;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  room: string;
  building: string;
  color: string;
  notes?: string;
  sks?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date?: string; // YYYY-MM-DD
  event_date?: string; // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  category: 'deadline' | 'kuliah' | 'ujian' | 'presentasi' | 'pengumpulan' | 'acara_pribadi';
  description?: string;
  related_task_id?: string;
  color?: string;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  category: string;
  description: string;
  course_name?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credential_url?: string;
}

export interface SemesterGpaRecord {
  semester: string;
  gpa: number;
  credits: number;
}

export interface UserProfile {
  name: string;
  nim?: string;
  study_program: string;
  faculty?: string;
  university: string;
  batch: string;
  semester?: string;
  gpa?: string;
  ips_current?: string;
  credits_completed?: number;
  credits_current_semester?: number;
  credits_target?: number;
  academic_advisor?: string;
  academic_advisor_nip?: string;
  specialization?: string;
  thesis_topic?: string;
  research_lab?: string;
  registration_status?: string;
  tuition_status?: string;
  address?: string;
  home_city?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  skills?: string[];
  certifications?: CertificationItem[];
  organizations?: string[];
  semester_history?: SemesterGpaRecord[];
  bio: string;
  email: string;
  phone: string;
  avatar_url: string;
  storage_used: number; // in bytes
  storage_limit: number; // 1 GB (1073741824 bytes)
  social_links: SocialLink[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'schedule' | 'upload' | 'system' | 'warning';
  is_read: boolean;
  created_at: string;
  related_link?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}

export interface AcademicNote {
  id: string;
  title: string;
  course: string;
  content: string;
  category: 'kuliah' | 'rumus' | 'ujian' | 'tugas' | 'proyek';
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface StudyFocusSession {
  id: string;
  course: string;
  duration_minutes: number;
  completed_at: string;
  ambient_mode?: string;
  notes?: string;
}

export interface GpaCourseItem {
  id: string;
  code: string;
  name: string;
  sks: number;
  expected_grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E';
  semester: string;
}
