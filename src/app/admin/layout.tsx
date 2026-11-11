import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import { AdminHeader } from './_components/AdminHeader';
import { AdminSidebar } from './_components/AdminSidebar';
export const metadata = {
  title: 'GiaSuHub – Bảng điều khiển Quản trị',
  description: 'Hệ thống quản lý và kiểm duyệt gia sư GiaSuHub',
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  // Kiểm tra vai trò Admin từ bảng profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard/tutor');
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      {/* 1. HEADER CỐ ĐỊNH TÁCH BIỆT */}
      <AdminHeader 
        fullName={profile?.full_name} 
        avatarUrl={profile?.avatar_url} 
      />

      {/* 2. BODY CHÍNH */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* SIDEBAR CỐ ĐỊNH TÁCH BIỆT */}
        <AdminSidebar />

        {/* NỘI DUNG CUỘN ĐỘC LẬP */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}