export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResultItem[];
  error?: string;
}

export interface WebPageReadResponse {
  url: string;
  title: string;
  content: string;
  error?: string;
}

export class SearchService {
  /**
   * Melakukan pencarian web menggunakan DuckDuckGo HTML endpoint secara mandiri dan 100% gratis.
   * Tidak memerlukan API Key, tidak memerlukan kartu debit/kredit, dan menggunakan native fetch.
   */
  public async searchWeb(query: string, maxResults = 5): Promise<WebSearchResponse> {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      return { query: '', results: [] };
    }

    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://html.duckduckgo.com/'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        throw new Error(`DuckDuckGo merespon HTTP ${res.status}`);
      }

      const html = await res.text();
      const results: SearchResultItem[] = [];
      const blocks = html.split('<div class="result results_links results_links_deep web-result');

      const clean = (s: string) =>
        (s || '')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();

      for (const block of blocks.slice(1, maxResults + 1)) {
        const titleMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
        const urlMatch = block.match(/<a class="result__url" href="([^"]+)"/i);
        const headerMatch = block.match(/<h2 class="result__title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);

        let finalUrl = '';
        if (urlMatch) {
          const rawUrl = urlMatch[1];
          const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
          finalUrl = uddgMatch ? decodeURIComponent(uddgMatch[1]) : rawUrl;
        }

        const title = clean(headerMatch ? headerMatch[1] : '');
        const snippet = clean(titleMatch ? titleMatch[1] : '');

        if (title || snippet) {
          results.push({
            title,
            snippet,
            url: finalUrl
          });
        }
      }

      return {
        query: trimmed,
        results
      };
    } catch (err: any) {
      console.warn(`[SearchService] Gagal mencari query "${trimmed}":`, err.message);
      return {
        query: trimmed,
        results: [],
        error: `Gagal mencari di web: ${err.message}`
      };
    }
  }

  /**
   * Mengunjungi dan membaca seluruh isi teks halaman web dari URL tertentu secara mandiri dan 100% gratis.
   */
  public async readWebPage(targetUrl: string): Promise<WebPageReadResponse> {
    const trimmedUrl = (targetUrl || '').trim();
    if (!trimmedUrl) {
      return { url: '', title: '', content: '', error: 'URL tidak boleh kosong.' };
    }

    try {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
      } catch {
        return { url: trimmedUrl, title: '', content: '', error: 'Format URL tidak valid.' };
      }

      const res = await fetch(parsedUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.google.com/'
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow'
      });

      if (!res.ok) {
        return {
          url: parsedUrl.toString(),
          title: '',
          content: '',
          error: `Gagal mengakses halaman web (HTTP ${res.status}: ${res.statusText})`
        };
      }

      const contentType = res.headers.get('content-type') || '';
      const rawText = await res.text();

      // Jika formatnya JSON atau teks biasa
      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        return {
          url: parsedUrl.toString(),
          title: parsedUrl.hostname,
          content: rawText.slice(0, 15000)
        };
      }

      // Ambil judul halaman
      const titleMatch = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = (titleMatch ? titleMatch[1] : parsedUrl.hostname)
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      // Bersihkan elemen HTML yang tidak membawa konten artikel
      let cleaned = rawText
        .replace(/<!--[\s\S]*?-->/g, '') // Komentar HTML
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script JS
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Style CSS
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '') // SVG
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '') // Header navigasi
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '') // Footer
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ''); // Navigasi

      // Format elemen teks ke Markdown dasar
      cleaned = cleaned
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<hr\s*[\/]?>/gi, '\n---\n');

      // Bersihkan seluruh sisa tag HTML
      cleaned = cleaned.replace(/<[^>]+>/g, ' ');

      // Unescape HTML entities umum
      cleaned = cleaned
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&bull;/g, '•')
        .replace(/&copy;/g, '©');

      // Rapikan baris kosong berturut-turut
      cleaned = cleaned
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join('\n\n');

      // Batasi panjang teks hingga ~15.000 karakter agar efisien bagi model
      const maxLength = 15000;
      let finalContent = cleaned;
      if (finalContent.length > maxLength) {
        finalContent = finalContent.slice(0, maxLength) + '\n\n[... Konten halaman dipotong demi efisiensi ...]';
      }

      if (!finalContent.trim()) {
        finalContent = 'Halaman berhasil dimuat tetapi tidak ditemukan teks konten utama yang dapat dibaca.';
      }

      return {
        url: parsedUrl.toString(),
        title,
        content: finalContent
      };
    } catch (err: any) {
      console.warn(`[SearchService] Gagal membaca URL "${trimmedUrl}":`, err.message);
      return {
        url: trimmedUrl,
        title: '',
        content: '',
        error: `Gagal membaca halaman web: ${err.message}`
      };
    }
  }
}

export const searchService = new SearchService();
