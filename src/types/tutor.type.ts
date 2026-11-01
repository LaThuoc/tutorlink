import { Database } from "@/src/types/databases.types"
import { createClient } from "../lib/supabase/server"
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type TutorProfileRow = Database['public']['Tables']['tutor_profiles']['Row']


export interface ExperienceItem {
  id: string
  period: string,
  role: string,
  company: string,
  description: string
}

export interface EducationItem {
  id: string,
  period: string,
  schoolName: string,
  major: string,
  gpa?: string,
  status: string,
  description: string,
}
export interface CertificateItem{
  id: string,
  title: string,
  detail?: string,
  issuedBy: string,
  issuedYear: string,
  imageUrl: string,
  isVerified: boolean,

}
export type TutorWithProfile = Omit<
  TutorProfileRow, 
  'experiences' | 'educations' | 'certificates_data' | 'schedules_data'
> & {
  experiences?: ExperienceItem[] | null
  educations?: EducationItem[] | null
  certificates_data?: CertificateItem[] | null
  schedules_data?: ScheduleSlot[] | null
  profiles: Pick<ProfileRow, 'full_name' | 'avatar_url' | 'phone' | 'province' | 'district' | 'address' | 'gender' | 'date_of_birth' | 'hometown' > | null
}

export type GetTutorsFilter = {
  subject?: string
  grade?: string
  province?: string
  district?: string
  minRate?: number
  maxRate?: number
  page?: number
  limit?: number
}

export type TutorActionState = {
  success: boolean
  errors?: string
  fieldErrors?: Record<string, string[] | undefined>
}


export interface ScheduleSlot  {
  id: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  isAvailable: boolean
}




//
export const SORTS = {
  rating: "Đánh giá cao nhất",
  price_asc: "Học phí tăng dần",
  price_desc: "Học phí giảm dần",
  experience: "Nhiều kinh nghiệm nhất",
  newest: "Mới nhất",
} as const;

export type SortKey = keyof typeof SORTS;

export type TutorFilters = {
  q?: string;
  subjects?: string[];
  grade?: string;
  online?: "online" | 'offline'
  min?: number;
  max?: number;
  area?: string;
  rating?: number;
  sort?: SortKey;
  page?: number;
};

export type TutorCardData = {
  user_id: string;
  name: string;
  avatar: string | null;
  headline: string | null;
  subjects: string[];
  grades: string[];
  hourly_rate: number;
  address: string | null;
  is_online: boolean;
  experience_years: number;
  rating_avg: number | null;
  rating_count: number;
  school_name?: string | null;
  education?: string | null;
};

export type RawTutorRow = {
  user_id: string;
  headline: string | null;
  subjects: string[] | null;
  grades: string[] | null;
  hourly_rate: number | null;
  address: string | null;
  is_online: boolean | null;
  experience_years: number | null;
  school_name: string | null;
  education: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    district: string | null;
    province: string | null;
    address: string | null;
  } | {
    full_name: string;
    avatar_url: string | null;
    district: string | null;
    province: string | null;
    address: string | null;
  }[] | null;
};