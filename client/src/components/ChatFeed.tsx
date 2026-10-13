import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { preprocessLaTeX } from '../utils/markdownUtils.js';
import {
  Menu,
  Copy,
  Check,
  User,
  Image as ImageIcon,
  FileText,
  Mic,
  Brain,
  Square,
  LogOut,
  Sparkles,
  ChevronDown,
  Download,
  Lock,
  Terminal,
  Globe,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { Logo } from './Logo.js';
import { ChatMessage, SessionDetails, GoogleUser } from '../types/index.js';
import { AudioPlayer } from './AudioPlayer.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { exportChatToMarkdown, exportChatToText } from '../utils/exportUtils.js';

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'qwertybot 3.5 Lite', tag: 'Paling Cepat', desc: 'Sangat responsif, multimodal audio/foto/dokumen, pemrosesan kilat' },
  { id: 'gemini-flash-lite-latest', name: 'qwertybot 4.0 Standard', tag: 'Stabil', desc: 'Versi stabil serbaguna dengan pemahaman konteks seimbang' },
  { id: 'gemini-3.1-flash-lite', name: 'qwertybot 4.5 Turbo', tag: 'Turbo', desc: 'Ringan, gesit, dan adaptif untuk tugas percakapan dinamis' },
  { id: 'gemini-3.1-pro-preview', name: 'qwertybot 5.0 Pro', tag: 'Pro Tier', desc: 'Model penalaran kompleks, analisis mendalam, dan logika tinggi' }
];

interface ChatFeedProps {
  session: SessionDetails | null;
  isLoading: boolean;
  onOpenSidebar: () => void;
  onSendPresetMessage: (prompt: string) => void;
  onStopGeneration?: () => void;
  onRegenerate?: () => void;
  user?: GoogleUser | null;
  onLogout?: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isOwner?: boolean;
  isVpsUnlocked?: boolean;
  onOpenVpsModal?: () => void;
  activeToolEvent?: { name: string; args?: any; status: 'running' | 'done' } | null;
  onOpenArtifact?: (artifact: { title: string; language: string; code: string }) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  session,
  isLoading,
  onOpenSidebar,
  onSendPresetMessage,
  onStopGeneration,
  onRegenerate,
  user,
  onLogout,
  selectedModel,
  onSelectModel,
  isOwner,
  isVpsUnlocked,
  onOpenVpsModal,
  activeToolEvent,
  onOpenArtifact
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedSessionCode, setCopiedSessionCode] = useState(false);
  const [copiedFullMessageId, setCopiedFullMessageId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Model yang aktif saat ini dengan fallback aman jika model ID tidak terdaftar
  const currentModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Hook Text-to-Speech untuk membaca jawaban AI
  const { speakingMessageId, speak } = useTextToSpeech();

  // Auto scroll ke bawah saat ada pesan baru atau update streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isLoading]);

  const handleCopySessionCode = () => {
    if (!session?.sessionCode) return;
    navigator.clipboard.writeText(session.sessionCode);
    setCopiedSessionCode(true);
    setTimeout(() => setCopiedSessionCode(false), 2000);
  };

  const handleCopyCodeBlock = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyFullMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFullMessageId(id);
    setTimeout(() => setCopiedFullMessageId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      {/* Header Atas */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#E5E3DB] dark:border-[#27272A] bg-[#FAF9F5]/80 dark:bg-[#18181B]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-1.5 rounded-lg text-[#65605B] dark:text-[#A1A1AA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate text-[#23201D] dark:text-[#F4F4F5]">
              {session?.title || 'qwertybot AI'}
            </h2>
            <p className="text-[11px] text-[#8C8782] dark:text-[#71717A] truncate">
              Asisten AI Multimodal & Memori Sesi
            </p>
          </div>
        </div>

        {/* Header Right: Badge Session Code, Export, VPS Access, Model Selector & Google User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {session && (
            <button
              onClick={handleCopySessionCode}
              className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-mono transition-all text-[#4E443F] dark:text-[#D4D4D8] whitespace-nowrap"
              title="Klik untuk salin session code"
            >
              <span className="hidden sm:inline text-[#8C8782] dark:text-[#71717A] text-[10px] uppercase font-sans font-medium">
                Kode:
              </span>
              <span className="font-semibold text-[11px] sm:text-xs text-[#DA7756] tracking-tight">
                {session.sessionCode}
              </span>
              {copiedSessionCode ? (
                <Check size={11} className="text-emerald-500 shrink-0" />
              ) : (
                <Copy size={11} className="opacity-60 shrink-0" />
              )}
            </button>
          )}

          {/* Tombol Menu Ekspor Riwayat Percakapan */}
          {session && session.messages && session.messages.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(prev => !prev)}
                className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[#65605B] dark:text-[#A1A1AA] transition-colors"
                title="Ekspor Percakapan (.md / .txt)"
              >
                <Download size={14} />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 p-1.5 bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] rounded-xl shadow-xl z-40 animate-fade-in space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        exportChatToMarkdown(session);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-[#23201D] dark:text-[#F4F4F5] transition-colors"
                    >
                      <FileText size={13} className="text-[#DA7756]" />
                      <span>Ekspor Markdown (.md)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportChatToText(session);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-[#23201D] dark:text-[#F4F4F5] transition-colors"
                    >
                      <Download size={13} className="text-blue-500" />
                      <span>Ekspor Teks (.txt)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Owner VPS Access Button (Khusus dimassdwisyah@gmail.com) */}
          {isOwner && onOpenVpsModal && (
            <button
              type="button"
              onClick={onOpenVpsModal}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-xs font-medium transition-all shadow-2xs whitespace-nowrap ${
                isVpsUnlocked
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title={isVpsUnlocked ? 'Akses VPS Aktif (Owner Verified)' : 'Verifikasi Password VPS Diperlukan'}
            >
              {isVpsUnlocked ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold">VPS Aktif</span>
                </>
              ) : (
                <>
                  <Lock size={12} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-semibold">Verifikasi VPS</span>
                </>
              )}
            </button>
          )}

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelMenu(prev => !prev)}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#DA7756]/10 hover:bg-[#DA7756]/15 border border-[#DA7756]/20 text-xs transition-all text-[#DA7756] font-medium whitespace-nowrap"
              title="Pilih Versi Model qwertybot"
            >
              <Sparkles size={12} className="shrink-0" />
              <span className="hidden sm:inline text-[11px]">
                {currentModelObj.name}
              </span>
              <span className="sm:hidden text-[11px]">
                {currentModelObj.name.replace('qwertybot ', '')}
              </span>
              <ChevronDown size={12} className="opacity-70 shrink-0" />
            </button>

            {showModelMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowModelMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 p-2 bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] rounded-2xl shadow-xl z-40 animate-fade-in space-y-1">
                  <div className="px-2.5 py-1.5 border-b border-[#E5E3DB] dark:border-[#3F3F46]/60">
                    <p className="text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">Pilihan Versi Model</p>
                    <p className="text-[10px] text-[#8C8782] dark:text-[#71717A]">Pilih versi model kecerdasan qwertybot yang ingin digunakan</p>
                  </div>
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = m.id === selectedModel;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(m.id);
                          setShowModelMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-[#DA7756]/10 text-[#DA7756] border border-[#DA7756]/30'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#23201D] dark:text-[#F4F4F5]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{m.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-mono">
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8C8782] dark:text-[#71717A] leading-tight">
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* User profile picture or official Google login button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(prev => !prev)}
                className="w-7 h-7 rounded-full overflow-hidden border border-[#DA7756]/50 shadow-2xs shrink-0 cursor-pointer hover:ring-2 hover:ring-[#DA7756]/40 transition-all block focus:outline-none"
                title={`Masuk sebagai ${user.name || 'Pengguna'} (${user.email || ''}). Klik untuk kelola akun.`}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#DA7756]/20 text-[#DA7756] flex items-center justify-center font-bold text-[10px]">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown Menu Akun */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] rounded-2xl shadow-xl z-40 animate-fade-in">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5E3DB] dark:border-[#3F3F46]/60">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-[#DA7756]/40 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#DA7756]/20 text-[#DA7756] flex items-center justify-center font-bold text-xs border border-[#DA7756]/40 shrink-0">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5] truncate">
                          {user.name || 'Pengguna Google'}
                        </p>
                        <p className="text-[10px] text-[#8C8782] dark:text-[#71717A] truncate">
                          {user.email || ''}
                        </p>
                      </div>
                    </div>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full mt-2 py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={13} />
                        <span>Keluar / Ganti Akun</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <div id="google-btn-header" className="overflow-hidden rounded-full max-h-[32px]"></div>
            </div>
          )}
        </div>
      </header>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-6 space-y-6">
        {(!session || session.messages.length === 0) ? (
          /* Welcome Hero / Empty State */
          <div className="max-w-2xl mx-auto py-8 flex flex-col items-center text-center">
            <div className="mb-4">
              <Logo size={56} />
            </div>

            <h1 className="text-2xl font-serif font-medium tracking-tight text-[#23201D] dark:text-[#F4F4F5] mb-2">
              Halo, saya <span className="text-[#DA7756]">qwertybot</span>
            </h1>
            <p className="text-sm text-[#65605B] dark:text-[#A1A1AA] max-w-md mb-8 leading-relaxed">
              Saya adalah asisten AI multimodal cerdas yang siap membantu Anda menganalisis teks, gambar, berkas dokumen, kode program, dan rekaman suara (VN).
            </p>

            {/* Grid Kartu Fitur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left mb-6">
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  <ImageIcon size={15} className="text-[#DA7756]" />
                  <span>Membaca Gambar & Visual</span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                  Unggah foto atau screenshot, qwertybot akan mendeskripsikan dan menganalisis visualnya.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  <Mic size={15} className="text-[#DA7756]" />
                  <span>Mendengarkan Voice Note (VN)</span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                  Rekam suara Anda langsung dari browser via mic, qwertybot akan memahami dan merespon audio Anda.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  <Sparkles size={15} className="text-[#DA7756]" />
                  <span>Claude-Style Artifacts</span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                  Dapatkan kode HTML/SVG interaktif dengan preview live sandboxed langsung di web.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  <Brain size={15} className="text-[#DA7756]" />
                  <span>Session Code & Memori</span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                  Simpan kode sesi Anda untuk melanjutkan percakapan kapan saja tanpa lupa konteks.
                </p>
              </div>
            </div>

            {/* Rekomendasi Prompt */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              <button
                onClick={() => onSendPresetMessage('Buatkan saya tampilan kartu profil modern dengan tombol interaktif menggunakan HTML dan Tailwind CSS')}
                className="py-1.5 px-3 rounded-full text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#A1A1AA] transition-colors"
              >
                ✨ Buat Web UI (Artifacts)
              </button>
              <button
                onClick={() => onSendPresetMessage('Jelaskan apa saja kemampuan qwertybot dan bagaimana kamu bisa membantu saya hari ini?')}
                className="py-1.5 px-3 rounded-full text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#A1A1AA] transition-colors"
              >
                💡 Kemampuan qwertybot
              </button>
              <button
                onClick={() => onSendPresetMessage('Bagaimana cara mengirim voice note dan dokumen PDF ke kamu?')}
                className="py-1.5 px-3 rounded-full text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#A1A1AA] transition-colors"
              >
                🎙️ Cara kirim VN & Berkas
              </button>
            </div>
          </div>
        ) : (
          /* List of Messages */
          <div className="w-full max-w-3xl mx-auto space-y-6 min-w-0">
            {session.messages.map((msg: ChatMessage, index: number) => {
              const isUser = msg.role === 'user';
              const isLatestBotMessage = !isUser && index === session.messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`w-full flex gap-2.5 sm:gap-3.5 min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="shrink-0 mt-1">
                      <Logo size={28} />
                    </div>
                  )}

                  <div className={`min-w-0 flex flex-col gap-1.5 ${
                    isUser
                      ? 'max-w-[85%] sm:max-w-[78%] items-end'
                      : 'flex-1 max-w-[calc(100%-36px)] sm:max-w-[88%] items-start'
                  }`}>
                    {/* Render User Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1 max-w-full">
                        {msg.attachments.map(att => {
                          if (att.type === 'image' && (att.url || att.previewUrl)) {
                            return (
                              <a
                                key={att.id}
                                href={att.url || att.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl overflow-hidden border border-black/10 dark:border-white/10 hover:opacity-95 transition-opacity max-w-full"
                              >
                                <img
                                  src={att.url || att.previewUrl}
                                  alt={att.name}
                                  className="max-h-56 max-w-full rounded-xl object-contain bg-black/5 dark:bg-white/5"
                                />
                              </a>
                            );
                          }

                          if (att.type === 'audio' && (att.url || att.previewUrl)) {
                            return (
                              <AudioPlayer
                                key={att.id}
                                src={att.url || att.previewUrl || ''}
                                label={att.name}
                              />
                            );
                          }

                          return (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 p-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs max-w-full"
                            >
                              <FileText size={15} className="text-blue-500 shrink-0" />
                              <span className="font-medium truncate max-w-[160px]">
                                {att.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Chat Bubble Text */}
                    {msg.content && (
                      <div
                        className={`w-full min-w-0 text-sm leading-relaxed overflow-hidden break-words [overflow-wrap:anywhere] ${
                          isUser
                            ? 'w-auto max-w-full p-3.5 px-4 rounded-2xl bg-[#E5E3DB] dark:bg-[#27272A] text-[#23201D] dark:text-[#F4F4F5] rounded-br-xs'
                            : 'p-1 sm:p-2 bg-transparent text-[#23201D] dark:text-[#F4F4F5] pl-0 markdown-content'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                            {(() => {
                              const urlRegex = /(https?:\/\/[^\s]+)/gi;
                              const parts = msg.content.split(urlRegex);
                              return parts.map((part, pIdx) => {
                                if (/^https?:\/\//i.test(part)) {
                                  return (
                                    <a
                                      key={pIdx}
                                      href={part}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-lg bg-[#DA7756]/15 dark:bg-[#DA7756]/25 text-[#DA7756] dark:text-[#E07A5F] hover:underline font-mono font-medium text-xs break-all transition-colors"
                                    >
                                      <Globe size={13} className="shrink-0" />
                                      <span>{part}</span>
                                    </a>
                                  );
                                }
                                return part;
                              });
                            })()}
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                const codeId = Math.random().toString(36).substring(7);
                                const lang = (match ? match[1] : '').toLowerCase();

                                // Deteksi apakah kode dapat dibuka sebagai Artifact Live Preview
                                const isArtifactSupported =
                                  lang === 'html' ||
                                  lang === 'svg' ||
                                  (lang === 'xml' && codeString.trim().startsWith('<svg')) ||
                                  lang === 'javascript' ||
                                  lang === 'js';

                                if (!inline && match) {
                                  return (
                                    <div className="relative my-3 rounded-xl overflow-hidden border border-[#E5E3DB] dark:border-[#3F3F46] bg-[#1E1E22] text-[#F4F4F5] max-w-full">
                                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-black/25 text-[11px] font-mono text-[#A1A1AA] border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                          <span>{match[1]}</span>
                                          {isArtifactSupported && onOpenArtifact && (
                                            <button
                                              type="button"
                                              onClick={() => onOpenArtifact({
                                                title: `Preview ${lang.toUpperCase()}`,
                                                language: lang,
                                                code: codeString
                                              })}
                                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DA7756]/20 hover:bg-[#DA7756]/30 text-[#DA7756] font-sans font-medium text-[10px] transition-colors"
                                              title="Buka Live Preview & Sandbox Artifact"
                                            >
                                              <Sparkles size={11} />
                                              <span>Buka Preview (Artifact)</span>
                                            </button>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleCopyCodeBlock(codeString, codeId)}
                                          className="flex items-center gap-1 hover:text-white transition-colors"
                                        >
                                          {copiedCode === codeId ? (
                                            <>
                                              <Check size={12} className="text-emerald-400" />
                                              <span className="text-emerald-400">Tersalin!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={12} />
                                              <span>Salin</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-3.5 overflow-x-auto text-xs leading-normal max-w-full">
                                        <code className={`${className || ''} break-normal`} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  );
                                }

                                return (
                                  <code className={`${className || ''} break-words [overflow-wrap:anywhere]`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              table({ node, children, ...props }: any) {
                                return (
                                  <div className="my-3.5 w-full overflow-hidden rounded-xl border border-[#E5E3DB] dark:border-[#3F3F46] bg-white dark:bg-[#1E1E22] shadow-2xs">
                                    <div className="w-full overflow-x-auto [scrollbar-width:thin]">
                                      <table className="w-full min-w-[560px] border-collapse text-left text-xs sm:text-sm" {...props}>
                                        {children}
                                      </table>
                                    </div>
                                  </div>
                                );
                              },
                              thead({ node, children, ...props }: any) {
                                return (
                                  <thead className="bg-[#F5F4EF] dark:bg-[#252528] border-b border-[#E5E3DB] dark:border-[#3F3F46] text-[#44403C] dark:text-[#E4E4E7]" {...props}>
                                    {children}
                                  </thead>
                                );
                              },
                              tbody({ node, children, ...props }: any) {
                                return (
                                  <tbody className="divide-y divide-[#E5E3DB]/70 dark:divide-[#3F3F46]/60 bg-transparent text-[#23201D] dark:text-[#F4F4F5]" {...props}>
                                    {children}
                                  </tbody>
                                );
                              },
                              tr({ node, children, ...props }: any) {
                                return (
                                  <tr className="transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.03] even:bg-[#FAF9F5]/70 dark:even:bg-[#222226]/50" {...props}>
                                    {children}
                                  </tr>
                                );
                              },
                              th({ node, children, ...props }: any) {
                                return (
                                  <th className="px-4 py-3 text-left font-semibold text-xs tracking-normal whitespace-nowrap [word-break:normal] [overflow-wrap:normal] text-[#3B3835] dark:text-[#F4F4F5]" {...props}>
                                    {children}
                                  </th>
                                );
                              },
                              td({ node, children, ...props }: any) {
                                return (
                                  <td className="px-4 py-3 align-top leading-relaxed text-xs sm:text-sm [word-break:normal] [overflow-wrap:normal] text-[#23201D] dark:text-[#D4D4D8]" {...props}>
                                    {children}
                                  </td>
                                );
                              },
                              img({ node, src, alt, ...props }: any) {
                                return (
                                  <span className="block my-3 max-w-full rounded-2xl overflow-hidden border border-[#E5E3DB] dark:border-[#3F3F46] shadow-sm bg-black/5 dark:bg-white/5">
                                    <a
                                      href={src}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block relative group cursor-zoom-in"
                                      title="Klik untuk membuka gambar resolusi penuh"
                                    >
                                      <img
                                        src={src}
                                        alt={alt || 'Gambar dibuat oleh AI'}
                                        loading="lazy"
                                        className="w-full max-h-[520px] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.005]"
                                        {...props}
                                      />
                                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none shadow-md">
                                        <Download size={12} />
                                        <span>Resolusi Penuh</span>
                                      </span>
                                    </a>
                                    {alt && (
                                      <span className="block px-3.5 py-2 text-xs text-[#65605B] dark:text-[#A1A1AA] border-t border-[#E5E3DB]/60 dark:border-[#3F3F46]/60 bg-[#FAF9F5] dark:bg-[#1F1F23]">
                                        {alt}
                                      </span>
                                    )}
                                  </span>
                                );
                              }
                            }}
                          >
                            {preprocessLaTeX(msg.content)}
                          </ReactMarkdown>
                        )}
                      </div>
                    )}

                    {/* Toolbar Tindakan Pesan Bot: Text-to-Speech, Salin Lengkap, Coba Lagi & Timestamp */}
                    {!isUser && msg.content && (
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 px-0.5 text-[11px] text-[#8C8782] dark:text-[#71717A]">
                        {/* Tombol Suara (TTS) */}
                        <button
                          type="button"
                          onClick={() => speak(msg.id, msg.content)}
                          className={`flex items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
                            speakingMessageId === msg.id
                              ? 'bg-[#DA7756]/15 text-[#DA7756] font-medium animate-pulse'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#23201D] dark:hover:text-white'
                          }`}
                          title={speakingMessageId === msg.id ? 'Hentikan Suara' : 'Dengarkan respon suara'}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX size={12} />
                              <span>Hentikan</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>Dengarkan</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Salin Seluruh Respon */}
                        <button
                          type="button"
                          onClick={() => handleCopyFullMessage(msg.content, msg.id)}
                          className="flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#23201D] dark:hover:text-white transition-colors"
                          title="Salin seluruh isi jawaban"
                        >
                          {copiedFullMessageId === msg.id ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Coba Lagi (Regenerate) untuk pesan terakhir */}
                        {isLatestBotMessage && onRegenerate && !isLoading && (
                          <button
                            type="button"
                            onClick={onRegenerate}
                            className="flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#23201D] dark:hover:text-white transition-colors"
                            title="Minta AI menjawab ulang dengan variasi lain"
                          >
                            <RotateCcw size={12} />
                            <span>Coba Lagi</span>
                          </button>
                        )}

                        {/* Timestamp */}
                        <span className="font-mono text-[10px] ml-auto opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Smart Follow-up Suggestions (Chips) di bawah pesan bot terakhir */}
                    {isLatestBotMessage && !isLoading && (
                      <div className="w-full flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E5E3DB]/60 dark:border-[#3F3F46]/40">
                        <span className="text-[10px] text-[#8C8782] dark:text-[#71717A] flex items-center gap-1 py-0.5">
                          <Sparkles size={11} className="text-[#DA7756]" />
                          <span>Lanjutan:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onSendPresetMessage('Bisakah kamu jelaskan lebih detail dengan contoh praktis?')}
                          className="py-1 px-2.5 rounded-full text-[11px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#D4D4D8] border border-black/5 dark:border-white/5 transition-all"
                        >
                          💡 Jelaskan Lebih Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendPresetMessage('Tolong ringkas poin-poin penting dari penjelasan di atas dalam bentuk daftar.')}
                          className="py-1 px-2.5 rounded-full text-[11px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#D4D4D8] border border-black/5 dark:border-white/5 transition-all"
                        >
                          📌 Ringkas Poin Penting
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendPresetMessage('Apa langkah selanjutnya atau alternatif terbaik yang kamu rekomendasikan?')}
                          className="py-1 px-2.5 rounded-full text-[11px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#65605B] dark:text-[#D4D4D8] border border-black/5 dark:border-white/5 transition-all"
                        >
                          🚀 Langkah Selanjutnya
                        </button>
                      </div>
                    )}

                    {/* User Timestamp */}
                    {isUser && (
                      <span className="text-[10px] text-[#8C8782] dark:text-[#71717A] px-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/10 dark:bg-white/10 text-[#65605B] dark:text-[#A1A1AA] flex items-center justify-center shrink-0 mt-1 border border-black/5 dark:border-white/10">
                      {user?.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={17} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator saat qwertybot memproses */}
            {isLoading && (
              <div className="flex gap-3.5 items-start">
                <div className="shrink-0">
                  <Logo size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 p-3 px-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-[#65605B] dark:text-[#A1A1AA] font-medium ml-1">
                      {activeToolEvent
                        ? activeToolEvent.name === 'search_web'
                          ? 'qwertybot sedang menelusuri web...'
                          : activeToolEvent.name === 'read_web_page'
                          ? 'qwertybot sedang membaca isi tautan web...'
                          : 'qwertybot sedang mengelola VPS...'
                        : 'qwertybot sedang memproses...'}
                    </span>

                    {onStopGeneration && (
                      <button
                        type="button"
                        onClick={onStopGeneration}
                        className="ml-3 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[11px] font-medium text-[#65605B] dark:text-[#D4D4D8] transition-colors"
                        title="Hentikan pembuatan respon (Stop generating)"
                      >
                        <Square size={11} className="fill-current text-[#DA7756]" />
                        <span>Hentikan</span>
                      </button>
                    )}
                  </div>

                  {activeToolEvent && (
                    activeToolEvent.name === 'search_web' ? (
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/30 text-xs font-mono text-blue-600 dark:text-blue-400 animate-pulse">
                        <Globe size={13} className="shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="truncate">
                          {activeToolEvent.status === 'running' ? '🌐 Menelusuri Web: ' : '✅ Selesai mencari: '}
                          <span className="font-semibold">{activeToolEvent.args?.query || 'Informasi terbaru'}</span>
                        </span>
                      </div>
                    ) : activeToolEvent.name === 'read_web_page' ? (
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-600 dark:text-emerald-400 animate-pulse">
                        <FileText size={13} className="shrink-0" />
                        <span className="truncate">
                          {activeToolEvent.status === 'running' ? '📄 Membaca URL: ' : '✅ Selesai membaca: '}
                          <span className="font-semibold">{activeToolEvent.args?.url || 'Halaman Web'}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-[#1E1E22] border border-[#DA7756]/30 text-xs font-mono text-[#DA7756] animate-pulse">
                        <Terminal size={13} className="shrink-0" />
                        <span className="truncate">
                          {activeToolEvent.status === 'running' ? '⚙️ Menjalankan di VPS: ' : '✅ Selesai: '}
                          <span className="font-semibold">{activeToolEvent.name}</span>
                          {activeToolEvent.args?.command ? ` (${activeToolEvent.args.command})` : activeToolEvent.args?.filePath ? ` (${activeToolEvent.args.filePath})` : ''}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
