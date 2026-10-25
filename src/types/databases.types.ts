import { ZodNullDef } from "zod/v3"

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
          gender: string | null
          date_of_birth: string | null
          phone: string | null
          province: string | null
          district: string | null
          address: string | null
          hometown: string | null
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
          gender?: string | null
          date_of_birth?: string | null
          hometown?: string | null
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
          gender?: string| null
          date_of_birth?: string | null
          hometown?: string | null
        }
      }
      tutor_profiles: {
        Row: {
          user_id: string
          bio: string | null
          quote: string | null
          education: string | null
          subjects: string[] | null
          hourly_rate: number | null
          subject_details: Json | null
          teaching_areas: string[] | null
          achievements: string[] | null
          skills: string[] | null
          total_lessons_taught: number
          certificates: string[] | null
          experiences: Json | null
          educations: Json | null
          certificates_data: Json | null 
          schedules_data: Json | null
          schedules: string[] | null
          is_verified: boolean
          verification_status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason: string | null
          school_name: string | null
          teaching_modes: string[] | null
        }
        Insert: {
          user_id: string
          bio?: string | null
          quote?: string | null
          education?: string | null
          subjects?: string[] | null
          hourly_rate?: number | null,
          subject_details?: Json | null
          teaching_areas?: string[] | null
          achievements?: string[] | null
          skills?: string[] | null
          experiences?: Json | null
          educations? : Json | null
          certificates_data?: Json | null
          schedules_data?: Json | null
          total_lessons_taught?: number
          certificates?: string[] | null
          schedules?: string[] | null
          is_verified?: boolean
          verification_status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
          school_name?: string | null
          teaching_modes?: string[] | null
        }
        Update: {
          user_id?: string
          bio?: string | null
          quote?: string | null
          education?: string | null
          subjects?: string[] | null
          hourly_rate?: number | null
          subject_details?: Json | null
          teaching_areas?: string[] | null
          achievements?: string[] | null
          skills?: string[] | null
          experiences?: Json | null
          educations?: Json | null
          certificates_data?: Json | null
          schedules_data?: Json | null
          total_lessons_taught?: number
          certificates?: string[] | null
          schedules?: string[] | null
          is_verified?: boolean
          verification_status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
          school_name?: string | null
          teaching_modes?: string[] | null
        }
      }
      certificate_requests: {
        Row: {
          id: string
          tutor_id: string
          certificate_url: string
          title: string | null
          issued_by: string | null
          issue_year: string | null
          detail: string | null
          status: 'Pending' | 'Approved' | 'Rejected'
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          certificate_url: string
          title?: string | null
          issued_by?: string | null
          issue_year?: string | null
          detail?: string | null
          status?: 'Pending' | 'Approved' | 'Rejected'
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          certificate_url?: string
          title?: string | null
          issued_by?: string | null
          issue_year?: string | null
          detail?: string | null
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
      booking_requests: {
        Row: {
          id: string,
          student_id: string
          tutor_id: string
          schedule_slot_id: string | null
          subject: string 
          message: string | null
          contact_phone: string
          status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string,
          student_id: string
          tutor_id: string
          schedule_slot_id?: string | null
          subject: string 
          message?: string | null
          contact_phone: string
          status?: 'Pending' | 'Accepted' | 'Rejected' | 'Completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string,
          student_id?: string
          tutor_id?: string
          schedule_slot_id?: string | null
          subject?: string 
          message?: string | null
          contact_phone?: string
          status?: 'Pending' | 'Accepted' | 'Rejected' | 'Completed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}