'use client';

import React from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Loader2, GraduationCap, DollarSign, Award, Clock, Eye 
} from 'lucide-react';
import { TutorProfileData } from './TutorDetailModal';

interface TutorCardProps {
  item: TutorProfileData;
  isPending: boolean;
  onReview: (tutorId: string, action: 'Approve' | 'Reject') => void;
  onSelect: (tutor: TutorProfileData) => void;
}

export function TutorCard({ item, isPending, onReview, onSelect }: TutorCardProps) {
  const isApproved = item.verification_status === 'Approved' || item.status === 'approved';
  const isRejected = item.verification_status === 'Rejected' || item.status === 'rejected';

  const getInitials = (name?: string) => {
    if (!name) return 'GS';
    const words = name.trim().split(' ');
    return words.length === 1 
      ? words[0].slice(0, 2).toUpperCase() 
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-6">
      {/* THÔNG TIN CHÍNH */}
      <div className="flex items-start gap-4 min-w-[280px] flex-1">
        {item.profiles?.avatar_url ? (
          <img 
            src={item.profiles.avatar_url} 
            alt="" 
            className="size-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0" 
          />
        ) : (
          <div className="size-14 rounded-2xl bg-indigo-600 text-white font-bold grid place-items-center text-base shrink-0 shadow-xs">
            {getInitials(item.profiles?.full_name)}
          </div>
        )}

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              {item.profiles?.full_name || 'Gia sư chưa đặt tên'}
            </h3>

            {isApproved && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-600" /> Đã duyệt
              </span>
            )}
            {isRejected && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] font-bold flex items-center gap-1">
                <XCircle className="size-3 text-rose-600" /> Bị từ chối
              </span>
            )}
            {!isApproved && !isRejected && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-bold flex items-center gap-1">
                <Clock className="size-3 text-amber-600" /> Chờ duyệt
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <GraduationCap className="size-3.5 text-indigo-500" />
              {item.school_name || 'Chưa cập nhật trường'} {item.education ? `(${item.education})` : ''}
            </span>
            {item.experience_years !== undefined && item.experience_years > 0 && (
              <span className="flex items-center gap-1">
                <Award className="size-3.5 text-amber-500" />
                {item.experience_years} năm kinh nghiệm
              </span>
            )}
            {item.hourly_rate ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <DollarSign className="size-3.5" />
                {Number(item.hourly_rate).toLocaleString('vi-VN')} đ/giờ
              </span>
            ) : null}
          </div>

          {item.subjects && item.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.subjects.map((sub, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Eye className="size-4 text-slate-500" /> Chi tiết
        </button>

        {!isApproved ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onReview(item.user_id, 'Reject')}
              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <XCircle className="size-4" /> Từ chối
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onReview(item.user_id, 'Approve')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Duyệt
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onReview(item.user_id, 'Reject')}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer transition-colors"
          >
            Hủy duyệt
          </button>
        )}
      </div>
    </div>
  );
}