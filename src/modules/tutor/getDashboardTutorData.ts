'use server';

import { createClient } from '@/src/lib/supabase/server';

export interface DashboardData {
  tutorInfo: {
    fullName: string;
    initials: string;
    subjects: string;
    experienceYears: number;
    totalLessons: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    verificationStatus: string;
    completionPercentage: number;
    hasExperiences: boolean;
    hasEducations: boolean;
    hasCertificates: boolean;
  };
  upcomingBookings: Array<{
    id: string;
    studentName: string;
    subject: string;
    scheduleText: string;
  }>;
  pendingRequests: Array<{
    id: string;
    studentName: string;
    avatarText: string;
    subject: string;
    scheduleText: string;
    createdAt: string;
  }>;
  stats: {
    totalRevenue: number;
    totalLessons: number;
    pendingCount: number;
    completedCount: number;
    subjectStats: Array<{
      subject: string;
      count: number;
      percent: number;
    }>;
  };
  latestReview?: {
    studentName: string;
    rating: number;
    createdAt: string;
    comment: string;
  };
}

export async function getDashboardTutorData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    // 1. LẤY THÔNG TIN GIA SƯ TỪ BẢNG tutor_profiles
    const { data: profile } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const hourlyRate = profile?.hourly_rate || 150000;

    let hasCertificates = false;
    if (profile?.certificate_data) {
      if (Array.isArray(profile.certificate_data)) {
        hasCertificates = profile.certificate_data.length > 0;
      } else if (typeof profile.certificate_data === 'string') {
        hasCertificates = profile.certificate_data.trim().length > 0;
      } else if (typeof profile.certificate_data === 'object') {
        hasCertificates = Object.keys(profile.certificate_data).length > 0;
      }
    }

    const hasExperiences = Boolean(profile?.experience_years && profile.experience_years > 0);
    const hasEducations = Boolean(profile?.bio || profile?.subjects?.length > 0);

    const { data: completedLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('tutor_id', user.id)
      .eq('status', 'Completed');

    const completedLessonsCount = completedLessons?.length || 0;
    const totalRevenue = completedLessonsCount * hourlyRate;

    const { data: requests } = await supabase
      .from('booking_requests')
      .select('*, student:profiles!student_id(full_name, avatar_url)')
      .eq('tutor_id', user.id);

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

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, student:profiles!student_id(full_name)')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

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

    return {
      success: true,
      data: {
        tutorInfo: {
          fullName: profile?.full_name || 'Gia sư',
          initials: (profile?.full_name || 'GS').slice(0, 2).toUpperCase(),
          subjects: profile?.subjects?.join(', ') || 'Chưa cập nhật',
          experienceYears: profile?.experience_years || 0,
          totalLessons: completedLessonsCount,
          rating: profile?.rating || 5.0,
          reviewCount: profile?.review_count || (reviewsData?.length || 0),
          isVerified: profile?.is_verified || false,
          verificationStatus: profile?.is_verified ? 'Đã xác minh' : 'Chờ duyệt',
          completionPercentage: profile?.completion_percentage || 85,
          hasExperiences,
          hasEducations,
          hasCertificates,
        },
        upcomingBookings: acceptedList.map((item) => ({
          id: item.id,
          studentName: item.student?.full_name || 'Học viên',
          subject: item.subject,
          scheduleText: item.schedule_slot_id || 'Thỏa thuận',
        })),
        pendingRequests: pendingList.map((item) => ({
          id: item.id,
          studentName: item.student?.full_name || 'Học viên ẩn danh',
          avatarText: (item.student?.full_name || 'HV').slice(0, 2).toUpperCase(),
          subject: item.subject,
          scheduleText: item.schedule_slot_id || 'Thỏa thuận',
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