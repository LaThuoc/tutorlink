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
          role: 'student' | 'tutor' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'student' | 'tutor' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'student' | 'tutor' | 'admin'
          created_at?: string
        }
      }
      tutor_profiles: {
        Row: {
          user_id: string
          bio: string | null
          subjects: string[] | null
          hourly_rate: number | null
          education: string | null
          certificates: string[] | null
          is_verified: boolean
        }
        Insert: {
          user_id: string
          bio?: string | null
          subjects?: string[] | null
          hourly_rate?: number | null
          education?: string | null
          certificates?: string[] | null
          is_verified?: boolean
        }
        Update: {
          user_id?: string
          bio?: string | null
          subjects?: string[] | null
          hourly_rate?: number | null
          education?: string | null
          certificates?: string[] | null
          is_verified?: boolean
        }
      }
    }
  }
}