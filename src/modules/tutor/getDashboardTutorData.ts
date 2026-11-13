'use server';

import { createClient } from '@/src/lib/supabase/server';
import { DashboardData } from '@/src/types/tutorDashboard';

const VN_DAY_NAMES: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

function formatScheduleForDashboard(rawSlotId: string | null | undefined): string {
  if (!rawSlotId) return 'Thỏa thuận';

  return rawSlotId
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.includes('|')) {
        const [datePart, timePart] = item.split('|').map((p) => p.trim());
        const d = new Date(`${datePart}T00:00:00Z`);
        if (!isNaN(d.getTime())) {
          const dayName = VN_DAY_NAMES[d.getUTCDay()] || '';
          return timePart ? `${dayName} (${timePart})` : dayName;
        }
        return timePart || item;
      }
      return item;
    })
    .join(', ');
}


export async function getDashboardTutorData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    const [
      { data: profile },
      { data: completedLessons },
      { data: requests },
      { data: reviewsData },
    ] = await Promise.all([
      supabase
        .from('tutor_profiles')
        .select(`
          *,
          user:profiles!tutor_profiles_user_id_fkey (full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .maybeSingle(),

      supabase
        .from('lessons')
        .select('id, is_paid')
        .eq('tutor_id', user.id)
        .eq('status', 'Completed'),

      supabase
        .from('booking_requests')
        .select('*, student:profiles!student_id(full_name, avatar_url)')
        .eq('tutor_id', user.id),

      supabase
        .from('reviews')
        .select('*, student:profiles!student_id(full_name)')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false }),
    ]);
    
    const tutorUserObj = Array.isArray(profile?.user) ? profile.user[0] : profile?.user;
    const fullName = tutorUserObj?.full_name || 'Gia sư';
    const nameParts = fullName.trim().split(/\s+/);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

    const hourlyRate = profile?.hourly_rate || 150000;

    const hasCertificates = Boolean(
      (Array.isArray(profile?.certificates_data) && profile.certificates_data.length > 0) ||
        (Array.isArray(profile?.certificates) && profile.certificates.length > 0)
    );
    const hasExperiences = Boolean(Array.isArray(profile?.experience_years && profile.experience_years > 0) ||
      (Array.isArray(profile?.experiences) && profile.experiences.length > 0)
    );
    const hasEducations = Boolean((Array.isArray(profile?.educations) && profile.educations.length > 0) ||
        profile?.education ||
        profile?.school_name ||
        profile?.bio
    );

    let completionPercentage = 25;
    if (profile?.subjects && profile.subjects.length > 0) completionPercentage += 20;
    if (hasExperiences) completionPercentage += 20;
    if (hasEducations) completionPercentage += 20;
    if (hasCertificates) completionPercentage += 15;

    const allCompleted = completedLessons || [];
    const completedLessonsCount = allCompleted.length;
    const paidLessonsCount = allCompleted.filter((l) => Boolean(l.is_paid)).length;
    const totalRevenue = paidLessonsCount * hourlyRate;


    const allRequests = requests || [];
    const pendingList = allRequests.filter((r) => r.status === 'Pending');
    const acceptedList = allRequests.filter((r) => r.status === 'Accepted');

    const subjectCountMap: Record<string, number> = {};
    allRequests.forEach((req) => {
      if (req.subject) {
        subjectCountMap[req.subject] = (subjectCountMap[req.subject] || 0) + 1;
      }
    });

    const totalRequestsCount = allRequests.length;
    const subjectStats = Object.keys(subjectCountMap).map((sub) => {
      const count = subjectCountMap[sub];
      const percent = totalRequestsCount > 0 ? Math.round((count / totalRequestsCount) * 100) : 0;
      return { subject: sub, count, percent };
    });

    const allReviews = reviewsData || [];
    const reviewCount = allReviews.length;
    const avgRating =
      reviewCount > 0
        ? Number(
            (allReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviewCount).toFixed(1)
          )
        : 5.0;

    let latestReview = undefined;
    if (reviewsData && reviewsData.length > 0) {
      const rev = reviewsData[0];
      latestReview = {
        studentName: rev.student?.full_name || 'Học viên ẩn danh',
        rating: rev.rating || 5,
        createdAt: new Date(rev.created_at).toLocaleDateString('vi-VN'),
        comment: rev.comment || rev.content || 'Đánh giá tốt!',
      };
    }

    const isVerified = Boolean(profile?.is_verified || profile?.verification_status === 'Approved');

    return {
      success: true,
      data: {
        tutorInfo: {
          fullName,
          initials,
          subjects: profile?.subjects?.length > 0 ? profile?.subjects?.join(', ') : 'Chưa cập nhật',
          experienceYears: profile?.experience_years || 2,
          totalLessons: completedLessonsCount,
          rating: avgRating,
          reviewCount,
          isVerified,
          verificationStatus: isVerified ? 'Đã xác minh' : 'Chờ duyệt',
          completionPercentage,
          hasEducations,
          hasCertificates,
          hasExperiences,
          
        },
        upcomingBookings: acceptedList.map((item) => ({
          id: item.id,
          studentName: item.student?.full_name || 'Học viên',
          subject: item.subject,
          scheduleText: formatScheduleForDashboard(item.schedule_slot_id),
        })),
        pendingRequests: pendingList.map((item) => ({
          id: item.id,
          studentName: item.student?.full_name || 'Học viên ẩn danh',
          avatarText: (item.student?.full_name || 'HV').slice(0, 2).toUpperCase(),
          subject: item.subject,
          scheduleText: formatScheduleForDashboard(item.schedule_slot_id),
          createdAt: new Date(item.created_at).toLocaleDateString('vi-VN'),
        })),
        stats: {
          totalRevenue,
          totalLessons: acceptedList.length,
          pendingCount: pendingList.length,
          completedCount: completedLessonsCount,
          subjectStats,
        },
        latestReview,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}





