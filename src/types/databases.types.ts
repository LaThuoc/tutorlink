export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          province: string | null
          district: string | null
          address: string | null
          role: 'student' | 'tutor' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          province?: string | null
          district?: string | null
          address?: string | null
          role?: 'student' | 'tutor' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          province?: string | null
          district?: string | null
          address?: string | null
          role?: 'student' | 'tutor' | 'admin'
          created_at?: string
        }
      }
      tutor_profiles: {
        Row: {
          user_id: string
          bio: string | null
          quote: string | null
          education: string | null
          subjects: string[] | null
          subject_details: Json | null
          teaching_areas: string[] | null
          achievements: string[] | null
          skills: string[] | null
          total_lessons_taught: number
          certificates: string[] | null
          schedules: string[] | null
          is_verified: boolean
          verification_status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason: string | null
        }
        Insert: {
          user_id: string
          bio?: string | null
          quote?: string | null
          education?: string | null
          subjects?: string[] | null
          subject_details?: Json | null
          teaching_areas?: string[] | null
          achievements?: string[] | null
          skills?: string[] | null
          total_lessons_taught?: number
          certificates?: string[] | null
          schedules?: string[] | null
          is_verified?: boolean
          verification_status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
        }
        Update: {
          user_id?: string
          bio?: string | null
          quote?: string | null
          education?: string | null
          subjects?: string[] | null
          subject_details?: Json | null
          teaching_areas?: string[] | null
          achievements?: string[] | null
          skills?: string[] | null
          total_lessons_taught?: number
          certificates?: string[] | null
          schedules?: string[] | null
          is_verified?: boolean
          verification_status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
        }
      }
      certificate_requests: {
        Row: {
          id: string
          tutor_id: string
          certificate_url: string
          status: 'Pending' | 'Approved' | 'Rejected'
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          certificate_url: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          certificate_url?: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          tutor_id: string
          student_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          student_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          student_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}