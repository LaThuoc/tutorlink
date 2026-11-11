'use client';

import React from 'react';
import { 
  X, User, Mail, Phone, MapPin, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';

export interface StudentProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  province?: string;
  district?: string;
  date_of_birth?: string;
  gender?: string;
  status?: 'active' | 'blocked' | 'pending';
  created_at: string;
}

interface StudentDetailModalProps {
  student: StudentProfileData | null;
  onClose: () => void;
  onToggleBlockStatus: (studentId: string, currentStatus?: string) => void;
  isPending: boolean;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const capitalizeFirst = (str?: string) => {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export function StudentDetailModal({ 
  student, 
  onClose, 
  onToggleBlockStatus, 
  isPending 
}: StudentDetailModalProps) {
  if (!student) return null;

  const isBlocked = student.status === 'blocked';

  const getInitials = (name?: string) => {
    if (!name) return 'HV';
    const words = name.trim().split(' ');
    return words.length === 1 
      ? words[0].slice(0, 2).toUpperCase() 
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-slate-100">
        
        <div className="p-6 bg-blue-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt="" className="size-16 rounded-2xl object-cover ring-2 ring-white/30 shrink-0" />
            ) : (
              <div className="size-16 rounded-2xl bg-white text-blue-600 font-extrabold grid place-items-center text-xl shadow-sm shrink-0 tracking-wider">
                {getInitials(student.full_name)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-white">{capitalizeFirst(student.full_name) || 'Học viên'}</h2>
                {isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-100 border border-rose-400/30 text-[11px] font-bold flex items-center gap-1">
                    <ShieldAlert className="size-3.5 text-rose-300" /> Đã bị khóa
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-300" /> Tài khoản hoạt động
                  </span>
                )}
              </div>
              
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-blue-200" /> {student.email}</span>
                {student.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-blue-200" /> {student.phone}</span>}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="size-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 text-slate-800 text-xs bg-white">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <User className="size-4 text-slate-600" /> Thông tin hồ sơ Học viên / Phụ huynh
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Mail className="size-3" /> Email
              </span>
              <p className="font-bold text-slate-900 text-xs truncate">{student.email}</p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Phone className="size-3" /> Số điện thoại
              </span>
              <p className="font-bold text-slate-900 text-xs truncate">{student.phone || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ngày sinh</span>
              <p className="font-bold text-slate-900 text-xs truncate">{formatDate(student.date_of_birth)}</p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Giới tính</span>
              <p className="font-bold text-slate-900 text-xs truncate">{capitalizeFirst(student.gender) || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="size-3" /> Khu vực / Tỉnh thành
              </span>
              <p className="font-bold text-slate-900 text-xs truncate">
                {capitalizeFirst(student.district ? `${student.district}, ${student.province}` : student.province) || 'Chưa cập nhật'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="size-3" /> Ngày tham gia
              </span>
              <p className="font-bold text-slate-900 text-xs truncate">{formatDate(student.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end shrink-0 gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onToggleBlockStatus(student.user_id, student.status)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isBlocked 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isBlocked ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />}
            {isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
          </button>
          
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}