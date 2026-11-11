'use server';

import { createClient } from '@/src/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { RevenueDashboardData, StudentRevenueSummary } from '@/src/types/revenue.type';

export async function getTutorRevenueData(): Promise<{
  success: boolean;
  data?: RevenueDashboardData;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('hourly_rate')
      .eq('user_id', user.id)
      .maybeSingle();

    const hourlyRate = Number(tutorProfile?.hourly_rate || 150000);

    const { data: completedLessons, error } = await supabase
      .from('lessons')
      .select(`
        id,
        booking_id,
        student_id,
        subject,
        lesson_date,
        status,
        is_paid,
        created_at,
        student:profiles!lessons_student_id_fkey(full_name, avatar_url, phone)
      `)
      .eq('tutor_id', user.id)
      .eq('status', 'Completed')
      .order('lesson_date', { ascending: false });

    if (error) {
      console.error('[getTutorRevenueData] Error:', error);
      return { success: false, error: error.message };
    }

    const items = completedLessons || [];

    const studentMap: Record<string, StudentRevenueSummary> = {};
    let totalPaidRevenue = 0;
    let totalUnpaidRevenue = 0;
    const monthlyMap: Record<string, { totalAmount: number; completedLessonsCount: number }> = {};

    items.forEach((item) => {
      const stId = item.student_id;
      const stName = (item.student as unknown as { full_name: string })?.full_name || 'Học viên';
      const avatarUrl = (item.student as unknown as { avatar_url: string })?.avatar_url;
      const phone = (item.student as unknown as { phone: string })?.phone;
      
      const lessonFee = hourlyRate;

      if (!studentMap[stId]) {
        studentMap[stId] = {
          studentId: stId,
          studentName: stName,
          avatarUrl,
          phone,
          subject: item.subject,
          unpaidLessonsCount: 0,
          unpaidAmount: 0,
          paidAmount: 0,
        };
      }

      if (item.is_paid) {
        studentMap[stId].paidAmount += lessonFee;
        totalPaidRevenue += lessonFee;
      } else {
        studentMap[stId].unpaidLessonsCount += 1;
        studentMap[stId].unpaidAmount += lessonFee;
        totalUnpaidRevenue += lessonFee;
      }

      const dateObj = item.lesson_date ? new Date(item.lesson_date) : new Date(item.created_at || Date.now());
      const monthYear = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { totalAmount: 0, completedLessonsCount: 0 };
      }
      monthlyMap[monthYear].totalAmount += lessonFee;
      monthlyMap[monthYear].completedLessonsCount += 1;
    });

    const studentSummaries = Object.values(studentMap);
    const monthlyStats = Object.entries(monthlyMap).map(([monthYear, val]) => ({
      monthYear,
      totalAmount: val.totalAmount,
      completedLessonsCount: val.completedLessonsCount,
    }));

    return {
      success: true,
      data: {
        totalPaidRevenue,
        totalUnpaidRevenue,
        studentSummaries,
        monthlyStats,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}

export async function resetStudentBalance(studentId: string) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    const { error } = await supabase
      .from('lessons')
      .update({ is_paid: true })
      .eq('tutor_id', user.id)
      .eq('student_id', studentId)
      .eq('status', 'Completed')
      .eq('is_paid', false);

    if (error) {
      console.error('[resetStudentBalance] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/revenue');
    revalidatePath('/dashboard/lesson');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}