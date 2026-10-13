import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pembersih teks Markdown & rumus agar suara Text-to-Speech terdengar alami
 */
function cleanMarkdownForSpeech(md: string): string {
  if (!md) return '';
  return md
    // Hapus blok kode ```lang ... ```
    .replace(/```[\s\S]*?```/g, ' [bagian kode program dilewati] ')
    // Hapus inline code `...`
    .replace(/`([^`]+)`/g, '$1')
    // Hapus link [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Hapus gambar ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Hapus rumus LaTeX $$...$$ atau $...$
    .replace(/\$\$[\s\S]*?\$\$/g, ' [rumus matematika] ')
    .replace(/\$([^$]+)\$/g, '$1')
    // Hapus heading #, ##, ###
    .replace(/^#{1,6}\s+/gm, '')
    // Hapus tebal/miring **text** atau *text* atau ~~text~~
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    // Hapus karakter list * atau - atau 1.
    .replace(/^[\*\-\+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Hapus baris pemisah ---
    .replace(/^---$/gm, '')
    // Rapikan spasi berlebih
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useTextToSpeech() {
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeakingMessageId(null);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback((messageId: string, text: string) => {
    if (!synthRef.current) return;

    // Jika sedang membaca pesan yang sama, hentikan
    if (speakingMessageId === messageId) {
      stop();
      return;
    }

    // Hentikan suara yang sedang berjalan sebelumnya
    synthRef.current.cancel();

    const cleanText = cleanMarkdownForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Deteksi bahasa sederhana (Indonesian vs English)
    const indonesianKeywords = /\b(dan|yang|di|ke|ini|itu|bisa|adalah|untuk|kamu|saya|dengan|pada|dari|oleh|kita|mereka)\b/i;
    const isIndonesian = indonesianKeywords.test(cleanText);

    // Cari voice yang cocok jika tersedia di peramban
    const voices = synthRef.current.getVoices() || [];
    if (isIndonesian) {
      utterance.lang = 'id-ID';
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 1.05; // Sedikit lebih responsif dan alami
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      // Abaikan cancel error biasa
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      setSpeakingMessageId(null);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    synthRef.current.speak(utterance);
  }, [speakingMessageId, stop]);

  return {
    speakingMessageId,
    isPaused,
    speak,
    stop
  };
}
