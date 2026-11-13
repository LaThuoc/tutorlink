export interface ScheduleLesson {
  id: string;
  time: string;
  subject: string;
  subjectColor: 'blue' | 'purple' | 'emerald';
  studentName: string;
  grade: string;
  status: 'confirmed' | 'pending';
}

export interface LearningRequest {
  id: string;
  studentName: string;
  avatarText: string;
  timeAgo: string;
  gradeSubject: string;
  scheduleText: string;
}

export interface StatProgress {
  subject: string;
  lessonsCount: number;
  percentage: number;
  colorClass: string;
}

export interface ReviewItem {
  id: string;
  studentName: string;
  avatarText: string;
  rating: number;
  date: string;
  comment: string;
}



export interface BookingRequestItem {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  message: string | null;
  contact_phone: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  schedule_slot_id: string | null;
  lesson_date?: string | null; 
  lesson_status?: 'Pending' | 'Completed' | 'Cancelled'; 
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
  student?: {
    full_name: string;
    avatar_url?: string | null;
    phone?: string | null;
  };
}



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