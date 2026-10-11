import { Database } from "@/src/types/databases.types"
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type TutorProfileRow = Database['public']['Tables']['tutor_profiles']['Row']

export type SubjectDetail = {
  subject: string
  gradeRange?: string 
  tag?: string      
  hourlyRate: number
}

export type TutorWithProfile = TutorProfileRow & {
  subject_details: SubjectDetail[]
  profiles: Pick<ProfileRow, 'full_name' | 'avatar_url' | 'phone' | 'province' | 'district' | 'address'> | null
}

export type GetTutorsFilter = {
  subject?: string
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