import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  X,
  Search,
  Pencil,
  Check,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Logo } from './Logo.js';
import { SessionSummary, ThemePreference, GoogleUser } from '../types/index.js';

interface SidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (idOrCode: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  themePreference: ThemePreference;
  onThemeChange: (pref: ThemePreference) => void;
  isOpen: boolean;
  onClose: () => void;
  user?: GoogleUser | null;
  onLogout?: () => void;
  onOpenPrivacy?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  themePreference,
  onThemeChange,
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenPrivacy
}) => {
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCodeInput.trim()) return;
    onSelectSession(sessionCodeInput.trim().toUpperCase());
    setSessionCodeInput('');
    setShowJoinInput(false);
  };

  const handleStartRename = (e: React.MouseEvent, session: SessionSummary) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (e: React.FormEvent | React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim() && onRenameSession) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  // Filter percakapan secara instan berdasarkan judul atau kode sesi
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.trim().toLowerCase();
    return sessions.filter(
      s => s.title.toLowerCase().includes(query) || s.sessionCode.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 flex flex-col overflow-hidden bg-[#F3F2EC] dark:bg-[#18181B] border-r border-[#E5E3DB] dark:border-[#27272A] transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b border-[#E5E3DB] dark:border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div>
              <h1 className="font-semibold text-base tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                qwertybot
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#65605B] dark:text-[#A1A1AA]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FAF9F5] dark:bg-[#27272A] hover:bg-white dark:hover:bg-[#323238] border border-[#E5E3DB] dark:border-[#3F3F46] text-[#23201D] dark:text-[#F4F4F5] font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:border-[#DA7756]/50"
          >
            <Plus size={16} className="text-[#DA7756]" />
            <span>Chat Baru</span>
          </button>

          {/* Kotak Pencarian Chat */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8782] dark:text-[#71717A]" />
            <input
              type="text"
              placeholder="Cari riwayat obrolan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E5E3DB] dark:border-[#3F3F46] bg-[#FAF9F5] dark:bg-[#202024] text-[#23201D] dark:text-[#F4F4F5] placeholder-[#8C8782] dark:placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#DA7756]/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8782] hover:text-[#23201D] dark:hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Tombol / Form Buka Sesi via Kode */}
          {!showJoinInput ? (
            <button
              onClick={() => setShowJoinInput(true)}
              className="w-full py-1.5 px-3 rounded-lg text-xs text-[#65605B] dark:text-[#A1A1AA] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound size={13} />
              <span>Buka via Session Code</span>
            </button>
          ) : (
            <form onSubmit={handleJoinByCode} className="p-2 rounded-xl bg-white dark:bg-[#27272A] border border-[#DA7756]/40 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#65605B] dark:text-[#A1A1AA]">
                <span>Masukkan Kode Sesi:</span>
                <button
                  type="button"
                  onClick={() => setShowJoinInput(false)}
                  className="hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Contoh: QW-84920"
                  value={sessionCodeInput}
                  onChange={(e) => setSessionCodeInput(e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1 text-xs rounded-lg border border-[#E5E3DB] dark:border-[#3F3F46] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#DA7756] uppercase font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#DA7756] hover:bg-[#C26242] text-white transition-colors"
                >
                  Buka
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Daftar Sesi Riwayat Percakapan */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8C8782] dark:text-[#71717A] flex items-center justify-between">
            <span>Riwayat ({filteredSessions.length})</span>
            {searchQuery && (
              <span className="text-[10px] lowercase text-[#DA7756] font-normal">difilter</span>
            )}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[#8C8782] dark:text-[#71717A]">
              {searchQuery
                ? 'Tidak ada chat yang sesuai dengan pencarian.'
                : 'Belum ada riwayat chat. Mulai percakapan baru dengan qwertybot!'}
            </div>
          ) : (
            filteredSessions.map((item) => {
              const isActive = item.id === activeSessionId;
              const isEditing = editingSessionId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isEditing) return;
                    onSelectSession(item.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-xs text-[#23201D] dark:text-[#F4F4F5]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#4E443F] dark:text-[#D4D4D8] border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-1 flex-1">
                    <MessageSquare
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        isActive ? 'text-[#DA7756]' : 'text-[#8C8782] dark:text-[#71717A]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(e, item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full text-xs px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-[#DA7756]/50 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500"
                            title="Simpan Judul"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500"
                            title="Batal"
                          >
                            <X size={12} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <p className="text-xs font-medium truncate leading-tight">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-black/5 dark:bg-white/10 text-[#65605B] dark:text-[#A1A1AA]">
                              {item.sessionCode}
                            </span>
                            <span className="text-[10px] text-[#8C8782] dark:text-[#71717A]">
                              {item.messageCount} pesan
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi Sesi: Rename & Hapus */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onRenameSession && (
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, item)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#8C8782] dark:text-[#71717A] hover:text-[#DA7756] transition-colors"
                          title="Ubah Judul"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus percakapan "${item.title}"?`)) {
                            onDeleteSession(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[#8C8782] dark:text-[#71717A] transition-colors"
                        title="Hapus Sesi"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Profil Pengguna & Kontrol Tema Otomatis / Manual */}
        <div className="p-3 border-t border-[#E5E3DB] dark:border-[#27272A] bg-black/2 dark:bg-white/2 space-y-2.5">
          {/* User Account Section */}
          {user ? (
            <div key="user-account-card" className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
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
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-[#8C8782] dark:text-[#71717A] hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-500 text-xs transition-colors shrink-0"
                  title="Keluar (Logout)"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ) : (
            <div key="google-login-container" className="w-full flex justify-center py-1">
              <div id="google-btn-sidebar" className="w-full flex justify-center overflow-hidden rounded-xl"></div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#65605B] dark:text-[#A1A1AA] pt-1 px-1">
            <span className="font-medium text-[11px]">Tema Tampilan</span>
            <span className="text-[10px] opacity-75">
              {themePreference === 'system' ? 'Adaptif Sistem' : themePreference === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => onThemeChange('system')}
              className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                themePreference === 'system'
                  ? 'bg-white dark:bg-[#27272A] text-[#23201D] dark:text-[#F4F4F5] shadow-xs'
                  : 'text-[#65605B] dark:text-[#A1A1AA] hover:text-inherit'
              }`}
              title="Mengikuti tema perangkat otomatis"
            >
              <Laptop size={13} />
              <span>Sistem</span>
            </button>

            <button
              onClick={() => onThemeChange('light')}
              className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                themePreference === 'light'
                  ? 'bg-white dark:bg-[#27272A] text-[#23201D] dark:text-[#F4F4F5] shadow-xs'
                  : 'text-[#65605B] dark:text-[#A1A1AA] hover:text-inherit'
              }`}
              title="Paksa mode terang"
            >
              <Sun size={13} />
              <span>Terang</span>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                themePreference === 'dark'
                  ? 'bg-white dark:bg-[#27272A] text-[#23201D] dark:text-[#F4F4F5] shadow-xs'
                  : 'text-[#65605B] dark:text-[#A1A1AA] hover:text-inherit'
              }`}
              title="Paksa mode gelap"
            >
              <Moon size={13} />
              <span>Gelap</span>
            </button>
          </div>

          {/* Creator Credit */}
          <div className="mt-3 pt-2.5 border-t border-[#E5E3DB]/60 dark:border-[#27272A]/80 flex items-center justify-between text-[11px] text-[#8C8782] dark:text-[#71717A] px-1">
            <span>Dirancang oleh</span>
            <a
              href="https://github.com/DimassDwiiorg"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium text-[#23201D] dark:text-[#F4F4F5] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors"
              title="Kunjungi GitHub Dimas Dwi Syahputra"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Dimas Dwi Syahputra</span>
            </a>
          </div>

          {/* Kebijakan Privasi & Ketentuan */}
          <div className="mt-2 pt-2 border-t border-[#E5E3DB]/40 dark:border-[#27272A]/50 flex items-center justify-between text-[11px] text-[#8C8782] dark:text-[#71717A] px-1">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="flex items-center gap-1.5 hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors"
              title="Baca Kebijakan Privasi & Ketentuan Layanan"
            >
              <Shield size={11} className="text-[#DA7756]" />
              <span>Privasi & Ketentuan</span>
            </button>
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#23201D] dark:hover:text-[#F4F4F5] transition p-0.5 rounded"
              title="Buka Halaman Privasi di Tab Baru"
            >
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
