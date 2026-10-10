import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Star,
  Trash2,
  Edit2,
  Check,
  Folder,
  Globe,
  Github,
  Figma,
  Share2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { SavedLink } from '../../types';

interface LinkManagerProps {
  links: SavedLink[];
  onSaveLinks: (links: SavedLink[]) => void;
  onShowToast: (message: string) => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  links,
  onSaveLinks,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Semua');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [confirmExternalUrl, setConfirmExternalUrl] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Google Drive');
  const [category, setCategory] = useState('Materi & Referensi');
  const [courseName, setCourseName] = useState('Pemrograman Dasar');
  const [description, setDescription] = useState('');

  const platforms = [
    'Semua',
    'Google Drive',
    'Google Classroom',
    'Google Docs / Slides',
    'GitHub',
    'GitLab',
    'Figma',
    'Canva',
    'Moodle',
    'Website Kampus',
    'Lainnya',
  ];

  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'github':
      case 'gitlab':
        return <Github className="w-4 h-4 text-slate-100" />;
      case 'figma':
        return <Figma className="w-4 h-4 text-purple-400" />;
      case 'google drive':
        return <Folder className="w-4 h-4 text-emerald-400" />;
      default:
        return <Globe className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleCopy = (linkUrl: string) => {
    navigator.clipboard.writeText(linkUrl);
    onShowToast('Link berhasil disalin ke clipboard!');
  };

  const handleOpenExternal = (linkUrl: string) => {
    // Open in new tab
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleFavorite = (id: string) => {
    const updated = links.map((l) =>
      l.id === id ? { ...l, is_favorite: !l.is_favorite } : l
    );
    onSaveLinks(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus link ini dari daftar simpanan?')) {
      const updated = links.filter((l) => l.id !== id);
      onSaveLinks(updated);
      onShowToast('Link berhasil dihapus.');
    }
  };

  const handleOpenModal = (link?: SavedLink) => {
    if (link) {
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url);
      setPlatform(link.platform);
      setCategory(link.category);
      setCourseName(link.course_name || '');
      setDescription(link.description);
    } else {
      setEditingLink(null);
      setTitle('');
      setUrl('');
      setPlatform('Google Drive');
      setCategory('Materi & Referensi');
      setCourseName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (editingLink) {
      const updated = links.map((l) =>
        l.id === editingLink.id
          ? {
              ...l,
              title: title.trim(),
              url: url.trim(),
              platform,
              category,
              course_name: courseName.trim() || undefined,
              description: description.trim(),
            }
          : l
      );
      onSaveLinks(updated);
      onShowToast('Link berhasil diperbarui.');
    } else {
      const newLink: SavedLink = {
        id: `link-${Date.now()}`,
        title: title.trim(),
        url: url.trim(),
        platform,
        category,
        course_name: courseName.trim() || undefined,
        description: description.trim(),
        is_favorite: false,
        created_at: new Date().toISOString(),
      };
      onSaveLinks([newLink, ...links]);
      onShowToast('Link baru berhasil disimpan.');
    }

    setIsModalOpen(false);
  };

  // Filter
  const filteredLinks = links.filter((l) => {
    const matchSearch =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.course_name && l.course_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchPlatform =
      selectedPlatform === 'Semua' || l.platform === selectedPlatform;

    const matchFav = !onlyFavorites || l.is_favorite;

    return matchSearch && matchPlatform && matchFav;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <Link2 className="w-3.5 h-3.5" />
            <span>Link Manager · Total {links.length} Tautan Tersimpan</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pusat Tautan & Repository Akademik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simpan link Google Drive, Classroom, repository GitHub tugas, Figma wireframe, dan portal ujian dalam satu ruang kerja.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Simpan Tautan Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul link, URL, atau mata kuliah..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span>Favorit Saja</span>
            </button>
          </div>
        </div>

        {/* Platform pill chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800/80 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-lg flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-semibold block">
                      {link.platform}
                    </span>
                    <span className="text-[11px] text-slate-500">{link.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(link.id)}
                    className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title="Favorit"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        link.is_favorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleOpenModal(link)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {link.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {link.description || 'Tidak ada deskripsi tambahan.'}
              </p>

              {link.course_name && (
                <div className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Mata Kuliah: {link.course_name}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[170px]">
                {link.url}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(link.url)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Salin Tautan"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenExternal(link.url)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Buka di Tab Baru"
                >
                  <span>Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredLinks.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Link2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            Tidak ada link yang sesuai dengan pencarian Anda.
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {editingLink ? 'Edit Link Tersimpan' : 'Simpan Link Platform Baru'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Daftarkan tautan tugas, cloud drive, atau repositori koding
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Tautan *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Contoh: Repository GitHub Tugas OOP"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">URL / Tautan *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {platforms
                      .filter((p) => p !== 'Semua')
                      .map((p) => (
                        <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                          {p}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Contoh: Source Code"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah Terkait</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Contoh: Pemrograman Dasar"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Tambahan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Keterangan isi tautan..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {editingLink ? 'Simpan Perubahan' : 'Simpan Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
