import React from 'react';
import { X, Download, FileText, Image as ImageIcon, Code, ExternalLink } from 'lucide-react';
import { AcademicDocument } from '../../types';

interface DocumentPreviewModalProps {
  document: AcademicDocument | null;
  onClose: () => void;
  onDownload: (doc: AcademicDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onDownload,
}) => {
  if (!document) return null;

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(document.extension.toLowerCase());
  const isPdf = document.extension.toLowerCase() === 'pdf';
  const isCode = ['py', 'php', 'js', 'html', 'css', 'sql', 'json', 'md', 'txt'].includes(
    document.extension.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            ) : isCode ? (
              <Code className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{document.name}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {document.category} · {(document.size / (1024 * 1024)).toFixed(2)} MB · Ekstensi .{document.extension.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDownload(document)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/40 min-h-[350px]">
          {isImage ? (
            <div className="max-w-full max-h-[65vh] flex flex-col items-center">
              <img
                src={document.content_preview || '/src/assets/images/iteka_academic_illustration_1791559085074.jpg'}
                alt={document.name}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full rounded-lg shadow-lg object-contain border border-slate-200 dark:border-slate-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">{document.description}</p>
            </div>
          ) : isPdf ? (
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{document.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  {document.description || 'Dokumen PDF akademik siap dibaca atau diunduh.'}
                </p>
              </div>

              {/* Synthetic PDF viewer mock snippet */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-left text-xs font-mono text-slate-700 dark:text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span>Halaman 1 dari 14</span>
                  <span>Mata Kuliah: {document.course_name || 'Informatika'}</span>
                </div>
                <p className="text-cyan-700 dark:text-cyan-400"># ACADEMIC MERDEKA MODULE - 2026</p>
                <p>Topik: Fundamental Konsep dan Teori Implementasi</p>
                <p className="text-slate-600 dark:text-slate-400">Bab 1: Pendahuluan dan Lingkup Pembahasan</p>
                <p className="text-slate-500">
                  Dokumen ini merupakan materi kurikulum resmi program studi Informatika...
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onDownload(document)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Buka & Simpan PDF Asli
                </button>
              </div>
            </div>
          ) : isCode ? (
            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 mb-3">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-400" />
                  {document.name}
                </span>
                <span>Format .{document.extension}</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-3 bg-slate-900 rounded-lg leading-relaxed">
{document.extension === 'sql'
  ? `-- AcademicMerdeka SQL Export Preview
CREATE TABLE sample_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    assignment_name VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.00
);
INSERT INTO sample_data VALUES (1, 'AM2026', 'Tugas Praktikum', 98.50);`
  : document.extension === 'py'
  ? `# Python Source Code Preview
def evaluate_student_progress(completed_tasks, total_tasks):
    if total_tasks == 0:
        return 0.0
    return (completed_tasks / total_tasks) * 100

print(f"Status AcademicMerdeka Workspace: Ready!")`
  : `// Source Code File: ${document.name}
console.log("AcademicMerdeka - Personal Student File Viewer");`}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{document.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Format file <span className="font-mono text-cyan-600 dark:text-cyan-400">.{document.extension}</span> dapat langsung diunduh ke komputer Anda untuk dibuka di aplikasi eksternal (Word, Excel, PowerPoint, dsb).
              </p>
              <button
                onClick={() => onDownload(document)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tags:</span>
            {document.tags.map((t, idx) => (
              <span key={idx} className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                #{t}
              </span>
            ))}
          </div>
          <span className="font-mono text-[11px]">Diunggah: {document.upload_date.split('T')[0]}</span>
        </div>
      </div>
    </div>
  );
};
