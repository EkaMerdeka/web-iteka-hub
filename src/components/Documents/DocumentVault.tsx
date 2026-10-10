import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Edit2,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Check,
  AlertTriangle,
  FolderPlus,
  Eye,
  FileCheck,
  HardDrive,
  CheckSquare,
  X,
  FileCode,
  Image as ImageIcon,
  FileType,
} from 'lucide-react';
import { AcademicDocument, DocumentCategory, UserProfile } from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentVaultProps {
  documents: AcademicDocument[];
  profile: UserProfile;
  onSaveDocuments: (docs: AcademicDocument[]) => void;
  onUpdateStorage: (deltaBytes: number) => void;
  onShowToast: (message: string, isError?: boolean) => void;
  filterInitialCategory?: DocumentCategory | 'Semua';
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  profile,
  onSaveDocuments,
  onUpdateStorage,
  onShowToast,
  filterInitialCategory = 'Semua',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(filterInitialCategory);
  const [selectedFormat, setSelectedFormat] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-select state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  // Modals state
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AcademicDocument | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Upload Form state
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Materi Kuliah');
  const [uploadCourse, setUploadCourse] = useState('Pemrograman Dasar');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: (DocumentCategory | 'Semua')[] = [
    'Semua',
    'Materi Kuliah',
    'Presentasi PPT',
    'Tugas & Laporan',
    'Source Code',
    'Desain',
    'Dokumen Administrasi',
    'Referensi',
  ];

  const formats = ['Semua', 'pdf', 'docx', 'pptx', 'xlsx', 'sql', 'png', 'py', 'zip'];

  // Security Blacklists: Video & Audio are strictly banned
  const FORBIDDEN_VIDEO = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv', 'm4v'];
  const FORBIDDEN_AUDIO = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'];

  const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (FORBIDDEN_VIDEO.includes(ext) || file.type.startsWith('video/')) {
        return {
          valid: false,
          error: `KEAMANAN: Berkas "${file.name}" terdeteksi sebagai VIDEO. Kebijakan akademik melarang penyimpanan file video di server.`,
        };
      }
      if (FORBIDDEN_AUDIO.includes(ext) || file.type.startsWith('audio/')) {
        return {
          valid: false,
          error: `KEAMANAN: Berkas "${file.name}" terdeteksi sebagai AUDIO/MUSIK. Kebijakan akademik melarang penyimpanan file audio di server.`,
        };
      }
      if (file.size > 64 * 1024 * 1024) {
        return {
          valid: false,
          error: `Ukuran file "${file.name}" melebihi batas 64 MB.`,
        };
      }
    }
    return { valid: true };
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validation = validateFiles(newFiles);
      if (!validation.valid) {
        setUploadError(validation.error || 'File tidak diizinkan.');
        return;
      }
      setUploadError(null);
      setUploadFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validation = validateFiles(newFiles);
      if (!validation.valid) {
        setUploadError(validation.error || 'File tidak diizinkan.');
        return;
      }
      setUploadError(null);
      setUploadFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      setUploadError('Pilih setidaknya satu file untuk diunggah.');
      return;
    }

    setUploadProgress(20);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      let totalAddedSize = 0;
      const newDocs: AcademicDocument[] = uploadFiles.map((file, idx) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
        totalAddedSize += file.size;
        return {
          id: `doc-${Date.now()}-${idx}`,
          name: file.name,
          original_name: file.name,
          extension: ext,
          mime_type: file.type || 'application/octet-stream',
          size: file.size,
          category: uploadCategory,
          course_name: uploadCourse,
          description: uploadDesc || `Berkas ${uploadCategory} untuk ${uploadCourse}`,
          tags: [uploadCategory.split(' ')[0], ext.toUpperCase()],
          is_favorite: false,
          upload_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const updated = [...newDocs, ...documents];
      onSaveDocuments(updated);
      onUpdateStorage(totalAddedSize);

      setUploadProgress(null);
      setUploadFiles([]);
      setUploadDesc('');
      setIsUploadModalOpen(false);
      onShowToast(`${newDocs.length} berkas berhasil diunggah ke vault.`);
    }, 800);
  };

  // Single file download trigger
  const handleDownload = (doc: AcademicDocument) => {
    const dummyContent = `ACADEMICMERDEKA ARCHIVE\nFile: ${doc.name}\nCategory: ${doc.category}\nDate: ${doc.upload_date}\n\nKonten berkas akademik mahasiswa.`;
    const blob = new Blob([dummyContent], { type: doc.mime_type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Mengunduh berkas: ${doc.name}`);
  };

  // Toggle favorite
  const handleToggleFavorite = (docId: string) => {
    const updated = documents.map((d) =>
      d.id === docId ? { ...d, is_favorite: !d.is_favorite } : d
    );
    onSaveDocuments(updated);
  };

  // Delete handlers
  const handleDeleteSelected = () => {
    let freedBytes = 0;
    const remaining = documents.filter((d) => {
      if (selectedDocIds.includes(d.id)) {
        freedBytes += d.size;
        return false;
      }
      return true;
    });

    onSaveDocuments(remaining);
    onUpdateStorage(-freedBytes);
    setSelectedDocIds([]);
    setIsDeleteConfirmOpen(false);
    onShowToast(`${selectedDocIds.length} berkas berhasil dihapus.`);
  };

  // Edit Doc metadata
  const handleSaveEditDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const updated = documents.map((d) => (d.id === editingDoc.id ? editingDoc : d));
    onSaveDocuments(updated);
    setEditingDoc(null);
    onShowToast('Metadata dokumen berhasil diperbarui.');
  };

  // Filtering & Sorting
  const filteredDocs = documents
    .filter((doc) => {
      const matchSearch =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'Semua' || doc.category === selectedCategory;

      const matchFormat =
        selectedFormat === 'Semua' ||
        doc.extension.toLowerCase() === selectedFormat.toLowerCase();

      return matchSearch && matchCategory && matchFormat;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'size') {
        return sortOrder === 'asc' ? a.size - b.size : b.size - a.size;
      }
      // date
      return sortOrder === 'asc'
        ? new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
        : new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
    });

  const storageUsedMB = (profile.storage_used / (1024 * 1024)).toFixed(1);
  const storageLimitMB = (profile.storage_limit / (1024 * 1024)).toFixed(0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Storage Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Document Vault · Total {documents.length} Berkas (Kapasitas 1 GB)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pusat Penyimpanan Dokumen Akademik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Simpan modul PDF, materi presentasi PPT, laporan praktikum, source code, dan desain tanpa batasan format selain video & audio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Berkas Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokumen, tag, deskripsi..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2 text-[11px] text-slate-500">Format:</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {formats.map((f) => (
                  <option key={f} value={f} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2 text-[11px] text-slate-500">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="date" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Tanggal Upload</option>
                <option value="name" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Nama File</option>
                <option value="size" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Ukuran</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-0.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-mono text-xs cursor-pointer"
                title="Ganti Urutan"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Grid / List switch */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Tampilan Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Tampilan Tabel List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800/80 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bulk Action Strip if files selected */}
        {selectedDocIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between text-xs text-cyan-800 dark:text-cyan-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{selectedDocIds.length} berkas dipilih</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDocIds([])}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal Pilihan
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents Display: Grid or List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center transition-colors">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Tidak ada dokumen ditemukan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ada berkas yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setSelectedFormat('Semua');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            const sizeMB = (doc.size / (1024 * 1024)).toFixed(1);

            return (
              <div
                key={doc.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all hover:shadow-lg flex flex-col justify-between group relative ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:ring-cyan-500/50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                {/* Checkbox and Favorite top row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id));
                        } else {
                          setSelectedDocIds([...selectedDocIds, doc.id]);
                        }
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.extension}
                      </span>
                      <button
                        onClick={() => handleToggleFavorite(doc.id)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          doc.is_favorite
                            ? 'text-amber-500 hover:text-amber-400'
                            : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
                        }`}
                        title="Favorit"
                      >
                        <Star className={`w-3.5 h-3.5 ${doc.is_favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview trigger */}
                  <div
                    onClick={() => setPreviewDoc(doc)}
                    className="cursor-pointer space-y-1"
                  >
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-relaxed">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {doc.description || 'Tidak ada catatan tambahan.'}
                    </p>
                  </div>
                </div>

                {/* Metadata & Actions Bottom Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span className="truncate max-w-[140px]">{doc.category}</span>
                    <span className="font-mono">{sizeMB} MB</span>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      Preview
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Info"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Unduh File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedDocIds.length > 0 &&
                        selectedDocIds.length === filteredDocs.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocIds(filteredDocs.map((d) => d.id));
                        } else {
                          setSelectedDocIds([]);
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-700"
                    />
                  </th>
                  <th className="p-3">Nama Berkas</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Mata Kuliah</th>
                  <th className="p-3 text-right">Ukuran</th>
                  <th className="p-3 text-right">Tanggal Upload</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  const sizeMB = (doc.size / (1024 * 1024)).toFixed(2);

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-50 dark:bg-cyan-500/10' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id));
                            } else {
                              setSelectedDocIds([...selectedDocIds, doc.id]);
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-700"
                        />
                      </td>
                      <td className="p-3">
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          className="cursor-pointer flex items-center gap-2 group"
                        >
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            {doc.extension}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 block transition-colors">
                              {doc.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-sm">
                              {doc.description || '-'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{doc.category}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {doc.course_name || '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {sizeMB} MB
                      </td>
                      <td className="p-3 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {doc.upload_date.split('T')[0]}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Preview Berkas"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Unduh Berkas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingDoc(doc)}
                            className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

      {/* UPLOAD MODAL WITH DRAG & DROP & PROGRESS */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadFiles([]);
                setUploadError(null);
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Dokumen Vault (1 GB)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Simpan materi, tugas, slide, dan kode akademik</p>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-relaxed">{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40"
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mx-auto mb-2 animate-bounce duration-1000" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Tarik & Lepaskan File di Sini, atau Klik untuk Memilih
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung PDF, DOCX, PPTX, XLSX, TXT, ZIP, PNG, JPG, SQL, PY (Maks 64 MB per file)
                </p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                  * Kebijakan keamanan: File video (.mp4 dll) dan file audio/musik (.mp3 dll) DITOLAK otomatis.
                </p>
              </div>

              {/* Selected files preview */}
              {uploadFiles.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {uploadFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-300 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <span className="truncate max-w-[280px] font-mono text-[11px]">{file.name}</span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {categories
                      .filter((c) => c !== 'Semua')
                      .map((c) => (
                        <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                  <input
                    type="text"
                    value={uploadCourse}
                    onChange={(e) => setUploadCourse(e.target.value)}
                    placeholder="Contoh: Basis Data"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi / Catatan Berkas</label>
                <textarea
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Keterangan isi materi, bab, atau instruksi tugas..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Progress bar */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                    <span>Mengunggah file ke vault...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-2 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadProgress !== null}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Mulai Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setEditingDoc(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Edit Metadata Dokumen</h3>

            <form onSubmit={handleSaveEditDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Berkas</label>
                <input
                  type="text"
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                <select
                  value={editingDoc.category}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, category: e.target.value as DocumentCategory })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {categories
                    .filter((c) => c !== 'Semua')
                    .map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                <input
                  type="text"
                  value={editingDoc.course_name || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, course_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                <textarea
                  value={editingDoc.description}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Konfirmasi Hapus Berkas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-rose-600 dark:text-rose-300">{selectedDocIds.length} berkas</strong> ini secara permanen dari vault dan database? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};
