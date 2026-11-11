import React from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Bell } from 'lucide-react';

interface AdminHeaderProps {
  fullName?: string;
  avatarUrl?: string | null;
}

export function AdminHeader({ fullName, avatarUrl }: AdminHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-40 shadow-xs">
      {/* LOGO & SLOGAN */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 group">
          <GraduationCap className="size-8 text-blue-600 transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-xl tracking-tight text-blue-600">
            GiaSuHub
          </span>
        </Link>
        
        <span className="h-4 w-px bg-slate-300 hidden sm:block" />
        
        <span className="text-xs font-medium text-slate-400 hidden sm:block">
          Kết nối tri thức - Kiến tạo tương lai
        </span>
      </div>

      {/* SEARCH & USER INFO */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-72">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm học sinh, yêu cầu, ..." 
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-blue-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <button className="relative size-9 rounded-full bg-slate-100 hover:bg-slate-200/80 grid place-items-center text-slate-600 transition-colors cursor-pointer">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="size-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="size-9 rounded-full bg-blue-600 font-bold text-white text-xs grid place-items-center tracking-wider shadow-sm">
              {getInitials(fullName)}
            </div>
          )}
          
          <div className="text-left hidden lg:block leading-tight">
            <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
              {fullName || 'Quản trị viên'}
            </span>
            <span className="text-[11px] text-slate-400 block font-medium">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}