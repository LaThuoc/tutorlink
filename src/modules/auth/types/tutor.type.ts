import { Database } from "@/src/types/databases.types"
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