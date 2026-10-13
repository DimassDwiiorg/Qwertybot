import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { sessionStore } from '../services/sessionStore.js';
import { geminiService } from '../services/geminiService.js';
import { quotaService } from '../services/quotaService.js';
import { resolveQuotaIdentifier } from './quotaController.js';
import { AttachmentMeta, ChatMessage, GeminiPart } from '../types/index.js';

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, sessionCode, message = '', userName = '', ownerId = '', selectedModel = '', userEmail = '', adminToken = '' } = req.body;
    const effectiveAdminToken = (adminToken || req.headers['x-admin-token'] || '').toString().trim();
    const effectiveUserEmail = (userEmail || req.headers['x-user-email'] || '').toString().trim();

    // 1. Dapatkan atau buat session
    let session = sessionId
      ? sessionStore.getByIdOrCode(sessionId)
      : sessionCode
      ? sessionStore.getByIdOrCode(sessionCode)
      : undefined;

    if (!session) {
      session = sessionStore.createSession(ownerId ? String(ownerId).trim() : undefined);
    } else if (ownerId && (!session.ownerId || session.ownerId.startsWith('guest_'))) {
      sessionStore.updateOwner(session.id, String(ownerId).trim());
      session.ownerId = String(ownerId).trim();
    }

    // 2. Proses attachments jika ada file yang diunggah
    const files = (req.files as Express.Multer.File[]) || [];
    const attachments: AttachmentMeta[] = [];
    const userGeminiParts: GeminiPart[] = [];

    for (const f of files) {
      const fileBuffer = fs.readFileSync(f.path);
      const ext = path.extname(f.originalname).toLowerCase();
      let rawMime = (f.mimetype || 'application/octet-stream').split(';')[0].trim().toLowerCase();

      // Normalisasi MIME audio untuk perekam browser
      if (rawMime === 'video/webm' || rawMime === 'audio/octet-stream' || ext === '.webm') {
        rawMime = 'audio/webm';
      } else if (rawMime === 'audio/x-wav' || ext === '.wav') {
        rawMime = 'audio/wav';
      } else if (ext === '.mp3') {
        rawMime = 'audio/mp3';
      } else if (ext === '.ogg') {
        rawMime = 'audio/ogg';
      } else if (ext === '.m4a') {
        rawMime = 'audio/m4a';
      } else if (ext === '.pdf') {
        rawMime = 'application/pdf';
      }

      let type: 'image' | 'audio' | 'document' = 'document';
      if (rawMime.startsWith('image/')) {
        type = 'image';
      } else if (rawMime.startsWith('audio/')) {
        type = 'audio';
      }

      const attachmentId = uuidv4();
      const relativeUrl = `/uploads/${path.basename(f.path)}`;
      const base64Data = fileBuffer.toString('base64');

      attachments.push({
        id: attachmentId,
        name: f.originalname,
        mimeType: rawMime,
        size: f.size,
        type,
        url: relativeUrl,
        base64Data
      });

      // Deteksi file teks / kode untuk dibaca langsung sebagai teks terstruktur
      const textExtensions = ['.txt', '.md', '.json', '.csv', '.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.c', '.cpp', '.java'];
      if (textExtensions.includes(ext) || rawMime.startsWith('text/')) {
        try {
          const textContent = fileBuffer.toString('utf-8');
          userGeminiParts.push({
            text: `[Isi Berkas Lampiran: ${f.originalname}]\n\`\`\`\n${textContent}\n\`\`\``
          });
          continue;
        } catch {
          // fallback ke inlineData
        }
      }

      // Kirim sebagai inlineData untuk gambar, PDF, dan audio
      userGeminiParts.push({
        inlineData: {
          mimeType: rawMime,
          data: base64Data
        }
      });
    }

    // Tambahkan teks prompt user jika ada
    const textMessage = (message || '').trim();
    if (textMessage) {
      userGeminiParts.push({ text: textMessage });
    } else if (attachments.length > 0) {
      // Jika user hanya mengirim audio VN atau gambar tanpa caption, beri teks default agar Gemini merespon
      const audioAtt = attachments.find(a => a.type === 'audio');
      if (audioAtt) {
        userGeminiParts.push({
          text: 'Tolong dengarkan rekaman suara (voice note) ini dengan seksama, pahami maksudnya, dan berikan tanggapan yang relevan dan solutif.'
        });
      } else {
        userGeminiParts.push({
          text: 'Tolong periksa dan analisis lampiran yang saya kirimkan ini.'
        });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Pesan atau lampiran tidak boleh kosong.' });
    }

    // 3. Periksa dan konsumsi kuota AI sebelum memproses pesan
    const { id: quotaId, isLoggedIn, isOwner } = resolveQuotaIdentifier(req);
    const quotaResult = quotaService.consumeQuota(quotaId, isLoggedIn, isOwner);

    if (!quotaResult.success) {
      return res.status(429).json({
        success: false,
        error: quotaResult.error,
        quotaExhausted: true,
        quota: quotaResult.quota
      });
    }

    // 4. Simpan pesan user ke session
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: textMessage || (attachments.length > 0 ? `[Mengirim ${attachments.length} lampiran]` : ''),
      timestamp: Date.now(),
      attachments: attachments.map(a => ({
        // Simpan tanpa data base64 besar di session json agar efisien
        id: a.id,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        type: a.type,
        url: a.url
      }))
    };

    sessionStore.addMessage(session.id, userMessage);

    const isStream = req.query.stream === 'true' || req.headers.accept?.includes('text/event-stream');

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Kirim meta info beserta status kuota terupdate
      res.write(`event: meta\ndata: ${JSON.stringify({
        sessionId: session.id,
        sessionCode: session.sessionCode,
        title: session.title,
        userMessage,
        quota: quotaResult.quota
      })}\n\n`);

      let accumulated = '';
      const botMessageId = uuidv4();

      try {
        await geminiService.generateChatResponseStream(
          session.messages.slice(0, -1),
          userGeminiParts,
          (delta) => {
            accumulated += delta;
            res.write(`event: chunk\ndata: ${JSON.stringify({ text: delta })}\n\n`);
          },
          userName,
          selectedModel,
          effectiveUserEmail,
          effectiveAdminToken,
          (type, data) => {
            if (type === 'call') {
              res.write(`event: tool_call\ndata: ${JSON.stringify(data)}\n\n`);
            } else if (type === 'result') {
              res.write(`event: tool_result\ndata: ${JSON.stringify(data)}\n\n`);
            }
          }
        );

        const botMessage: ChatMessage = {
          id: botMessageId,
          role: 'model',
          content: accumulated,
          timestamp: Date.now()
        };
        sessionStore.addMessage(session.id, botMessage);

        res.write(`event: done\ndata: ${JSON.stringify({
          botMessage,
          title: session.title,
          quota: quotaResult.quota
        })}\n\n`);
        return res.end();
      } catch (err: any) {
        // Kembalikan kuota jika streaming error
        quotaService.refundQuota(quotaId);
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        return res.end();
      }
    }

    // 5. Minta respon dari Gemini dengan memori pesan terdahulu (Non-Streaming)
    try {
      const botReplyText = await geminiService.generateChatResponse(
        session.messages.slice(0, -1),
        userGeminiParts,
        userName,
        selectedModel,
        effectiveUserEmail,
        effectiveAdminToken
      );

      // 6. Simpan pesan bot ke session
      const botMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: botReplyText,
        timestamp: Date.now()
      };

      sessionStore.addMessage(session.id, botMessage);

      return res.json({
        success: true,
        sessionId: session.id,
        sessionCode: session.sessionCode,
        title: session.title,
        userMessage,
        botMessage,
        quota: quotaResult.quota
      });
    } catch (err: any) {
      // Kembalikan kuota jika gagal
      quotaService.refundQuota(quotaId);
      throw err;
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Terjadi kesalahan saat memproses chat dengan qwertybot.'
    });
  }
};
