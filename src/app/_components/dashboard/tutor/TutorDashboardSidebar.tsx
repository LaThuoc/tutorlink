'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserCheck, 
  Calendar, 
  BookOpen,
  FileText, 
  MessageSquare, 
  Wallet, 
  Star, 
  Settings, 
  LogOut,
  Headphones 
} from 'lucide-react';
import { logout } from '@/src/modules/auth/actions/auth';

const baseLink = 'flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors';
const activeLink = 'bg-blue-50 text-blue-600 font-bold';
const idleLink = 'text-slate-600 hover:bg-slate-50 hover:text-blue-600';

export default function TutorDashboardSidebar() {
  const pathname = usePathname();
  const linkCls = (href: string) => `${baseLink} ${pathname === href ? activeLink : idleLink}`;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-64px)] bg-white border-r border-slate-100 p-4 gap-2 shrink-0">
      
      {/* 1. TỔNG QUAN */}
      <Link href="/dashboard/tutor" className={linkCls('/dashboard/tutor')}>
        <span className="flex items-center gap-3">
          <LayoutDashboard className="size-5" />
          <span>Tổng quan</span>
        </span>
      </Link>

      {/* 2. HỒ SƠ GIA SƯ */}
      <Link href="/dashboard/profiletutor" className={linkCls('/dashboard/profiletutor')}>
        <span className="flex items-center gap-3">
          <UserCheck className="size-5 text-slate-500" />
          <span>Hồ sơ gia sư</span>
        </span>
      </Link>

      {/* 3. LỊCH DẠY */}
      <Link href="/dashboard/schedule" className={linkCls('/dashboard/schedule')}>
        <span className="flex items-center gap-3">
          <Calendar className="size-5 text-slate-500" />
          <span>Lịch dạy</span>
        </span>
      </Link>
      <Link href="/dashboard/lesson" className={linkCls('/dashboard/lesson')}>
        <span className="flex items-center gap-3">
          <BookOpen className="size-5" />
          <span>Buổi học</span>
        </span>
      </Link>

      {/* 4. YÊU CẦU HỌC */}
      <Link href="/dashboard/requests" className={linkCls('/dashboard/requests')}>
        <span className="flex items-center gap-3">
          <FileText className="size-5 text-slate-500" />
          <span>Yêu cầu học</span>
        </span>
      </Link>

      

      {/* 6. DOANH THU */}
      <Link href="/dashboard/revenue" className={linkCls('/dashboard/revenue')}>
        <span className="flex items-center gap-3">
          <Wallet className="size-5 text-slate-500" />
          <span>Doanh thu</span>
        </span>
      </Link>

      {/* 7. ĐÁNH GIÁ */}
      <Link href="/dashboard/reviews" className={linkCls('/dashboard/reviews')}>
        <span className="flex items-center gap-3">
          <Star className="size-5 text-slate-500" />
          <span>Đánh giá</span>
        </span>
      </Link>
      {/* <Link href="/dashboard/reviews" className={linkCls('/dashboard/reviews')}>
        <span className="flex items-center gap-3">
          <Star className="size-5" />
          <span>Đánh giá</span>
        </span>
      </Link> */}

      {/* 8. CÀI ĐẶT */}
      <Link href="/dashboard/settings" className={linkCls('/dashboard/settings')}>
        <span className="flex items-center gap-3">
          <Settings className="size-5 text-slate-500" />
          <span>Cài đặt</span>
        </span>
      </Link>

      {/* 9. NÚT ĐĂNG XUẤT */}
      <form action={logout} className="w-full">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors cursor-pointer"
        >
          <LogOut className="size-5 text-rose-500" />
          <span>Đăng xuất</span>
        </button>
      </form>

      {/* KHU VỰC HỖ TRỢ */}
      <div className="mt-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/70 text-sm text-slate-500 space-y-2">
        <b className="text-slate-800 font-bold block text-sm">Cần hỗ trợ?</b>
        <p className="text-xs text-slate-500 leading-relaxed">
          Đội ngũ GiaSuHub luôn sẵn sàng hỗ trợ bạn!
        </p>
        <button 
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer"
        >
          <Headphones className="size-4" />
          <span>Liên hệ ngay</span>
        </button>
      </div>

    </aside>
  );
}