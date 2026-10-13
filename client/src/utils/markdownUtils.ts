/**
 * Utility untuk memproses teks Markdown dan LaTeX matematika
 * agar dapat dirender dengan sempurna oleh ReactMarkdown, remark-math, dan rehype-katex.
 */
export function preprocessLaTeX(content: string): string {
  if (!content) return '';

  // 1. Amankan blok kode (fenced code blocks atau inline code) agar sintaks di dalamnya tidak terubah
  const codeBlocks: string[] = [];
  let text = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // 2. Normalisasi format display math LaTeX: \[ ... \] -> \n\n$$\n...\n$$\n\n
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
    return `\n\n$$\n${formula.trim()}\n$$\n\n`;
  });

  // 3. Normalisasi format inline math LaTeX: \( ... \) -> $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, formula) => {
    return `$${formula.trim()}$`;
  });

  // 4. Pastikan URL gambar di Markdown yang mengandung spasi di-encode dengan benar
  text = text.replace(/(!\[.*?\]\()([^)]+)(\))/g, (_match, start, url, end) => {
    try {
      return start + encodeURI(decodeURI(url.trim())) + end;
    } catch {
      return start + url.trim().replace(/\s+/g, '%20') + end;
    }
  });

  // 5. Kembalikan blok kode semula
  text = text.replace(/___CODE_BLOCK_(\d+)___/g, (_match, index) => {
    return codeBlocks[parseInt(index, 10)] ?? '';
  });

  return text;
}
