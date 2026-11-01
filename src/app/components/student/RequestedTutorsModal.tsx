'use client';

import { X, Clock, CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export type RequestedTutor = {
  id: string; // ID của yêu cầu học (booking_request)
  tutor_user_id: string; // ID/User_ID của Gia sư để điều hướng
  tutor_name: string;
  tutor_avatar?: string | null;
  subject: string;
  grade: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  hourly_rate: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requests: RequestedTutor[];
};

export function RequestedTutorsModal({ isOpen, onClose, requests }: Props) {
  if (!isOpen) return null;

  const getStatusBadge = (status: RequestedTutor['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
            <CheckCircle className="size-3.5" /> Đã chấp nhận
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
            <XCircle className="size-3.5" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
            <Clock className="size-3.5" /> Đang chờ trả lời
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Gia sư đã gửi yêu cầu</h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi trạng thái phản hồi từ các gia sư</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {requests.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto size-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">Chưa gửi yêu cầu nào</p>
              <p className="text-xs text-slate-500">Hãy tìm gia sư phù hợp và gửi yêu cầu học ngay nhé!</p>
            </div>
          ) : (
            requests.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white text-sm">
                    {item.tutor_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.tutor_name}</h4>
                    <p className="text-xs text-slate-600">
                      Môn: <span className="font-medium text-slate-900">{item.subject}</span> ({item.grade})
                    </p>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">
                      {item.hourly_rate > 0 ? `${item.hourly_rate.toLocaleString('vi-VN')} đ/giờ` : 'Đang cập nhật giá'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  {getStatusBadge(item.status)}
                  <Link
                    href={`/tutors/${item.tutor_user_id}`}
                    onClick={onClose}
                    className="grid size-8 place-items-center rounded-xl bg-white text-slate-600 shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}