import { createClient } from "@/src/lib/supabase/server";
import { GetTutorsFilter, TutorWithProfile } from "../auth/types/tutor.type";

export async function getVerifiedTutor(filters: GetTutorsFilter = {}){
    const supabase = await createClient()


    const {subject, province, district, minRate, maxRate, page = 1, limit = 9} = filters

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('tutor_profiles')
        .select(
            `user_id,
            bio,
            quote,
            education,
            school_name,
            subjects,
            hourly_rate,
            teaching_areas,
            teaching_modes,
            achievements,
            skills,
            total_lessons_taught,
            certificates_data,
            experiences,
            educations
            schedules,
            is_verified,
            profiles:user_id!inner (
                full_name,
                avatar_url,
                phone,
                province,
                district,
                address,
            )
            `,
            {count: 'exact'}

        )
        .eq('is_verified', true)
    
    if (subject) query = query.contains('subjects', [subject])
    if (district) query = query.contains('teaching_areas', [district])
    if (province) query = query.eq('profiles.province', province)

    if (minRate !== undefined) {
        query = query.gte('hourly_rate', minRate)
    }
    if (maxRate !== undefined) {
        query = query.lte('hourly_rate', maxRate)
    }
     
    query = query.range(from, to)
    const {data, count, error} = await query
    if(error){
        console.error('Lỗi lấy danh sách gia sư', error.message)
        return {tutors: [], total: 0}
    }
    const tutors = (data || []) as unknown as TutorWithProfile[]
    return {tutors, total: count || 0}
}

export async function getTutorDetail(tutorId: string){
    const supabase = await createClient()

    const {data: tutor, error: tutorError} = await supabase
        .from('tutor_profiles')
        .select(
            `user_id,
            bio,
            quote,
            education,
            school_name,          
            subjects,
            hourly_rate,          
            subject_details,     
            teaching_areas,
            teaching_modes,      
            achievements,
            skills,
            total_lessons_taught,
            certificates_data,
            experiences,
            educations,
            schedules,
            is_verified,
            verification_status,
            rejection_reason,
            profiles:user_id ( 
                full_name,
                avatar_url,
                phone,
                province,
                district,
                address
            )
        `)
        .eq('user_id', tutorId)
        .single()
        if(tutorError || !tutor) return null

        const {data: reviews} = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                student:student_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('tutor_id', tutorId)
            .order('created_at', {ascending: false})

        const totalReviews = reviews?.length || 0
        const avgRating = totalReviews > 0 
                ? Number((reviews!.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1))
                : 0
        return {
            tutor: tutor as unknown as TutorWithProfile,
            reviews: reviews || [],
            stats: {
                totalReviews,
                avgRating,
            }
        }
}