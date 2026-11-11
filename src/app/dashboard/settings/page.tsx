import { redirect } from 'next/navigation';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import ChangePasswordManager from './_components/ChangePasswordTutor';
import { createClient } from '@/src/lib/supabase/server';

export const metadata = {
  title: 'GiaSuHub – Cài đặt bảo mật & Đổi mật khẩu',
  description: 'Quản lý bảo mật tài khoản và đổi mật khẩu gia sư.',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/dashboard/settings');

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl">
          <ChangePasswordManager />
        </main>
      </div>
    </div>
  );
}