import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, Square, Check, X, AlertCircle, Lock, Sparkles, Globe } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AttachmentMeta, QuotaInfo, GoogleUser } from '../types/index.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { AttachmentPreview } from './AttachmentPreview.js';

interface MessageInputProps {
  onSendMessage: (text: string, attachments: AttachmentMeta[]) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  quota?: QuotaInfo | null;
  user?: GoogleUser | null;
  onOpenPrivacy?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  quota,
  user,
  onOpenPrivacy
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    isRecording,
    recordingTime,
    audioResult,
    error: micError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudioResult
  } = useAudioRecorder();

  // Bila hasil rekaman VN selesai, tambahkan ke attachments
  useEffect(() => {
    if (audioResult) {
      const audioAtt: AttachmentMeta = {
        id: uuidv4(),
        name: `VN-${new Date().toLocaleTimeString('id-ID').replace(/:/g, '-')}.webm`,
        mimeType: audioResult.blob.type || 'audio/webm',
        size: audioResult.blob.size,
        type: 'audio',
        previewUrl: audioResult.url,
        file: audioResult.file
      };
      setAttachments(prev => [...prev, audioAtt]);
      clearAudioResult();
    }
  }, [audioResult, clearAudioResult]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachmentMeta[] = [];

    Array.from(files).forEach(file => {
      let type: 'image' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const previewUrl = (type === 'image' || type === 'audio')
        ? URL.createObjectURL(file)
        : undefined;

      newAttachments.push({
        id: uuidv4(),
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        type,
        previewUrl,
        file
      });
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
      const target = prev.find(a => a.id === id);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const isOwner = Boolean(
    (user?.email && typeof user.email === 'string' && user.email.trim().toLowerCase() === 'dimassdwisyah@gmail.com') ||
    quota?.isOwner ||
    quota?.isUnlimited
  );

  const isQuotaExhausted = !isOwner && Boolean(quota && !quota.isUnlimited && quota.remaining <= 0);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || isRecording || isQuotaExhausted) return;
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">


      {/* Banner Peringatan Kuota Habis (Hanya untuk non-owner) */}
      {isQuotaExhausted && (
        <div className="mb-2.5 p-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Lock size={16} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-xs text-red-600 dark:text-red-400">
                Batas Kuota Pesan AI Telah Habis ({quota?.usedCount}/{quota?.maxQuota})
              </p>
              <p className="text-[11px] opacity-90 text-[#65605B] dark:text-[#D4D4D8]">
                Anda harus menunggu <strong className="text-red-600 dark:text-red-400">{quota?.formattedResetTime}</strong> untuk reset kuota 3 hari otomatis.
              </p>
            </div>
          </div>
          {!user && (
            <div className="text-[11px] font-medium text-[#DA7756] bg-white dark:bg-[#18181B] px-2.5 py-1 rounded-xl border border-[#DA7756]/30 shrink-0 flex items-center gap-1 shadow-2xs">
              <Sparkles size={12} />
              <span>Login Google untuk +15% kuota</span>
            </div>
          )}
        </div>
      )}

      {micError && (
        <div className="mb-2 p-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle size={14} />
          <span>{micError}</span>
        </div>
      )}

      <div className={`relative rounded-2xl bg-[#FFFFFF] dark:bg-[#27272A] border ${
        isQuotaExhausted ? 'border-red-500/30' : 'border-[#E5E3DB] dark:border-[#3F3F46]'
      } shadow-sm focus-within:border-[#DA7756]/60 dark:focus-within:border-[#DA7756]/80 transition-all`}>
        {/* Pratinjau lampiran sebelum dikirim */}
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />

        {/* Status Bar saat Merekam Voice Note */}
        {isRecording ? (
          <div className="p-3.5 flex items-center justify-between bg-[#DA7756]/10 dark:bg-[#DA7756]/15 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-4" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                  Merekam Voice Note (VN)...
                </span>
                <span className="text-[11px] font-mono text-[#DA7756] font-medium">
                  {formatTimer(recordingTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#65605B] dark:text-[#A1A1AA] text-xs font-medium flex items-center gap-1 transition-colors"
                title="Batal Rekam"
              >
                <X size={15} />
                <span className="text-xs">Batal</span>
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="p-1.5 px-3 rounded-lg bg-[#DA7756] hover:bg-[#C26242] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                title="Selesai Rekam"
              >
                <Check size={15} />
                <span className="text-xs">Lampirkan VN</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Tag/Chip Tautan Terdeteksi jika link berada di dalam kalimat */}
            {(() => {
              const urlRegex = /(https?:\/\/[^\s]+)/gi;
              const detectedUrls = text.match(urlRegex) || [];
              const startsWithUrl = /^https?:\/\//i.test(text.trim());

              return (
                <>
                  {detectedUrls.length > 0 && !startsWithUrl && (
                    <div className="flex flex-wrap items-center gap-1.5 px-4 pt-2.5 pb-1">
                      {detectedUrls.map((url, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#DA7756]/10 dark:bg-[#DA7756]/20 border border-[#DA7756]/30 text-xs font-mono font-medium text-[#DA7756] dark:text-[#E07A5F]"
                        >
                          <Globe size={12} className="shrink-0" />
                          <span className="truncate max-w-[260px] sm:max-w-[400px]">{url}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative flex items-start w-full">
                    {/* Ikon Bumi/Globe jika input diawali dengan https:// atau tautan */}
                    {startsWithUrl && (
                      <div className="pt-3.5 pl-4 pr-1 text-[#DA7756] dark:text-[#E07A5F] shrink-0 flex items-center select-none">
                        <Globe size={16} className="animate-pulse" />
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isQuotaExhausted
                          ? `Batas kuota habis. Reset otomatis dalam ${quota?.formattedResetTime || '3 hari'}.${!user ? ' Login untuk +15% kuota.' : ''}`
                          : "Kirim pesan ke qwertybot... (atau kirim gambar, file, dan rekaman VN)"
                      }
                      disabled={isLoading || isQuotaExhausted}
                      className={`w-full pt-3.5 ${startsWithUrl ? 'pl-1.5' : 'px-4'} pb-2 bg-transparent text-sm resize-none focus:outline-none min-h-[44px] max-h-[180px] leading-relaxed transition-colors ${
                        startsWithUrl
                          ? 'text-[#DA7756] dark:text-[#E07A5F] font-mono font-medium'
                          : 'text-[#23201D] dark:text-[#F4F4F5]'
                      } placeholder-[#8C8782] dark:placeholder-[#71717A] ${
                        isQuotaExhausted ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                    />
                  </div>
                </>
              );
            })()}

            {/* Baris Tombol Aksi */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-1">
                {/* Input berkas tersembunyi */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf,.txt,.csv,.json,.md,.js,.ts,.py,.html,.css"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Tombol Lampirkan Berkas/Gambar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-xl text-[#65605B] dark:text-[#A1A1AA] transition-colors ${
                    isQuotaExhausted
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#23201D] dark:hover:text-[#F4F4F5]'
                  }`}
                  title={isQuotaExhausted ? 'Batas kuota habis' : 'Lampirkan Gambar atau Berkas (PDF, Doc, Kode, Audio)'}
                  disabled={isLoading || isQuotaExhausted}
                >
                  <Paperclip size={18} />
                </button>

                {/* Tombol Rekam Voice Note (VN) */}
                <button
                  type="button"
                  onClick={startRecording}
                  className={`p-2 rounded-xl text-[#65605B] dark:text-[#A1A1AA] transition-colors ${
                    isQuotaExhausted
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#DA7756]'
                  }`}
                  title={isQuotaExhausted ? 'Batas kuota habis' : 'Rekam Voice Note (VN) lewat Mikrofon'}
                  disabled={isLoading || isQuotaExhausted}
                >
                  <Mic size={18} />
                </button>
              </div>

              {/* Tombol Kirim atau Hentikan Respon */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2 rounded-xl flex items-center justify-center bg-[#23201D] dark:bg-[#F4F4F5] text-white dark:text-[#18181B] hover:opacity-85 shadow-xs scale-100 hover:scale-105 active:scale-95 transition-all"
                  title="Hentikan pembuatan respon (Stop generating)"
                >
                  <Square size={14} className="fill-current" />
                </button>
              ) : isQuotaExhausted ? (
                <button
                  type="button"
                  disabled
                  className="p-2 px-3 rounded-xl flex items-center gap-1.5 justify-center bg-red-500/10 text-red-600 dark:text-red-400 cursor-not-allowed border border-red-500/20 text-xs font-medium"
                  title={`Batas kuota habis. Reset dalam ${quota?.formattedResetTime}.`}
                >
                  <Lock size={14} />
                  <span>Kuota Habis</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!text.trim() && attachments.length === 0}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    !text.trim() && attachments.length === 0
                      ? 'bg-black/5 dark:bg-white/5 text-[#8C8782] dark:text-[#71717A] cursor-not-allowed'
                      : 'bg-[#DA7756] hover:bg-[#C26242] text-white shadow-xs scale-100 hover:scale-105 active:scale-95'
                  }`}
                  title="Kirim Pesan"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] text-[#8C8782] dark:text-[#71717A]">
        qwertybot dapat membuat kesalahan. Harap verifikasi informasi penting. •{' '}
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="underline hover:text-[#DA7756] transition-colors"
        >
          Kebijakan Privasi & Ketentuan
        </button>
      </p>
    </div>
  );
};
