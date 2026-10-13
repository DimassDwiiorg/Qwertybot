import React, { useState } from 'react';
import {
  X,
  Code,
  Eye,
  Copy,
  Check,
  Download,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Sparkles
} from 'lucide-react';

export interface ArtifactData {
  title: string;
  language: string;
  code: string;
}

interface ArtifactModalProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({ artifact, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const isHtml = artifact.language.toLowerCase() === 'html';
  const isSvg = artifact.language.toLowerCase() === 'svg' || artifact.code.trim().startsWith('<svg');

  // Siapkan HTML lengkap untuk iframe preview
  const preparePreviewDoc = (): string => {
    if (isSvg) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f8fafc;
      font-family: system-ui, sans-serif;
    }
    svg {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
    }
  </style>
</head>
<body>
  ${artifact.code}
</body>
</html>`;
    }

    if (isHtml) {
      // Jika kode HTML tidak memiliki tag <!DOCTYPE html> atau <html>, bungkus rapi dengan Tailwind CDN untuk tampilan instan
      let code = artifact.code;
      if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
        code = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 p-4 min-h-screen">
  ${code}
</body>
</html>`;
      }
      return code;
    }

    // Default preview untuk markdown atau teks
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      padding: 20px;
      font-family: monospace;
      white-space: pre-wrap;
      background: #1e1e24;
      color: #e2e8f0;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>${artifact.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let ext = 'txt';
    let mime = 'text/plain';
    if (isHtml) {
      ext = 'html';
      mime = 'text/html';
    } else if (isSvg) {
      ext = 'svg';
      mime = 'image/svg+xml';
    } else if (artifact.language === 'javascript' || artifact.language === 'js') {
      ext = 'js';
      mime = 'application/javascript';
    } else if (artifact.language === 'css') {
      ext = 'css';
      mime = 'text/css';
    }

    const blob = new Blob([artifact.code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'qwertybot-artifact'}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const docHtml = preparePreviewDoc();
    const blob = new Blob([docHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[390px]'
  }[deviceViewport];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xl overflow-hidden transition-all">
        {/* Top Navbar Modal */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[#E5E3DB] dark:border-[#27272A] bg-[#F5F3EC] dark:bg-[#202024] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#DA7756]/15 text-[#DA7756]">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate text-[#23201D] dark:text-[#F4F4F5]">
                  {artifact.title || 'Live Artifact Preview'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase bg-[#DA7756]/10 text-[#DA7756] border border-[#DA7756]/20">
                  {artifact.language}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Tengah & Kanan */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Viewport switch (khusus preview) */}
            {activeTab === 'preview' && (isHtml || isSvg) && (
              <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border border-black/10 dark:border-white/10 text-[#65605B] dark:text-[#A1A1AA]">
                <button
                  type="button"
                  onClick={() => setDeviceViewport('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${deviceViewport === 'desktop' ? 'bg-white dark:bg-[#2E2E32] text-[#DA7756] shadow-xs' : 'hover:text-[#23201D] dark:hover:text-white'}`}
                  title="Tampilan Desktop"
                >
                  <Laptop size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport('tablet')}
                  className={`p-1.5 rounded-md transition-colors ${deviceViewport === 'tablet' ? 'bg-white dark:bg-[#2E2E32] text-[#DA7756] shadow-xs' : 'hover:text-[#23201D] dark:hover:text-white'}`}
                  title="Tampilan Tablet (768px)"
                >
                  <Tablet size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${deviceViewport === 'mobile' ? 'bg-white dark:bg-[#2E2E32] text-[#DA7756] shadow-xs' : 'hover:text-[#23201D] dark:hover:text-white'}`}
                  title="Tampilan Ponsel (390px)"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}

            {/* Toggle Tab: Preview vs Kode */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border border-black/10 dark:border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-[#2E2E32] text-[#23201D] dark:text-white shadow-xs font-semibold'
                    : 'text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-white'
                }`}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md transition-all ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-[#2E2E32] text-[#23201D] dark:text-white shadow-xs font-semibold'
                    : 'text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-white'
                }`}
              >
                <Code size={13} />
                <span>Kode</span>
              </button>
            </div>

            {/* Tombol Aksi: New Tab, Copy, Download */}
            {(isHtml || isSvg) && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="hidden sm:flex items-center gap-1 p-1.5 px-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs text-[#65605B] dark:text-[#A1A1AA] transition-colors"
                title="Buka di Tab Baru"
              >
                <ExternalLink size={13} />
                <span className="hidden md:inline">Tab Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs text-[#65605B] dark:text-[#A1A1AA] transition-colors"
              title="Salin Kode"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="hidden sm:inline">Salin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-[#DA7756] hover:bg-[#c9694a] text-white text-xs font-medium transition-colors shadow-xs"
              title="Unduh Berkas"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#65605B] dark:text-[#A1A1AA] hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 transition-colors"
              title="Tutup Preview"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Content Body Modal */}
        <div className="flex-1 min-h-0 bg-[#F1EFE8] dark:bg-[#121214] flex justify-center items-center overflow-hidden p-2 sm:p-4">
          {activeTab === 'preview' ? (
            <div className={`h-full ${viewportWidthClass} transition-all duration-300 rounded-xl overflow-hidden bg-white shadow-lg border border-black/10 flex flex-col`}>
              <iframe
                title="Artifact Preview Sandbox"
                srcDoc={preparePreviewDoc()}
                sandbox="allow-scripts allow-forms allow-modals"
                className="w-full h-full border-none bg-white"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#1E1E22] border border-white/10 flex flex-col">
              <pre className="p-4 sm:p-6 overflow-auto text-xs sm:text-sm font-mono text-[#F4F4F5] leading-relaxed [tab-size:2] flex-1">
                <code>{artifact.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
