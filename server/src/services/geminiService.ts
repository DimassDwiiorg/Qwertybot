import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { GeminiContent, GeminiPart, ChatMessage } from '../types/index.js';
import { adminService } from './adminService.js';
import { searchService } from './searchService.js';

export const QWERTYBOT_MODEL_NAMES: Record<string, string> = {
  'gemini-3.5-flash-lite': 'qwertybot 3.5 Lite',
  'gemini-flash-lite-latest': 'qwertybot 4.0 Standard',
  'gemini-3.1-flash-lite': 'qwertybot 4.5 Turbo',
  'gemini-3.1-pro-preview': 'qwertybot 5.0 Pro'
};

export function getModelDisplayName(modelId?: string): string {
  if (!modelId) return 'qwertybot 3.5 Lite';
  return QWERTYBOT_MODEL_NAMES[modelId] || 'qwertybot 3.5 Lite';
}

/**
 * Deklarasi Tool Web Search DuckDuckGo & Pembaca URL untuk semua pengguna secara gratis
 */
export const WEB_SEARCH_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_web',
        description: 'Mencari informasi aktual, berita terkini, artikel, situs web, atau fakta terbaru dari internet melalui mesin pencari DuckDuckGo. Gunakan tool ini jika pengguna menanyakan informasi yang membutuhkan data web terbaru, fakta terkini, cuaca, skor/jadwal pertandingan, atau referensi eksternal.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'Kata kunci pencarian yang spesifik dan efektif dalam bahasa yang sesuai (contoh: "presiden indonesia saat ini", "berita teknologi hari ini", "jadwal motogp 2026")'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'read_web_page',
        description: 'Membuka dan membaca seluruh isi teks konten dari alamat URL/tautan web tertentu di internet. Gunakan tool ini jika pengguna menyertakan link URL spesifik atau meminta untuk membuka, membaca, merangkum, atau membedah artikel dari suatu halaman web (contoh: "baca artikel di https://...", "rangkum web ini...", dll).',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: {
              type: 'STRING',
              description: 'Alamat URL web lengkap yang akan dibuka (contoh: "https://id.wikipedia.org/wiki/Indonesia")'
            }
          },
          required: ['url']
        }
      }
    ]
  }
];

/**
 * Deklarasi Tools VPS untuk Gemini Function Calling
 * Hanya diaktifkan jika verifikasi 2 tahap berhasil (Email Owner + Password VPS)
 */
export const VPS_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'execute_vps_command',
        description: 'Menjalankan perintah terminal/bash langsung di server VPS qwertybot (contoh: "pm2 status", "df -h", "free -m", "uptime", "git pull", "git status"). Hanya untuk Owner terverifikasi password VPS.',
        parameters: {
          type: 'OBJECT',
          properties: {
            command: {
              type: 'STRING',
              description: 'Perintah shell/bash Linux yang akan dieksekusi di server VPS'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'read_project_file',
        description: 'Membaca isi berkas kode sumber di dalam direktori projek qwertybot di server VPS (contoh: "client/src/App.tsx", "server/src/index.ts", "package.json").',
        parameters: {
          type: 'OBJECT',
          properties: {
            filePath: {
              type: 'STRING',
              description: 'Path relatif file terhadap folder root projek'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'write_project_file',
        description: 'Menulis atau memperbarui file kode di dalam direktori projek qwertybot di server VPS untuk mengupdate atau memperbaiki diri sendiri.',
        parameters: {
          type: 'OBJECT',
          properties: {
            filePath: {
              type: 'STRING',
              description: 'Path relatif file terhadap direktori projek'
            },
            content: {
              type: 'STRING',
              description: 'Seluruh isi berkas teks kode yang baru'
            }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'rebuild_and_reload_vps',
        description: 'Menjalankan build ulang (npm run build) dan me-reload proses PM2 di VPS agar pembaruan kode terbaru langsung aktif di website secara seamless.',
        parameters: {
          type: 'OBJECT',
          properties: {
            reason: {
              type: 'STRING',
              description: 'Alasan atau ringkasan perubahan yang di-reload'
            }
          }
        }
      }
    ]
  }
];

export type ToolEventHandler = (type: 'call' | 'result', data: any) => void;

export class GeminiService {
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor() {
    this.apiKey = config.geminiApiKey;
    this.primaryModel = config.primaryModel;
    this.fallbackModels = config.fallbackModels;
  }

  /**
   * Mengonversi riwayat percakapan session menjadi format contents Gemini API
   * Menerapkan sliding window (maks 20 pesan) untuk efisiensi token dan ketahanan
   */
  private formatHistory(messages: ChatMessage[], latestUserParts: GeminiPart[], userName?: string): GeminiContent[] {
    const contents: GeminiContent[] = [];
    const maxHistory = config.limits?.maxHistoryMessages || 20;
    const windowMessages = messages.slice(-maxHistory);

    // Tambahkan riwayat obrolan sebelumnya
    for (const msg of windowMessages) {
      const parts: GeminiPart[] = [];

      if (msg.role === 'user') {
        if (msg.attachments && msg.attachments.length > 0) {
          for (const att of msg.attachments) {
            let data = att.base64Data;
            if (!data && att.url) {
              const diskPath = path.join(config.uploadDir, path.basename(att.url));
              if (fs.existsSync(diskPath)) {
                try {
                  data = fs.readFileSync(diskPath).toString('base64');
                } catch (e) {
                  console.warn('Gagal memuat attachment riwayat dari disk:', e);
                }
              }
            }

            if (data) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data
                }
              });
            }
          }
        }
        if (msg.content) {
          parts.push({ text: msg.content });
        }
      } else {
        parts.push({ text: msg.content || '' });
      }

      if (parts.length > 0) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts
        });
      }
    }

    // Profil nama pengguna disisipkan sebagai DATA terstruktur aman di turn user
    const userParts: GeminiPart[] = [];
    if (userName && userName.trim()) {
      const sanitizedName = userName.trim().slice(0, config.limits?.maxUserNameChars || 60).replace(/[<>]/g, '');
      userParts.push({
        text: `[Konteks Pengguna: Nama pengguna yang sedang berkomunikasi adalah "${sanitizedName}".]`
      });
    }
    userParts.push(...latestUserParts);

    // Tambahkan giliran pesan user terbaru
    contents.push({
      role: 'user',
      parts: userParts
    });

    return contents;
  }

  /**
   * Menyusun system instruction secara dinamis dengan status keamanan Owner & VPS
   */
  private buildSystemInstruction(
    currentModelName: string,
    userEmail?: string,
    isOwnerVerified?: boolean
  ): string {
    const isOwnerEmail = Boolean(userEmail && userEmail.trim().toLowerCase() === config.admin.ownerEmail);
    let ownerSecurityContext = '';

    if (isOwnerVerified) {
      ownerSecurityContext = `\n\n[STATUS OWNER TERVERIFIKASI TAHAP 2 (AKTIF)]
Pengguna saat ini terverifikasi secara sah sebagai OWNER RESMI: Dimas Dwi Syahputra (${config.admin.ownerEmail}).
Verifikasi keamanan tahap 2 (Password VPS) TELAH BERHASIL DAN AKTIF.
Kamu memiliki akses eksklusif ke Tools Server VPS berikut:
- execute_vps_command: Eksekusi perintah bash di server VPS (cek status PM2, cek resource RAM/CPU, git, dsb).
- read_project_file: Baca berkas kode sumber projek qwertybot.
- write_project_file: Perbarui file kode untuk mengupdate diri sendiri.
- rebuild_and_reload_vps: Jalankan build dan reload proses PM2 di VPS setelah kamu selesai mengubah kode.

Jika Mas Dimas meminta kamu memeriksa kondisi server, membaca log, atau mengupdate dirimu (menambah fitur, mengubah UI/backend), GUNAKAN tools ini secara otonom untuk menyelesaikan tugas tersebut, lalu sampaikan laporan pengerjaanmu dengan jelas dan rapi.`;
    } else if (isOwnerEmail) {
      ownerSecurityContext = `\n\n[STATUS OWNER: VERIFIKASI TAHAP 2 (PASSWORD VPS) BELUM DIBUKA]
Pengguna terdeteksi sebagai Dimas Dwi Syahputra (Owner resmi), TETAPI verifikasi keamanan tahap 2 (Password VPS) belum dimasukkan atau belum aktif.
Seluruh tools eksekusi server VPS saat ini terkunci demi keamanan.
Jika Mas Dimas meminta kamu menjalankan perintah server atau mengupdate diri di VPS, jelaskan dengan ramah bahwa Mas Dimas perlu mengklik tombol "🔒 Verifikasi VPS" di bagian atas header tampilan dan memasukkan password VPS terlebih dahulu untuk membuka akses keamanan tahap 2.`;
    } else {
      ownerSecurityContext = `\n\n[STATUS KEAMANAN: PENGGUNA BUKAN OWNER]
Pengguna ini BUKAN owner qwertybot. Akses kontrol server VPS, terminal bash, dan pembaruan kode sistem DITUTUP TOTAL demi keamanan. Jika pengguna meminta untuk mengakses server, menjalankan perintah terminal, atau mengubah sistem, tolak dengan sopan dan tegaskan bahwa fitur pengelolaan server VPS dikhususkan secara eksklusif untuk Dimas Dwi Syahputra.`;
    }

    return `${config.systemInstruction}

[Konteks Model Aktif: Saat ini kamu beroperasi dengan versi model "${currentModelName}". Jika pengguna bertanya mengenai model apa yang kamu gunakan, versi berapa dirimu, atau pertanyaan terkait model AI di web ini, akui dan sebutkan secara konsisten dan percaya diri bahwa kamu adalah qwertybot versi "${currentModelName}" yang diciptakan dan dikembangkan oleh Dimas Dwi Syahputra. Jangan pernah menyebut nama Gemini, Google Gemini, OpenAI, atau model pihak ketiga lainnya sebagai identitas versimu. Jawab mengenai versimu hanya ketika pengguna menanyakannya secara langsung atau relevan dengan topik.]

[Kemampuan Menelusuri Web & Membaca URL]:
Kamu memiliki akses ke 2 tool penelusuran web berikut:
1. "search_web": Mencari informasi aktual di internet melalui DuckDuckGo secara realtime. Gunakan jika pengguna menanyakan peristiwa baru, berita hari ini, fakta terkini, atau membutuhkan pencarian data eksternal.
2. "read_web_page": Membuka dan membaca seluruh isi artikel/halaman web dari suatu tautan/URL secara utuh. Gunakan jika pengguna meminta membaca link tertentu (misal: "baca artikel di https://...", "rangkum tautan ini...", "analisis isi web...").
- Setelah mendapatkan informasi web, rangkum informasinya secara padat, jelas, akurat, dan gunakan gaya bahasa ramah.
- Selalu sertakan sumber referensi atau URL yang kamu dapatkan di bagian akhir jawabanmu dengan format link Markdown rapi (contoh: [Judul Artikel](url)) agar pengguna dapat memverifikasi informasi tersebut.${ownerSecurityContext}`;
  }

  /**
   * Menyiapkan daftar deklarasi tools yang tersedia berdasarkan hak akses pengguna
   */
  private getAvailableTools(isOwnerVerified: boolean) {
    return [
      {
        functionDeclarations: [
          ...WEB_SEARCH_TOOLS[0].functionDeclarations,
          ...(isOwnerVerified ? VPS_TOOLS[0].functionDeclarations : [])
        ]
      }
    ];
  }

  /**
   * Eksekusi tools (Web Search DuckDuckGo, Pembaca URL Web, atau VPS)
   */
  private async executeTool(name: string, args: any, isOwnerVerified: boolean): Promise<any> {
    console.log(`[GeminiService] AI mengeksekusi Tool: ${name}`, args);
    try {
      if (name === 'search_web') {
        const query = args?.query || '';
        return await searchService.searchWeb(query);
      } else if (name === 'read_web_page') {
        const url = args?.url || '';
        return await searchService.readWebPage(url);
      } else if (isOwnerVerified) {
        if (name === 'execute_vps_command') {
          return await adminService.executeCommand(args.command);
        } else if (name === 'read_project_file') {
          return await adminService.readProjectFile(args.filePath);
        } else if (name === 'write_project_file') {
          return await adminService.writeProjectFile(args.filePath, args.content);
        } else if (name === 'rebuild_and_reload_vps') {
          return await adminService.rebuildAndReload(args.reason);
        }
      }
      return { error: `Tool tidak dikenali atau akses ditolak: ${name}` };
    } catch (err: any) {
      console.error(`[GeminiService] Error saat mengeksekusi tool ${name}:`, err);
      return { error: err.message || 'Gagal mengeksekusi tool.' };
    }
  }

  /**
   * Mengirim request ke Gemini API (Non-Streaming) dengan dukungan Tool Calling (Web Search & VPS)
   */
  public async generateChatResponse(
    previousMessages: ChatMessage[],
    latestUserParts: GeminiPart[],
    userName?: string,
    modelOverride?: string,
    userEmail?: string,
    adminToken?: string
  ): Promise<string> {
    const isOwnerVerified = Boolean(
      userEmail &&
      userEmail.trim().toLowerCase() === config.admin.ownerEmail &&
      adminService.validateToken(adminToken, userEmail)
    );

    const contents = this.formatHistory(previousMessages, latestUserParts, userName);
    const primary = modelOverride?.trim() || this.primaryModel;
    const modelsToTry = Array.from(new Set([
      primary,
      this.primaryModel,
      ...this.fallbackModels,
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite'
    ].filter(Boolean)));
    const currentModelName = getModelDisplayName(primary);
    const dynamicInstruction = this.buildSystemInstruction(currentModelName, userEmail, isOwnerVerified);
    const tools = this.getAvailableTools(isOwnerVerified);

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        let loopCount = 0;
        const maxLoops = 6;

        while (loopCount < maxLoops) {
          loopCount++;

          const payload: any = {
            contents,
            systemInstruction: {
              parts: [{ text: dynamicInstruction }]
            },
            tools,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: config.limits?.maxOutputTokens || 8192
            }
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(60000)
          });

          const data = await res.json() as any;

          if (!res.ok || data.error) {
            const errMsg = data.error?.message || `HTTP ${res.status}`;
            console.warn(`[GeminiService] Model ${model} returned error: ${errMsg}`);
            throw new Error(errMsg);
          }

          const candidate = data.candidates?.[0];
          if (!candidate || !candidate.content?.parts) {
            throw new Error('Tidak ada respon teks atau fungsi yang dihasilkan oleh model.');
          }

          // Cek apakah ada functionCall dari Gemini
          const functionCallPart = candidate.content.parts.find((p: any) => p.functionCall);
          if (functionCallPart) {
            const { name, args } = functionCallPart.functionCall;
            const toolResult = await this.executeTool(name, args, isOwnerVerified);

            // Tambahkan giliran pemanggilan tool ke konteks percakapan
            contents.push(candidate.content);
            contents.push({
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name,
                    response: { result: toolResult }
                  }
                }
              ]
            });
            continue; // Ulangi loop untuk mendapatkan respon lanjutan atau kesimpulan
          }

          const textOutput = candidate.content.parts
            .map((p: any) => p.text || '')
            .join('\n');

          return textOutput;
        }

        throw new Error('Mencapai batas perulangan tool eksekusi.');
      } catch (err: any) {
        console.warn(`[GeminiService] Exception with model ${model}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('Gagal menghubungi Gemini API setelah mencoba model yang tersedia.');
  }

  /**
   * Mengirim request streaming ke Gemini API dengan dukungan Tool Calling (Web Search & VPS)
   */
  public async generateChatResponseStream(
    previousMessages: ChatMessage[],
    latestUserParts: GeminiPart[],
    onChunk: (delta: string) => void,
    userName?: string,
    modelOverride?: string,
    userEmail?: string,
    adminToken?: string,
    onToolEvent?: ToolEventHandler
  ): Promise<string> {
    const isOwnerVerified = Boolean(
      userEmail &&
      userEmail.trim().toLowerCase() === config.admin.ownerEmail &&
      adminService.validateToken(adminToken, userEmail)
    );

    const contents = this.formatHistory(previousMessages, latestUserParts, userName);
    const primary = modelOverride?.trim() || this.primaryModel;
    const modelsToTry = Array.from(new Set([
      primary,
      this.primaryModel,
      ...this.fallbackModels,
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite'
    ].filter(Boolean)));
    const currentModelName = getModelDisplayName(primary);
    const dynamicInstruction = this.buildSystemInstruction(currentModelName, userEmail, isOwnerVerified);
    const tools = this.getAvailableTools(isOwnerVerified);

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        let loopCount = 0;
        const maxLoops = 6;

        while (loopCount < maxLoops) {
          loopCount++;

          const payload: any = {
            contents,
            systemInstruction: {
              parts: [{ text: dynamicInstruction }]
            },
            tools,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: config.limits?.maxOutputTokens || 8192
            }
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(60000)
          });

          const data = await res.json() as any;

          if (!res.ok || data.error) {
            const errMsg = data.error?.message || `HTTP ${res.status}`;
            throw new Error(errMsg);
          }

          const candidate = data.candidates?.[0];
          if (!candidate?.content?.parts) {
            throw new Error('Tidak ada respon dari model.');
          }

          const functionCallPart = candidate.content.parts.find((p: any) => p.functionCall);
          if (functionCallPart) {
            const { name, args } = functionCallPart.functionCall;
            onToolEvent?.('call', { name, args });

            const toolResult = await this.executeTool(name, args, isOwnerVerified);
            onToolEvent?.('result', { name, result: toolResult });

            contents.push(candidate.content);
            contents.push({
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name,
                    response: { result: toolResult }
                  }
                }
              ]
            });
            continue; // Lanjutkan loop untuk langkah berikutnya
          }

          // Hasil teks akhir, lakukan streaming chunk halus ke UI
          const textOutput = candidate.content.parts
            .map((p: any) => p.text || '')
            .join('\n');

          if (textOutput) {
            const chunkSize = 16;
            for (let i = 0; i < textOutput.length; i += chunkSize) {
              onChunk(textOutput.slice(i, i + chunkSize));
              if (textOutput.length > 50) {
                await new Promise((r) => setTimeout(r, 12));
              }
            }
            return textOutput;
          }
          break;
        }
      } catch (err: any) {
        console.warn(`[GeminiService Stream] Model ${model} exception:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('Gagal memproses respon AI dari model yang tersedia.');
  }
}

export const geminiService = new GeminiService();
