import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { ChatFeed } from './components/ChatFeed.js';
import { MessageInput } from './components/MessageInput.js';
import { VpsAuthModal } from './components/VpsAuthModal.js';
import { ArtifactModal, ArtifactData } from './components/ArtifactModal.js';
import { PrivacyPolicy } from './components/PrivacyPolicy.js';
import { useTheme } from './hooks/useTheme.js';
import { SessionSummary, SessionDetails, AttachmentMeta, ChatMessage, GoogleUser, QuotaInfo } from './types/index.js';
import { apiUrl } from './utils/api.js';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = '244117033342-i4krvq1fphqf08mpc2q8adtrjj7e1frg.apps.googleusercontent.com';

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token:', e);
    return null;
  }
}

export function App() {
  const { preference, setPreference } = useTheme();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSession, setActiveSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Status batas kuota pesan AI
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  // Inisialisasi akun login langsung secara sinkron dari localStorage (mencegah kedipan / race condition saat refresh)
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('qwertybot-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      return localStorage.getItem('qwertybot-model') || 'gemini-3.5-flash-lite';
    } catch {
      return 'gemini-3.5-flash-lite';
    }
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Status autentikasi Owner & VPS
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('qwertybot-admin-token') || null;
    } catch {
      return null;
    }
  });
  const [isVpsUnlocked, setIsVpsUnlocked] = useState(false);
  const [isVpsModalOpen, setIsVpsModalOpen] = useState(false);
  const [activeToolEvent, setActiveToolEvent] = useState<{ name: string; args?: any; status: 'running' | 'done' } | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const isStandalonePrivacy = typeof window !== 'undefined' && (window.location.pathname === '/privacy' || window.location.pathname === '/terms');

  // Emergency cache reset if ?reset=1 is in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('reset=1')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.href = '/';
    }
  }, []);

  const isOwner = Boolean(
    user?.email &&
    typeof user.email === 'string' &&
    user.email.trim().toLowerCase() === 'dimassdwisyah@gmail.com'
  );

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem('qwertybot-model', modelId);
    } catch {}
  };

  // Cek validitas sesi admin token ke server jika akun adalah owner
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isOwner || !adminToken) {
        setIsVpsUnlocked(false);
        return;
      }
      try {
        const res = await fetch(apiUrl(`/api/admin/status?email=${encodeURIComponent(user?.email || '')}`), {
          headers: { 'x-admin-token': adminToken }
        });
        const data = await res.json();
        if (data.success && data.isUnlocked) {
          setIsVpsUnlocked(true);
        } else {
          setIsVpsUnlocked(false);
          setAdminToken(null);
          sessionStorage.removeItem('qwertybot-admin-token');
        }
      } catch {
        setIsVpsUnlocked(false);
      }
    };

    checkAdminStatus();
  }, [user, isOwner, adminToken]);

  const handleVpsVerifySuccess = (token: string) => {
    setAdminToken(token);
    sessionStorage.setItem('qwertybot-admin-token', token);
    setIsVpsUnlocked(true);
    showToast('Akses VPS berhasil dibuka! qwertybot siap mengelola server.');
  };

  const handleVpsLock = async () => {
    if (adminToken) {
      try {
        await fetch(apiUrl('/api/admin/lock'), {
          method: 'POST',
          headers: { 'x-admin-token': adminToken }
        });
      } catch {}
    }
    setAdminToken(null);
    sessionStorage.removeItem('qwertybot-admin-token');
    setIsVpsUnlocked(false);
    showToast('Akses VPS telah dikunci kembali.');
  };

  // Inisialisasi Google Identity Services SDK
  useEffect(() => {
    const cleanupFloatingPrompts = () => {
      try {
        if (window.google?.accounts?.id?.cancel) {
          window.google.accounts.id.cancel();
        }
      } catch {}
      const floatingContainer = document.getElementById('credential_picker_container');
      if (floatingContainer) floatingContainer.remove();
      const iframes = document.querySelectorAll('iframe[id*="credential_picker"]');
      iframes.forEach(el => el.remove());
    };

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          if (user) {
            // Jika user sudah login, batalkan dan hapus segala prompt/iframe picker mengambang
            cleanupFloatingPrompts();
            return;
          }

          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true
          });

          // Render official Google button di header dan sidebar jika elemen ada
          const headerBtnEl = document.getElementById('google-btn-header');
          if (headerBtnEl) {
            try {
              headerBtnEl.innerHTML = '';
              window.google.accounts.id.renderButton(headerBtnEl, {
                type: 'standard',
                shape: 'pill',
                theme: preference === 'dark' ? 'filled_black' : 'outline',
                text: 'signin_with',
                size: 'small',
                logo_alignment: 'left'
              });
            } catch (err) {
              console.warn('Gagal merender tombol header Google:', err);
            }
          }

          const sidebarBtnEl = document.getElementById('google-btn-sidebar');
          if (sidebarBtnEl) {
            try {
              sidebarBtnEl.innerHTML = '';
              window.google.accounts.id.renderButton(sidebarBtnEl, {
                type: 'standard',
                shape: 'rectangular',
                theme: preference === 'dark' ? 'filled_black' : 'outline',
                text: 'continue_with',
                size: 'large',
                width: 240,
                logo_alignment: 'left'
              });
            } catch (err) {
              console.warn('Gagal merender tombol sidebar Google:', err);
            }
          }
        } catch (e) {
          console.error('Error init Google GIS:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogleGsi();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [user, preference]);

  const handleGoogleCredentialResponse = (response: any) => {
    if (!response?.credential) return;
    const payload = parseJwt(response.credential);
    if (payload) {
      const googleUser: GoogleUser = {
        name: payload.name || payload.given_name || 'Pengguna',
        email: payload.email || '',
        picture: payload.picture || '',
        sub: payload.sub || ''
      };
      setUser(googleUser);
      localStorage.setItem('qwertybot-user', JSON.stringify(googleUser));
      fetchQuota(googleUser.sub, true);
      try {
        if (window.google?.accounts?.id?.cancel) {
          window.google.accounts.id.cancel();
        }
        const floatingContainer = document.getElementById('credential_picker_container');
        if (floatingContainer) floatingContainer.remove();
        const iframes = document.querySelectorAll('iframe[id*="credential_picker"]');
        iframes.forEach(el => el.remove());
      } catch {}
      showToast(`Selamat datang, ${googleUser.name}!`);
    }
  };

  const handleLogout = () => {
    try {
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect();
      }
      if (window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
      const floatingContainer = document.getElementById('credential_picker_container');
      if (floatingContainer) floatingContainer.remove();
      const iframes = document.querySelectorAll('iframe[id*="credential_picker"]');
      iframes.forEach(el => el.remove());
    } catch (e) {
      console.error('Error saat logout Google:', e);
    }
    setUser(null);
    localStorage.removeItem('qwertybot-user');
    fetchQuota(undefined, false);
    showToast('Berhasil keluar (logout). Silakan pilih akun baru.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Helper untuk mendapatkan identifier akun pemilik (Google sub atau ID guest)
  const getOwnerId = (): string => {
    if (user?.sub) {
      return user.sub;
    }
    try {
      let guestId = localStorage.getItem('qwertybot-guest-id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('qwertybot-guest-id', guestId);
      }
      return guestId;
    } catch {
      return 'guest_' + Math.random().toString(36).substring(2, 10);
    }
  };

  // Helper untuk memuat status batas kuota AI dari server
  const fetchQuota = async (overrideOwnerId?: string, overrideIsLoggedIn?: boolean) => {
    try {
      const owner = overrideOwnerId !== undefined ? overrideOwnerId : getOwnerId();
      const loggedIn = overrideIsLoggedIn !== undefined ? overrideIsLoggedIn : !!user?.sub;
      const params = new URLSearchParams({
        ownerId: owner,
        isLoggedIn: String(loggedIn)
      });
      if (user?.email) {
        params.append('userEmail', user.email);
      }
      const res = await fetch(apiUrl(`/api/quota?${params.toString()}`));
      const data = await res.json();
      if (data.success && data.quota) {
        setQuota(data.quota);
        return data.quota as QuotaInfo;
      }
    } catch (err) {
      console.error('Gagal memuat status kuota AI:', err);
    }
    return null;
  };

  // Helper untuk menyimpan ID sesi milik device ini ke localStorage
  const getDeviceSessionIds = (): string[] => {
    try {
      const stored = localStorage.getItem('qwertybot-device-sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addDeviceSessionId = (id: string) => {
    try {
      const ids = getDeviceSessionIds();
      if (!ids.includes(id)) {
        const updated = [id, ...ids];
        localStorage.setItem('qwertybot-device-sessions', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Gagal menyimpan riwayat sesi lokal:', err);
    }
  };

  const removeDeviceSessionId = (id: string) => {
    try {
      const ids = getDeviceSessionIds();
      const updated = ids.filter(item => item !== id);
      localStorage.setItem('qwertybot-device-sessions', JSON.stringify(updated));
    } catch (err) {
      console.error('Gagal menghapus sesi lokal:', err);
    }
  };

  // 1. Muat daftar sesi KHUSUS milik akun yang sedang aktif
  const fetchSessions = async (overrideOwnerId?: string) => {
    try {
      const owner = overrideOwnerId || getOwnerId();
      const deviceIds = getDeviceSessionIds();
      const params = new URLSearchParams({
        ownerId: owner,
        ...(deviceIds.length > 0 ? { ids: deviceIds.join(',') } : {})
      });

      const res = await fetch(apiUrl(`/api/sessions?${params.toString()}`));
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        return data.sessions as SessionSummary[];
      }
    } catch (err) {
      console.error('Gagal mengambil daftar sesi:', err);
    }
    return [];
  };

  // 2. Muat sesi berdasarkan ID atau Session Code
  const loadSession = async (idOrCode: string) => {
    try {
      const res = await fetch(apiUrl(`/api/sessions/${encodeURIComponent(idOrCode)}`));
      const data = await res.json();
      if (data.success && data.session) {
        if (!Array.isArray(data.session.messages)) {
          data.session.messages = [];
        }
        setActiveSession(data.session);
        const owner = getOwnerId();
        try {
          localStorage.setItem(`qwertybot-active-session-${owner}`, data.session.id);
        } catch {}
        addDeviceSessionId(data.session.id);
      } else {
        showToast(data.error || 'Sesi dengan kode tersebut tidak ditemukan.');
      }
    } catch (err) {
      console.error('Gagal memuat sesi:', err);
      showToast('Gagal memuat sesi obrolan.');
    }
  };

  // 3. Inisialisasi & sinkronisasi otomatis ketika akun berpindah atau login/logout
  useEffect(() => {
    const syncAccountSessions = async () => {
      const ownerId = getOwnerId();
      await fetchQuota(ownerId, !!user?.sub);
      const list = await fetchSessions(ownerId);
      let savedActiveId: string | null = null;
      try {
        savedActiveId = localStorage.getItem(`qwertybot-active-session-${ownerId}`);
      } catch {}

      if (savedActiveId && Array.isArray(list) && list.some(s => s.id === savedActiveId)) {
        await loadSession(savedActiveId);
      } else if (Array.isArray(list) && list.length > 0) {
        await loadSession(list[0].id);
      } else {
        await handleNewSession(ownerId);
      }
    };
    syncAccountSessions();
  }, [user?.sub]);

  // Interval untuk memperbarui waktu reset kuota secara periodik
  useEffect(() => {
    const timer = setInterval(() => {
      fetchQuota();
    }, 60000);
    return () => clearInterval(timer);
  }, [user?.sub]);

  // 4. Buat sesi baru untuk akun yang sedang aktif
  const handleNewSession = async (overrideOwnerId?: string) => {
    try {
      const ownerId = overrideOwnerId || getOwnerId();
      const res = await fetch(apiUrl('/api/sessions/new'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Percakapan Baru', ownerId })
      });
      const data = await res.json();
      if (data.success && data.session) {
        if (!Array.isArray(data.session.messages)) {
          data.session.messages = [];
        }
        setActiveSession(data.session);
        try {
          localStorage.setItem(`qwertybot-active-session-${ownerId}`, data.session.id);
        } catch {}
        addDeviceSessionId(data.session.id);
        await fetchSessions(ownerId);
      }
    } catch (err) {
      console.error('Gagal membuat sesi baru:', err);
      showToast('Gagal membuat percakapan baru.');
    }
  };

  // 5. Hapus sesi
  const handleDeleteSession = async (id: string) => {
    try {
      removeDeviceSessionId(id);
      const res = await fetch(apiUrl(`/api/sessions/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const remaining = sessions.filter(s => s.id !== id);
        setSessions(remaining);
        if (activeSession?.id === id) {
          if (remaining.length > 0) {
            await loadSession(remaining[0].id);
          } else {
            await handleNewSession();
          }
        }
        showToast('Sesi berhasil dihapus.');
      }
    } catch (err) {
      console.error('Gagal menghapus sesi:', err);
    }
  };

  // 6. Ubah judul sesi percakapan
  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(apiUrl(`/api/sessions/${id}/title`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
        if (activeSession?.id === id) {
          setActiveSession(prev => prev ? { ...prev, title: newTitle } : null);
        }
        showToast('Judul percakapan berhasil diperbarui.');
      }
    } catch (err) {
      console.error('Gagal mengubah judul sesi:', err);
      showToast('Gagal mengubah judul percakapan.');
    }
  };

  // 7. Coba lagi (Regenerate) respon AI terakhir
  const handleRegenerate = async () => {
    if (!activeSession || isLoading) return;
    const userMessages = activeSession.messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    const lastUserMsg = userMessages[userMessages.length - 1];

    // Buang respon AI terakhir agar digantikan respon baru
    setActiveSession(prev => {
      if (!prev) return null;
      const lastMsg = prev.messages[prev.messages.length - 1];
      if (lastMsg && lastMsg.role === 'model') {
        return {
          ...prev,
          messages: prev.messages.slice(0, -1)
        };
      }
      return prev;
    });

    await handleSendMessage(lastUserMsg.content, lastUserMsg.attachments || []);
  };

  // 5. Kirim pesan ke qwertybot (teks, gambar, dokumen, atau rekaman suara VN)
  const handleSendMessage = async (text: string, attachments: AttachmentMeta[]) => {
    if (!activeSession) return;

    if (!isOwner && !quota?.isUnlimited && quota && quota.remaining <= 0) {
      showToast(`Batas kuota pesan AI Anda habis (${quota.usedCount}/${quota.maxQuota}). Reset dalam ${quota.formattedResetTime}.`);
      return;
    }

    setIsLoading(true);

    // Optimistic UI: tampilkan pesan user langsung di tampilan
    const optimisticUserMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.map(a => ({
        id: a.id,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        type: a.type,
        previewUrl: a.previewUrl
      }))
    };

    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, optimisticUserMessage]
      };
    });

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const formData = new FormData();
      formData.append('sessionId', activeSession.id);
      formData.append('sessionCode', activeSession.sessionCode);
      formData.append('message', text);
      formData.append('ownerId', getOwnerId());
      formData.append('isLoggedIn', String(!!user?.sub));
      formData.append('selectedModel', selectedModel);
      formData.append('adminToken', adminToken || '');
      if (user) {
        formData.append('userName', user.name);
        formData.append('userEmail', user.email);
      }

      // Masukkan file jika ada
      attachments.forEach(att => {
        if (att.file) {
          formData.append('files', att.file, att.name);
        }
      });

      const res = await fetch(apiUrl('/api/chat?stream=true'), {
        method: 'POST',
        headers: { 'Accept': 'text/event-stream' },
        signal: controller.signal,
        body: formData
      });

      if (res.ok && res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const botTempId = 'bot-' + Date.now();
        let currentEvent = '';

        // Tambahkan placeholder bot message ke UI
        setActiveSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              { id: botTempId, role: 'model', content: '', timestamp: Date.now() }
            ]
          };
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7);
            } else if (trimmed.startsWith('data: ')) {
              try {
                const payload = JSON.parse(trimmed.slice(6));
                if (payload.quota) {
                  setQuota(payload.quota);
                }
                if (currentEvent === 'tool_call') {
                  setActiveToolEvent({ name: payload.name, args: payload.args, status: 'running' });
                } else if (currentEvent === 'tool_result') {
                  setActiveToolEvent({ name: payload.name, status: 'done' });
                } else if (currentEvent === 'chunk' && payload.text) {
                  // Perbarui teks bot secara realtime
                  setActiveSession(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      messages: prev.messages.map(m =>
                        m.id === botTempId ? { ...m, content: m.content + payload.text } : m
                      )
                    };
                  });
                } else if (currentEvent === 'done' && payload.botMessage) {
                  setActiveToolEvent(null);
                  setActiveSession(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      title: payload.title || prev.title,
                      messages: prev.messages.map(m =>
                        m.id === botTempId ? payload.botMessage : m
                      )
                    };
                  });
                  await fetchSessions();
                } else if (currentEvent === 'error') {
                  setActiveToolEvent(null);
                  showToast(payload.error || 'Terjadi kesalahan saat memproses streaming.');
                }
              } catch {
                // ignore SSE parse errors
              }
            }
          }
        }
      } else {
        const data = await res.json();
        if (data.quota) {
          setQuota(data.quota);
        }
        if (data.success) {
          setActiveSession(prev => {
            if (!prev) return null;
            const filtered = prev.messages.filter(m => m.id !== optimisticUserMessage.id);
            return {
              ...prev,
              title: data.title || prev.title,
              messages: [...filtered, data.userMessage, data.botMessage]
            };
          });
          await fetchSessions();
        } else {
          showToast(data.error || 'Terjadi kesalahan saat memproses pesan.');
          if (data.quotaExhausted) {
            await fetchQuota();
          }
          setActiveSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.filter(m => m.id !== optimisticUserMessage.id)
            };
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Pengiriman prompt dihentikan oleh pengguna.');
        return;
      }
      console.error('Gagal mengirim pesan:', err);
      showToast(err.message || 'Koneksi ke server terputus.');
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.filter(m => m.id !== optimisticUserMessage.id)
        };
      });
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setActiveToolEvent(null);
    }
  };

  if (isStandalonePrivacy) {
    return (
      <PrivacyPolicy
        isOpen={true}
        onClose={() => { window.location.href = '/'; }}
        isStandalone={true}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5]">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 py-2.5 px-4 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-[#FAF9F5] dark:text-[#18181B] text-xs font-medium shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Sidebar Kiri */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={loadSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        themePreference={preference}
        onThemeChange={setPreference}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Konten Percakapan Utama */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatFeed
          session={activeSession}
          isLoading={isLoading}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSendPresetMessage={(prompt) => handleSendMessage(prompt, [])}
          onStopGeneration={handleStopGeneration}
          onRegenerate={handleRegenerate}
          user={user}
          onLogout={handleLogout}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          isOwner={isOwner}
          isVpsUnlocked={isVpsUnlocked}
          onOpenVpsModal={() => setIsVpsModalOpen(true)}
          activeToolEvent={activeToolEvent}
          onOpenArtifact={setActiveArtifact}
        />

        {/* Input Bar Mengambang di Bawah */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
          quota={quota}
          user={user}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />
      </main>

      {/* Modal Verifikasi Keamanan Owner & VPS */}
      {isOwner && (
        <VpsAuthModal
          isOpen={isVpsModalOpen}
          onClose={() => setIsVpsModalOpen(false)}
          isUnlocked={isVpsUnlocked}
          userEmail={user?.email}
          onVerifySuccess={handleVpsVerifySuccess}
          onLock={handleVpsLock}
          adminToken={adminToken}
        />
      )}

      {/* Claude-Style Artifacts Live Preview Modal */}
      <ArtifactModal
        artifact={activeArtifact}
        onClose={() => setActiveArtifact(null)}
      />

      {/* Kebijakan Privasi & Ketentuan Layanan Modal */}
      <PrivacyPolicy
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        isStandalone={false}
      />
    </div>
  );
}

export default App;
