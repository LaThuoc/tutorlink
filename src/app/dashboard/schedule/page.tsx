// ===== FILE MỚI: src/app/dashboard/schedule/page.tsx  (đường dẫn: /dashboard/schedule) =====
import { redirect } from 'next/navigation';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import TutorScheduleManager from './_components/TutorScheduleManager';
import { createClient } from '@/src/lib/supabase/server';
import { ScheduleSlot } from '@/src/types/tutor.type';

export const metadata = {
  title: 'GiaSuHub – Lịch dạy của tôi',
  description: 'Tạo và quản lý các khung giờ dạy để học viên đăng ký học.',
};

export const dynamic = 'force-dynamic';

function parseSlots(raw: unknown): ScheduleSlot[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? (value as ScheduleSlot[]) : [];
}

export default async function TutorSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/dashboard/schedule');

  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('schedules_data, is_completed')
    .eq('user_id', user.id)
    .maybeSingle();

  const initialSlots = parseSlots(tutor?.schedules_data);
  const profileCompleted = Boolean((tutor as { is_completed?: boolean } | null)?.is_completed);

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
          <TutorScheduleManager
            userId={user.id}
            initialSlots={initialSlots}
            profileCompleted={profileCompleted}
          />
        </main>
      </div>
    </div>
  );
}
