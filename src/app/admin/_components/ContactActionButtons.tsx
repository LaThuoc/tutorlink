'use client';

import React, { useTransition } from 'react';
import { Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { updateContactStatus, deleteContactMessage } from '@/src/modules/auth/actions/admin';

export function ContactActionButtons({
  id,
  email,
  subject,
  currentStatus,
}: {
  id: string;
  email: string;
  subject: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleMarkResolved = () => {
    startTransition(async () => {
      await updateContactStatus(id, 'resolved');
    });
  };

  const handleDelete = () => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    startTransition(async () => {
      await deleteContactMessage(id);
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {/* Mở trình gửi mail mặc định để trả lời trực tiếp cho người gửi */}
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: [GiaSuHub] ${subject}`)}`}
        onClick={() => {
          if (currentStatus === 'pending') {
            startTransition(async () => {
              await updateContactStatus(id, 'processing');
            });
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
        title="Phản hồi qua Email"
      >
        <Mail className="size-3.5" />
        <span>Phản hồi</span>
      </a>

      {/* Đánh dấu đã xử lý xong */}
      {currentStatus !== 'resolved' && (
        <button
          type="button"
          onClick={handleMarkResolved}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 disabled:opacity-50 transition cursor-pointer"
          title="Đánh dấu đã phản hồi"
        >
          <CheckCircle2 className="size-3.5" />
          <span>Xong</span>
        </button>
      )}

      {/* Xóa tin nhắn */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition cursor-pointer"
        title="Xóa tin nhắn"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}