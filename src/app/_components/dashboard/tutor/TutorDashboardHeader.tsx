'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Bell, ChevronDown } from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function TutorDashboardHeader() {
  const supabase = createClient();
  const [userName, setUserName] = useState<string>('Gia sư');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getTutorProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        const name = profile?.full_name || user.user_metadata?.full_name || user.email || 'Gia sư';
        setUserName(name);
        setAvatarUrl(profile?.avatar_url || null);
      }
    }
    getTutorProfile();
  }, [supabase]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-6">
      
      {/* 1. LOGO & TAGLINE */}
      <div className="flex items-center gap-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <GraduationCap className="size-8 text-blue-600" aria-hidden="true" />
          <span className="tracking-tight font-extrabold text-blue-600">GiaSuHub</span>
        </Link>
        <span className="hidden text-xs font-semibold text-slate-400 lg:inline-block border-l border-slate-200 pl-6 py-0.5">
          Kết nối tri thức - Kiến tạo tương lai
        </span>
      </div>

      {/* 2. KHU VỰC PHẢI (SEARCH, NOTIFICATION, USER PROFILE) */}
      <div className="flex items-center gap-4">
        
        {/* Ô SEARCH BO CONG (PILL SHAPE) */}
        <div className="relative hidden md:flex items-center w-80">
          <Search className="absolute left-4 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh, yêu cầu, ..."
            className="w-full h-10 rounded-full bg-slate-50 border border-slate-100 pl-11 pr-4 text-xs text-slate-600 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-300 transition-all"
          />
        </div>

        {/* NÚT THÔNG BÁO CÓ CHẤM ĐỎ */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative grid size-10 place-items-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500" />
        </button>

        {/* THÔNG TIN USER (AVATAR + TÊN + DROPDOWN) */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="relative size-10 rounded-full overflow-hidden bg-blue-600 border border-slate-200 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="size-full object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center text-white font-bold text-sm">
                {getInitials(userName)}
              </div>
            )}
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {userName}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Gia sư
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}