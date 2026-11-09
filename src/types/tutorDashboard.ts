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