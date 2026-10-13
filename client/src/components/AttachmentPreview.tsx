import React from 'react';
import { X, FileText, Volume2 } from 'lucide-react';
import { AttachmentMeta } from '../types/index.js';

interface AttachmentPreviewProps {
  attachments: AttachmentMeta[];
  onRemove: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2.5 pb-1 border-b border-[#E5E3DB] dark:border-[#3F3F46]">
      {attachments.map((att) => {
        const isImage = att.type === 'image';
        const isAudio = att.type === 'audio';

        return (
          <div
            key={att.id}
            className="group relative flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium max-w-xs transition-all"
          >
            {isImage && att.previewUrl ? (
              <img
                src={att.previewUrl}
                alt={att.name}
                className="w-7 h-7 object-cover rounded-lg border border-black/10 dark:border-white/10"
              />
            ) : isAudio ? (
              <div className="w-7 h-7 rounded-lg bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center shrink-0">
                <Volume2 size={15} />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <FileText size={15} />
              </div>
            )}

            <div className="min-w-0 pr-1">
              <p className="truncate text-[#23201D] dark:text-[#F4F4F5] max-w-[140px] text-[11px] leading-tight">
                {att.name}
              </p>
              <p className="text-[10px] text-[#8C8782] dark:text-[#71717A]">
                {(att.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[#8C8782] dark:text-[#71717A] hover:text-red-500 transition-colors"
              title="Hapus Lampiran"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
