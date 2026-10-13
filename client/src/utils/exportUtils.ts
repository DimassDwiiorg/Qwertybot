import { SessionDetails } from '../types/index.js';

export function exportChatToMarkdown(session: SessionDetails): void {
  const dateStr = new Date(session.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let md = `# 🤖 ${session.title || 'Percakapan qwertybot'}\n\n`;
  md += `> **Kode Sesi:** \`${session.sessionCode}\` | **Tanggal:** ${dateStr} | **Total Pesan:** ${session.messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of session.messages) {
    const isUser = msg.role === 'user';
    const sender = isUser ? '👤 **Pengguna**' : '🤖 **qwertybot AI**';
    const time = new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    md += `### ${sender} _(${time})_\n\n`;

    if (msg.attachments && msg.attachments.length > 0) {
      md += `*Lampiran:*\n`;
      for (const att of msg.attachments) {
        md += `- [${att.name}] (${att.type})\n`;
      }
      md += `\n`;
    }

    md += `${msg.content}\n\n---\n\n`;
  }

  md += `_Diekspor dari [qwertybot AI](http://localhost:5000) oleh Dimas Dwi Syahputra._\n`;

  downloadFile(md, `${sanitizeFileName(session.title || 'chat')}-${session.sessionCode}.md`, 'text/markdown');
}

export function exportChatToText(session: SessionDetails): void {
  const dateStr = new Date(session.createdAt).toLocaleDateString('id-ID');
  let txt = `qwertybot AI - ${session.title}\n`;
  txt += `Session Code: ${session.sessionCode}\n`;
  txt += `Tanggal: ${dateStr}\n`;
  txt += `========================================\n\n`;

  for (const msg of session.messages) {
    const isUser = msg.role === 'user';
    const sender = isUser ? 'User' : 'qwertybot';
    const time = new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    txt += `[${time}] ${sender}:\n`;
    if (msg.attachments && msg.attachments.length > 0) {
      txt += `[Lampiran: ${msg.attachments.map(a => a.name).join(', ')}]\n`;
    }
    txt += `${msg.content}\n\n----------------------------------------\n\n`;
  }

  downloadFile(txt, `${sanitizeFileName(session.title || 'chat')}-${session.sessionCode}.txt`, 'text/plain');
}

function sanitizeFileName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
