/**
 * Production-ready PHP 8.2+ and MySQL codebase bundle
 * Designed for local execution in XAMPP (Apache + MySQL/MariaDB)
 * and seamless migration to PHP hosting (cPanel, Niagahoster, Hostinger, etc.)
 */

export interface PhpFileDefinition {
  path: string;
  description: string;
  content: string;
}

export const SCHEMA_SQL = `-- ========================================================
-- ACADEMICMERDEKA — DATABASE SCHEMA
-- Target Engine: MySQL 8.0+ / MariaDB 10.4+ (XAMPP Default)
-- Collation: utf8mb4_unicode_ci
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`academic_merdeka\` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`academic_merdeka\`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`activity_logs\`;
DROP TABLE IF EXISTS \`notifications\`;
DROP TABLE IF EXISTS \`social_links\`;
DROP TABLE IF EXISTS \`saved_links\`;
DROP TABLE IF EXISTS \`calendar_events\`;
DROP TABLE IF EXISTS \`schedules\`;
DROP TABLE IF EXISTS \`task_attachments\`;
DROP TABLE IF EXISTS \`task_checklists\`;
DROP TABLE IF EXISTS \`tasks\`;
DROP TABLE IF EXISTS \`document_tags\`;
DROP TABLE IF EXISTS \`tags\`;
DROP TABLE IF EXISTS \`documents\`;
DROP TABLE IF EXISTS \`folders\`;
DROP TABLE IF EXISTS \`categories\`;
DROP TABLE IF EXISTS \`lecturers\`;
DROP TABLE IF EXISTS \`courses\`;
DROP TABLE IF EXISTS \`profiles\`;
DROP TABLE IF EXISTS \`application_settings\`;
DROP TABLE IF EXISTS \`users\`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(20) NOT NULL DEFAULT 'student',
  \`failed_login_attempts\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`lockout_until\` DATETIME NULL,
  \`last_login_at\` DATETIME NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_user_lookup\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PROFILES TABLE
CREATE TABLE \`profiles\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`name\` VARCHAR(100) NOT NULL,
  \`nim\` VARCHAR(50) NULL,
  \`study_program\` VARCHAR(100) NOT NULL,
  \`university\` VARCHAR(150) NOT NULL,
  \`batch\` VARCHAR(10) NOT NULL,
  \`semester\` VARCHAR(50) NULL,
  \`gpa\` VARCHAR(20) NULL,
  \`credits_completed\` INT UNSIGNED DEFAULT 48,
  \`academic_advisor\` VARCHAR(120) NULL,
  \`specialization\` VARCHAR(100) NULL,
  \`address\` TEXT NULL,
  \`skills\` TEXT NULL,
  \`bio\` TEXT NULL,
  \`email\` VARCHAR(100) NULL,
  \`phone\` VARCHAR(30) NULL,
  \`avatar_url\` VARCHAR(255) NULL,
  \`storage_used_bytes\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`storage_limit_bytes\` BIGINT UNSIGNED NOT NULL DEFAULT 1073741824, -- 1 GB
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_profile_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. COURSES TABLE
CREATE TABLE \`courses\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(20) NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`sks\` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  \`color_hex\` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LECTURERS TABLE
CREATE TABLE \`lecturers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(120) NOT NULL,
  \`nip\` VARCHAR(30) NULL,
  \`email\` VARCHAR(100) NULL,
  \`phone\` VARCHAR(30) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CATEGORIES & FOLDERS TABLE
CREATE TABLE \`categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL UNIQUE,
  \`slug\` VARCHAR(50) NOT NULL UNIQUE,
  \`description\` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`folders\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`parent_id\` INT UNSIGNED NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`color\` VARCHAR(7) DEFAULT '#64748B',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_folder_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`folders\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DOCUMENTS TABLE
CREATE TABLE \`documents\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`category_id\` INT UNSIGNED NULL,
  \`course_id\` INT UNSIGNED NULL,
  \`folder_id\` INT UNSIGNED NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`original_name\` VARCHAR(255) NOT NULL,
  \`storage_path\` VARCHAR(255) NOT NULL,
  \`extension\` VARCHAR(20) NOT NULL,
  \`mime_type\` VARCHAR(100) NOT NULL,
  \`size_bytes\` BIGINT UNSIGNED NOT NULL,
  \`description\` TEXT NULL,
  \`is_favorite\` TINYINT(1) NOT NULL DEFAULT 0,
  \`deleted_at\` DATETIME NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_doc_search\` (\`name\`, \`extension\`),
  INDEX \`idx_doc_category\` (\`category_id\`),
  CONSTRAINT \`fk_doc_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_doc_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_doc_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_doc_folder\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folders\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TASKS TABLE
CREATE TABLE \`tasks\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`course_id\` INT UNSIGNED NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`lecturer_name\` VARCHAR(120) NULL,
  \`description\` TEXT NULL,
  \`given_date\` DATE NOT NULL,
  \`deadline\` DATETIME NOT NULL,
  \`priority\` ENUM('rendah', 'sedang', 'tinggi', 'mendesak') NOT NULL DEFAULT 'sedang',
  \`status\` ENUM('belum_dikerjakan', 'sedang_dikerjakan', 'menunggu_pengumpulan', 'selesai') NOT NULL DEFAULT 'belum_dikerjakan',
  \`reference_link\` VARCHAR(500) NULL,
  \`notes\` TEXT NULL,
  \`completed_at\` DATETIME NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_task_deadline\` (\`deadline\`),
  INDEX \`idx_task_status\` (\`status\`),
  CONSTRAINT \`fk_task_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_task_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TASK CHECKLISTS & ATTACHMENTS
CREATE TABLE \`task_checklists\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`task_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`is_completed\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_chk_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`task_attachments\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`task_id\` INT UNSIGNED NOT NULL,
  \`document_id\` INT UNSIGNED NULL,
  \`file_name\` VARCHAR(255) NOT NULL,
  \`file_path\` VARCHAR(255) NOT NULL,
  \`size_bytes\` BIGINT UNSIGNED NOT NULL,
  \`mime_type\` VARCHAR(100) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_att_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_att_doc\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SCHEDULES (ROSTER) TABLE
CREATE TABLE \`schedules\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`course_id\` INT UNSIGNED NULL,
  \`day\` ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
  \`course_name\` VARCHAR(100) NOT NULL,
  \`lecturer\` VARCHAR(120) NOT NULL,
  \`start_time\` TIME NOT NULL,
  \`end_time\` TIME NOT NULL,
  \`room\` VARCHAR(50) NOT NULL,
  \`building\` VARCHAR(100) NOT NULL,
  \`color\` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  \`notes\` TEXT NULL,
  \`sks\` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_sched_day_time\` (\`day\`, \`start_time\`),
  CONSTRAINT \`fk_sched_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_sched_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CALENDAR EVENTS
CREATE TABLE \`calendar_events\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`event_date\` DATE NOT NULL,
  \`start_time\` TIME NULL,
  \`end_time\` TIME NULL,
  \`category\` ENUM('deadline', 'kuliah', 'ujian', 'presentasi', 'pengumpulan', 'acara_pribadi') NOT NULL DEFAULT 'acara_pribadi',
  \`description\` TEXT NULL,
  \`color\` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  \`related_task_id\` INT UNSIGNED NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_event_date\` (\`event_date\`),
  CONSTRAINT \`fk_event_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_event_task\` FOREIGN KEY (\`related_task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. SAVED LINKS & SOCIAL LINKS
CREATE TABLE \`saved_links\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`course_id\` INT UNSIGNED NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`url\` VARCHAR(1000) NOT NULL,
  \`platform\` VARCHAR(100) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`is_favorite\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_link_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_link_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`social_links\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`platform\` VARCHAR(50) NOT NULL,
  \`url\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_social_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. NOTIFICATIONS & ACTIVITY LOGS
CREATE TABLE \`notifications\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`type\` ENUM('deadline', 'schedule', 'upload', 'system', 'warning') NOT NULL DEFAULT 'system',
  \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_notif_unread\` (\`user_id\`, \`is_read\`),
  CONSTRAINT \`fk_notif_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`activity_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`entity_type\` VARCHAR(50) NOT NULL,
  \`entity_id\` INT UNSIGNED NULL,
  \`description\` VARCHAR(255) NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_log_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. APPLICATION SETTINGS
CREATE TABLE \`application_settings\` (
  \`key_name\` VARCHAR(100) PRIMARY KEY,
  \`key_value\` TEXT NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SEED DATA AWAL (INITIAL DATA)
-- Kredensial: Username: ITEKA | Password: EKAIT26
-- Hash password dibuat via password_hash('EKAIT26', PASSWORD_BCRYPT)
-- ========================================================

-- User ITEKA (Password hash untuk EKAIT26)
INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`role\`) VALUES 
(1, 'ITEKA', '$2y$10$wK1W.Qj9q3Z5E8LpYv/n7OBb2Qd9eQ0Wl9P4O6N4f0b2f8e/jKzSa', 'student');

-- Profil Eka Merdeka
INSERT INTO \`profiles\` (\`user_id\`, \`name\`, \`study_program\`, \`university\`, \`batch\`, \`bio\`, \`email\`, \`phone\`, \`storage_used_bytes\`, \`storage_limit_bytes\`) VALUES 
(1, 'Eka Merdeka', 'Informatika', 'Universitas Pilihan Mahasiswa', '2026', 'Mahasiswa Informatika yang tertarik pada pemrograman, jaringan komputer, dan cybersecurity.', 'ekamerdeka144@gmail.com', '+62 812-3456-7890', 34850000, 524288000);

-- Mata Kuliah Awal
INSERT INTO \`courses\` (\`id\`, \`code\`, \`name\`, \`sks\`, \`color_hex\`) VALUES
(1, 'IF2101', 'Pemrograman Dasar', 3, '#3B82F6'),
(2, 'IF2102', 'Sistem Basis Data', 3, '#06B6D4'),
(3, 'IF2103', 'Jaringan Komputer', 3, '#10B981'),
(4, 'IF2104', 'Struktur Data & Algoritma', 3, '#F59E0B'),
(5, 'IF2105', 'Kecerdasan Buatan', 3, '#EC4899'),
(6, 'IF2106', 'Etika Profesi & Hukum Cyber', 2, '#8B5CF6');

-- Kategori Dokumen
INSERT INTO \`categories\` (\`name\`, \`slug\`, \`description\`) VALUES
('Materi Kuliah', 'materi-kuliah', 'Bahan ajar, modul, buku referensi perkuliahan'),
('Presentasi PPT', 'presentasi-ppt', 'Slide materi kuliah dan presentasi tugas mahasiswa'),
('Tugas & Laporan', 'tugas-laporan', 'Laporan praktikum, tugas makalah, dan paper'),
('Source Code', 'source-code', 'Script koding, query SQL, proyek praktikum'),
('Desain', 'desain', 'Diagram arsitektur, UI/UX export, poster proyek'),
('Dokumen Administrasi', 'dokumen-administrasi', 'KRS, KHS, surat izin, lembar pengesahan'),
('Referensi', 'referensi', 'Jurnal ilmiah, paper IEEE, ebook tambahan');

-- Social Links Awal
INSERT INTO \`social_links\` (\`user_id\`, \`platform\`, \`url\`) VALUES
(1, 'LinkedIn', 'https://linkedin.com/in/eka-merdeka'),
(1, 'GitHub', 'https://github.com/eka-merdeka'),
(1, 'Discord', 'https://discordapp.com/users/ekamerdeka');

-- Pengaturan Sistem
INSERT INTO \`application_settings\` (\`key_name\`,\`key_value\`) VALUES
('app_name', 'ITEKA Academic Hub'),
('tagline', 'One Space for All Your Academic Needs'),
('timezone', 'Asia/Jakarta'),
('max_upload_size_mb', '64');
`;

export const PHP_PROJECT_FILES: PhpFileDefinition[] = [
  {
    path: 'config/database.php',
    description: 'Koneksi database PDO yang aman dengan UTF8MB4 & prepared statements',
    content: `<?php
/**
 * ITEKA Academic Hub — Database Connection
 * Standard PDO connection with prepared statements & security hardening
 */

declare(strict_types=1);

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'iteka_academic_hub');
define('DB_USER', 'root');
define('DB_PASS', ''); // Default XAMPP password is empty

class Database {
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                DB_HOST,
                DB_PORT,
                DB_NAME
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Jangan bocorkan password atau host di browser produksi
                error_log("Database Connection Error: " . $e->getMessage());
                http_response_code(500);
                die(json_encode([
                    'status' => 'error',
                    'message' => 'Gagal terhubung ke database MySQL. Pastikan service MySQL di XAMPP sudah aktif.'
                ]));
            }
        }

        return self::$instance;
    }
}
`,
  },
  {
    path: 'config/app.php',
    description: 'Konfigurasi aplikasi, allowlist upload file, limit keamanan, dan zona waktu Asia/Jakarta',
    content: `<?php
/**
 * ITEKA Academic Hub — Application Config & Security Allowlist
 */

declare(strict_types=1);

// Set zona waktu resmi sesuai kebutuhan akademik
date_default_timezone_set('Asia/Jakarta');

define('APP_NAME', 'ITEKA Academic Hub');
define('APP_TAGLINE', 'One Space for All Your Academic Needs');
define('BASE_URL', 'http://localhost/iteka-academic-hub');
define('STORAGE_PATH', __DIR__ . '/../storage/uploads');

// Batas ukuran file per upload (64MB)
define('MAX_UPLOAD_SIZE', 64 * 1024 * 1024);

/**
 * ALLOWLIST KEAMANAN UPLOAD DOKUMEN
 * Secara mutlak MENOLAK file video dan file musik/audio
 */
define('ALLOWED_EXTENSIONS', [
    // Dokumen teks & presentasi
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'md',
    // Arsip kompresi
    'zip', 'rar', '7z',
    // Gambar visual & desain
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
    // Desain / creative (jika ada)
    'psd', 'ai',
    // Source code akademik & script
    'py', 'php', 'html', 'css', 'js', 'json', 'sql', 'xml', 'c', 'cpp', 'java'
]);

/**
 * BLACKLIST MUTLAK: Video dan Audio / Musik
 */
define('FORBIDDEN_EXTENSIONS', [
    // Video
    'mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv', 'm4v', '3gp',
    // Audio / Musik
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus', 'midi'
]);

// Allowed MIME types
define('ALLOWED_MIME_TYPES', [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/html',
    'text/css',
    'application/javascript',
    'application/json',
    'application/sql',
    'application/xml',
    'text/x-python',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
]);
`,
  },
  {
    path: 'includes/auth.php',
    description: 'Sistem autentikasi session aman, password_hash(), rate limiting & CSRF',
    content: `<?php
/**
 * ITEKA Academic Hub — Secure Authentication Layer
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';

// Konfigurasi session cookie aman
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

class Auth {
    private const MAX_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    public static function check(): bool {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    public static function user(): ?array {
        if (!self::check()) {
            return null;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT u.id, u.username, u.role, p.name, p.study_program, p.university, p.batch, p.avatar_url 
                               FROM users u 
                               LEFT JOIN profiles p ON u.id = p.user_id 
                               WHERE u.id = :id');
        $stmt->execute(['id' => $_SESSION['user_id']]);
        return $stmt->fetch() ?: null;
    }

    public static function requireLogin(): void {
        if (!self::check()) {
            header('Location: ' . BASE_URL . '/login.php');
            exit;
        }
    }

    public static function login(string $username, string $password): array {
        $db = Database::getConnection();

        // 1. Ambil data user
        $stmt = $db->prepare('SELECT id, username, password_hash, failed_login_attempts, lockout_until FROM users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'message' => 'Username atau password tidak valid.'];
        }

        // 2. Cek pembatasan lockout
        if ($user['lockout_until'] && strtotime($user['lockout_until']) > time()) {
            $remaining = ceil((strtotime($user['lockout_until']) - time()) / 60);
            return [
                'success' => false, 
                'message' => "Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba {$remaining} menit lagi."
            ];
        }

        // 3. Verifikasi password_hash() dengan password_verify()
        if (password_verify($password, $user['password_hash'])) {
            // Reset counter failed attempts
            $update = $db->prepare('UPDATE users SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = NOW() WHERE id = :id');
            $update->execute(['id' => $user['id']]);

            // Regenerate session id untuk mencegah session fixation
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['login_time'] = time();

            return ['success' => true, 'message' => 'Login berhasil.'];
        } else {
            $attempts = $user['failed_login_attempts'] + 1;
            $lockout = null;

            if ($attempts >= self::MAX_ATTEMPTS) {
                $lockout = date('Y-m-d H:i:s', time() + (self::LOCKOUT_MINUTES * 60));
            }

            $update = $db->prepare('UPDATE users SET failed_login_attempts = :att, lockout_until = :lock WHERE id = :id');
            $update->execute(['att' => $attempts, 'lock' => $lockout, 'id' => $user['id']]);

            return ['success' => false, 'message' => 'Username atau password salah. Percobaan ke-' . $attempts . ' dari ' . self::MAX_ATTEMPTS];
        }
    }

    public static function changePassword(int $userId, string $oldPassword, string $newPassword): array {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT password_hash FROM users WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($oldPassword, $row['password_hash'])) {
            return ['success' => false, 'message' => 'Password lama Anda tidak sesuai.'];
        }

        if (strlen($newPassword) < 6) {
            return ['success' => false, 'message' => 'Password baru minimal 6 karakter.'];
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $update = $db->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
        $update->execute(['hash' => $newHash, 'id' => $userId]);

        return ['success' => true, 'message' => 'Password berhasil diperbarui.'];
    }

    public static function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}
`,
  },
  {
    path: 'includes/csrf.php',
    description: 'Proteksi CSRF token untuk semua form dan request AJAX',
    content: `<?php
/**
 * ITEKA Academic Hub — CSRF Protection
 */

declare(strict_types=1);

class CSRF {
    public static function generateToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function validateToken(?string $token): bool {
        if (empty($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    public static function field(): string {
        $token = self::generateToken();
        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }
}
`,
  },
  {
    path: 'includes/functions.php',
    description: 'Fungsi utility, sanitasi input XSS, validator upload file, kalkulator deadline',
    content: `<?php
/**
 * ITEKA Academic Hub — Helper Functions & File Security Validation
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

function e(?string $string): string {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function formatBytes(int $bytes, int $precision = 2): string {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, $precision) . ' ' . $units[$pow];
}

/**
 * Validasi File Keamanan Berlapis
 * Menolak video & audio secara mutlak
 */
function validateUploadedFile(array $file): array {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['valid' => false, 'error' => 'Parameter file tidak valid.'];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'Ukuran file melebihi batas upload_max_filesize di php.ini.',
            UPLOAD_ERR_FORM_SIZE => 'Ukuran file melebihi batas form.',
            UPLOAD_ERR_PARTIAL => 'File hanya terunggah sebagian.',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file yang dipilih.',
        ];
        return ['valid' => false, 'error' => $errors[$file['error']] ?? 'Error upload tidak diketahui.'];
    }

    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['valid' => false, 'error' => 'Ukuran file melebihi batas maksimal 64 MB.'];
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    // Cek apakah ekstensi termasuk blacklist audio / video
    if (in_array($extension, FORBIDDEN_EXTENSIONS, true)) {
        return [
            'valid' => false, 
            'error' => 'KEAMANAN: Format file video dan audio/musik DITOLAK oleh kebijakan akademik hub.'
        ];
    }

    // Cek allowlist ekstensi
    if (!in_array($extension, ALLOWED_EXTENSIONS, true)) {
        return [
            'valid' => false, 
            'error' => "Format file '.{$extension}' tidak diizinkan. Hanya dokumen, materi, presentasi, dan gambar yang diperbolehkan."
        ];
    }

    // Verifikasi MIME type asli menggunakan finfo
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (str_starts_with($mimeType, 'video/') || str_starts_with($mimeType, 'audio/')) {
        return [
            'valid' => false,
            'error' => 'KEAMANAN: MIME Type konten file terdeteksi sebagai Video atau Audio. File ditolak.'
        ];
    }

    return [
        'valid' => true,
        'extension' => $extension,
        'mime_type' => $mimeType,
        'safe_name' => bin2hex(random_bytes(16)) . '.' . $extension
    ];
}

/**
 * Perhitungan sisa waktu deadline berdasarkan zona waktu Asia/Jakarta
 */
function getDeadlineStatus(string $deadlineDateTime, string $status): array {
    if ($status === 'selesai') {
        return ['label' => 'Selesai', 'class' => 'text-emerald-400', 'badge' => 'completed', 'is_overdue' => false];
    }

    $deadline = new DateTime($deadlineDateTime, new DateTimeZone('Asia/Jakarta'));
    $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
    $diff = $now->diff($deadline);

    if ($now > $deadline) {
        return [
            'label' => 'Terlambat ' . ($diff->days > 0 ? "{$diff->days} hari" : "{$diff->h} jam"),
            'class' => 'text-rose-500 font-semibold',
            'badge' => 'overdue',
            'is_overdue' => true
        ];
    }

    if ($diff->days === 0) {
        return [
            'label' => "Jatuh tempo HARI INI ({$diff->h} jam lagi)",
            'class' => 'text-amber-400 font-semibold',
            'badge' => 'today',
            'is_overdue' => false
        ];
    }

    if ($diff->days <= 7) {
        return [
            'label' => "Mendekati deadline ({$diff->days} hari lagi)",
            'class' => 'text-amber-300',
            'badge' => 'approaching',
            'is_overdue' => false
        ];
    }

    return [
        'label' => "{$diff->days} hari lagi",
        'class' => 'text-slate-400',
        'badge' => 'normal',
        'is_overdue' => false
    ];
}
`,
  },
  {
    path: 'api/documents.php',
    description: 'API endpoint upload, daftar, preview, dan hapus dokumen dengan perlindungan autentikasi',
    content: `<?php
/**
 * ITEKA Academic Hub — Document Vault API
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

Auth::requireLogin();
$db = Database::getConnection();
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// GET: Ambil daftar dokumen dengan filter dan pencarian
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    $category = trim($_GET['category'] ?? '');
    $format = trim($_GET['format'] ?? '');

    $sql = "SELECT d.*, c.name AS category_name, co.name AS course_name 
            FROM documents d 
            LEFT JOIN categories c ON d.category_id = c.id 
            LEFT JOIN courses co ON d.course_id = co.id 
            WHERE d.user_id = :user_id AND d.deleted_at IS NULL";
    
    $params = ['user_id' => $userId];

    if ($search !== '') {
        $sql .= " AND (d.name LIKE :search OR d.description LIKE :search OR d.original_name LIKE :search)";
        $params['search'] = "%{$search}%";
    }

    if ($category !== '' && $category !== 'Semua') {
        $sql .= " AND c.name = :category";
        $params['category'] = $category;
    }

    if ($format !== '' && $format !== 'Semua') {
        $sql .= " AND d.extension = :format";
        $params['format'] = strtolower($format);
    }

    $sql .= " ORDER BY d.id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $docs = $stmt->fetchAll();

    jsonResponse(['status' => 'success', 'data' => $docs]);
}

// POST: Upload dokumen baru
if ($method === 'POST') {
    if (!isset($_FILES['file'])) {
        jsonResponse(['status' => 'error', 'message' => 'Tidak ada file diunggah.'], 400);
    }

    $validation = validateUploadedFile($_FILES['file']);
    if (!$validation['valid']) {
        jsonResponse(['status' => 'error', 'message' => $validation['error']], 422);
    }

    $originalName = basename($_FILES['file']['name']);
    $fileSize = $_FILES['file']['size'];
    $mimeType = $validation['mime_type'];
    $extension = $validation['extension'];
    $storageFileName = $validation['safe_name'];

    // Buat direktori penyimpanan aman
    if (!is_dir(STORAGE_PATH)) {
        mkdir(STORAGE_PATH, 0755, true);
    }

    $targetPath = STORAGE_PATH . '/' . $storageFileName;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        jsonResponse(['status' => 'error', 'message' => 'Gagal memindahkan file ke direktori penyimpanan server.'], 500);
    }

    $categoryId = !empty($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    $courseId = !empty($_POST['course_id']) ? (int)$_POST['course_id'] : null;
    $description = trim($_POST['description'] ?? '');

    $stmt = $db->prepare("INSERT INTO documents 
        (user_id, category_id, course_id, name, original_name, storage_path, extension, mime_type, size_bytes, description) 
        VALUES (:uid, :cid, :coid, :name, :orig, :path, :ext, :mime, :size, :desc)");

    $stmt->execute([
        'uid' => $userId,
        'cid' => $categoryId,
        'coid' => $courseId,
        'name' => $originalName,
        'orig' => $originalName,
        'path' => $storageFileName,
        'ext' => $extension,
        'mime' => $mimeType,
        'size' => $fileSize,
        'desc' => $description
    ]);

    // Update profil storage_used
    $db->prepare("UPDATE profiles SET storage_used_bytes = storage_used_bytes + :size WHERE user_id = :uid")
       ->execute(['size' => $fileSize, 'uid' => $userId]);

    jsonResponse([
        'status' => 'success', 
        'message' => "File {$originalName} berhasil disimpan.",
        'id' => $db->lastInsertId()
    ]);
}
`,
  },
  {
    path: 'api/tasks.php',
    description: 'API endpoint manajemen tugas kuliah, status kanban, dan checklists',
    content: `<?php
/**
 * ITEKA Academic Hub — Tasks API
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

Auth::requireLogin();
$db = Database::getConnection();
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT t.*, c.name AS course_title 
                          FROM tasks t 
                          LEFT JOIN courses c ON t.course_id = c.id 
                          WHERE t.user_id = :uid 
                          ORDER BY t.deadline ASC");
    $stmt->execute(['uid' => $userId]);
    $tasks = $stmt->fetchAll();

    foreach ($tasks as &$task) {
        // Ambil checklist
        $chkStmt = $db->prepare("SELECT id, title, is_completed FROM task_checklists WHERE task_id = :tid");
        $chkStmt->execute(['tid' => $task['id']]);
        $task['checklists'] = $chkStmt->fetchAll();
    }

    jsonResponse(['status' => 'success', 'data' => $tasks]);
}

if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $title = trim($raw['title'] ?? '');
    $courseId = !empty($raw['course_id']) ? (int)$raw['course_id'] : null;
    $lecturer = trim($raw['lecturer_name'] ?? '');
    $desc = trim($raw['description'] ?? '');
    $givenDate = $raw['given_date'] ?? date('Y-m-d');
    $deadline = $raw['deadline'] ?? date('Y-m-d H:i:s');
    $priority = in_array($raw['priority'] ?? '', ['rendah','sedang','tinggi','mendesak']) ? $raw['priority'] : 'sedang';
    $status = in_array($raw['status'] ?? '', ['belum_dikerjakan','sedang_dikerjakan','menunggu_pengumpulan','selesai']) ? $raw['status'] : 'belum_dikerjakan';

    $stmt = $db->prepare("INSERT INTO tasks (user_id, course_id, title, lecturer_name, description, given_date, deadline, priority, status) 
                          VALUES (:uid, :cid, :title, :lec, :desc, :gdate, :ddate, :pri, :stat)");
    $stmt->execute([
        'uid' => $userId,
        'cid' => $courseId,
        'title' => $title,
        'lec' => $lecturer,
        'desc' => $desc,
        'gdate' => $givenDate,
        'ddate' => $deadline,
        'pri' => $priority,
        'stat' => $status
    ]);

    jsonResponse(['status' => 'success', 'id' => $db->lastInsertId()]);
}
`,
  },
  {
    path: '.htaccess',
    description: 'Konfigurasi Apache untuk perlindungan direktori storage & mod_rewrite',
    content: `# ITEKA Academic Hub — Apache Security Rules
Options -Indexes

# Lindungi file konfigurasi sensitif dan schema.sql
<FilesMatch "^(schema\\.sql|database\\.php|app\\.php|\\.env)">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Header keamanan dasar
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
`,
  },
  {
    path: 'README.md',
    description: 'Panduan lengkap XAMPP, phpMyAdmin, Localhost, Backup, dan Deploy Hosting',
    content: `# ITEKA Academic Hub — Personal Student Management System
Tagline: *One Space for All Your Academic Needs.*

Aplikasi web manajemen akademik pribadi untuk mahasiswa. Menyimpan, mengelola, mencari, dan memantau tugas kuliah, file presentasi, dokumen, link tugas, jadwal kuliah, dan deadline dalam satu dashboard.

---

## 1. Kredensial Login Awal
- **URL Login**: \`http://localhost/iteka-academic-hub/login.php\`
- **Username**: \`ITEKA\`
- **Password**: \`EKAIT26\`

*(Password terenkripsi dengan aman di database menggunakan algoritma standard PHP \`password_hash($pass, PASSWORD_BCRYPT)\`)*

---

## 2. Persyaratan Sistem
- Web Server: Apache (XAMPP 8.2+ disarankan)
- PHP: Versi 8.2 atau lebih baru (dengan ekstensi \`pdo_mysql\`, \`mbstring\`, \`fileinfo\`)
- Database: MySQL 8.0+ atau MariaDB 10.4+

---

## 3. Langkah Instalasi di XAMPP (Localhost)

### Langkah 1: Siapkan Folder Proyek di XAMPP
1. Buka folder instalasi XAMPP di komputer Anda:
   - **Windows**: \`C:\\xampp\\htdocs\\\`
   - **macOS**: \`/Applications/XAMPP/xamppfiles/htdocs/\`
   - **Linux**: \`/opt/lampp/htdocs/\`
2. Buat folder baru bernama \`iteka-academic-hub\`.
3. Pindahkan seluruh file proyek ini ke dalam folder \`htdocs/iteka-academic-hub/\`.

### Langkah 2: Buat Database via phpMyAdmin
1. Buka aplikasi **XAMPP Control Panel** dan klik **Start** pada modul **Apache** dan **MySQL**.
2. Buka browser dan kunjungi: \`http://localhost/phpmyadmin\`
3. Klik menu **Databases (Basis Data)** di bagian atas.
4. Masukkan nama database: \`iteka_academic_hub\`, pilih Collation \`utf8mb4_unicode_ci\`, lalu klik **Create (Buat)**.
5. Klik database \`iteka_academic_hub\` yang baru saja dibuat di sidebar kiri.
6. Klik tab **Import (Impor)** di menu atas.
7. Klik tombol **Choose File (Pilih Berkas)** dan pilih file \`database/schema.sql\` dari folder proyek Anda.
8. Gulir ke bawah dan klik tombol **Import (Kirim)**.
9. Tunggu hingga muncul pesan hijau sukses: *"Import has been successfully finished."*

### Langkah 3: Konfigurasi File Koneksi
Buka file \`config/database.php\`. Pastikan konfigurasi sesuai dengan XAMPP Anda:
\`\`\`php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'iteka_academic_hub');
define('DB_USER', 'root');
define('DB_PASS', ''); // default password XAMPP adalah kosong
\`\`\`

### Langkah 4: Akses Aplikasi
1. Buka browser dan buka: \`http://localhost/iteka-academic-hub/\`
2. Masukkan username **ITEKA** dan password **EKAIT26**.
3. Selamat! Anda telah masuk ke dashboard ITEKA Academic Hub.

---

## 4. Konfigurasi Upload File di php.ini
Untuk memastikan upload file besar (sampai 64MB) berjalan lancar:
1. Di XAMPP Control Panel, klik tombol **Config** di baris Apache -> pilih **PHP (php.ini)**.
2. Cari dan sesuaikan nilai parameter berikut:
   \`\`\`ini
   upload_max_filesize = 64M
   post_max_size = 64M
   memory_limit = 256M
   max_execution_time = 300
   \`\`\`
3. Simpan file lalu **Restart Apache** (Stop -> Start).

---

## 5. Kebijakan Keamanan Upload File
- **DISETUJUI (Allowlist)**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, ZIP, RAR, 7Z, JPG, PNG, WEBP, GIF, SVG, PY, PHP, HTML, CSS, JS, JSON, SQL.
- **DITOLAK SECARA MUTLAK (Blacklist)**:
  - Format Video: MP4, MKV, AVI, MOV, WEBM, dll.
  - Format Audio/Musik: MP3, WAV, FLAC, AAC, OGG, dll.
- Verifikasi dilakukan berlapis melalui ekstensi file dan pembacaan MIME Type asli (\`finfo_file\`).

---

## 6. Panduan Backup & Restore Database
### Backup via Terminal / Command Prompt:
\`\`\`bash
mysqldump -u root -p iteka_academic_hub > backup_iteka_academic_hub.sql
\`\`\`
### Restore Database:
\`\`\`bash
mysql -u root -p iteka_academic_hub < backup_iteka_academic_hub.sql
\`\`\`

---

## 7. Panduan Deploy ke Hosting PHP & MySQL (cPanel / Hostinger / Niagahoster)
1. Buat database MySQL baru di cPanel melalui menu **MySQL Databases** (misal: \`u123_iteka\`).
2. Buat user database dan hubungkan dengan hak akses penuh (**ALL PRIVILEGES**).
3. Buka **phpMyAdmin** di cPanel dan import file \`database/schema.sql\`.
4. Kompres seluruh file proyek (kecuali folder non-PHP) menjadi file \`.zip\`.
5. Upload dan ekstrak file \`.zip\` tersebut ke dalam folder \`public_html\` (atau subdomain).
6. Edit file \`config/database.php\` sesuaikan dengan nama database, user, dan password dari hosting Anda.
7. Pastikan folder \`storage/uploads\` memiliki permission **755** atau **775**.
8. Buka domain Anda di browser untuk login.
`,
  },
];
