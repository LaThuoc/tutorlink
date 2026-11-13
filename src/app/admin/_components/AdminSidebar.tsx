'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Award, Users, ExternalLink , LogOut, MessageSquare
} from 'lucide-react';
import { logout } from '@/src/modules/auth/actions/auth';
export function AdminSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const isActive = (path: string) => pathname === path;
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 hidden md:flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-3.5 block mb-2">
            Quản lý chung
          </span>
          <Link
            href="/admin"
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive('/admin')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <LayoutDashboard className="size-5 text-blue-600 shrink-0" />
            Tổng quan
          </Link>
          <Link
            href="/admin/certificates"
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive('/admin/certificates')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Award className="size-5 text-amber-500 shrink-0" />
            Duyệt chứng chỉ
          </Link>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-3.5 block mb-2">
            Người dùng & Lớp học
          </span>
          <Link
            href="/admin/tutors"
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive('/admin/tutors')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <ShieldCheck className="size-5 text-indigo-600 shrink-0" />
            Danh sách Gia sư
          </Link>
          <Link
            href="/admin/students"
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive('/admin/students')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Users className="size-5text-emerald-600 shrink-0" />
            Danh sách Học viên
          </Link>
          <Link
              href="/admin/contacts"
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive('/admin/contacts')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <MessageSquare className="size-5 text-sky-600 shrink-0" />
              <span>Hộp thư liên hệ</span>
          </Link>
          <div className="pt-3 mt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <LogOut className="size-5 text-rose-600 shrink-0" />
              <span>{isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
         
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-1.5">
        <Link
          href="/tutors"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
        >
          <span>Xem trang public</span>
          <ExternalLink className="size-4 text-slate-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}