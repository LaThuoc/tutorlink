import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, LayoutDashboard, Award, Users, BookOpen, ExternalLink 
} from 'lucide-react';

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 hidden md:flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3">
            Quản lý chung
          </span>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <LayoutDashboard className="size-4 text-blue-600" />
            Tổng quan
          </Link>
          <Link
            href="/admin/certificates"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Award className="size-4 text-amber-500" />
            Duyệt chứng chỉ
          </Link>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3">
            Người dùng & Lớp học
          </span>
          <Link
            href="/admin/tutors"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <ShieldCheck className="size-4 text-indigo-600" />
            Danh sách Gia sư
          </Link>
          <Link
            href="/admin/students"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Users className="size-4 text-emerald-600" />
            Danh sách Học viên
          </Link>
          <Link
            href="/admin/requests"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <BookOpen className="size-4 text-rose-500" />
            Yêu cầu kết nối
          </Link>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/tutors"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
        >
          <span>Xem trang public</span>
          <ExternalLink className="size-3.5 text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}