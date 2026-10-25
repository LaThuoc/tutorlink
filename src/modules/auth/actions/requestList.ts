import { createClient } from "@/src/lib/supabase/server";
import { hasNullItemLabel } from "@base-ui/react/internals/resolveValueLabel";

export async function getTutorBookingRequest(){
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
    if(!user) return {data: null, error: 'Bạn cần đăng nhập để xem danh sách này.'}

    const {data, error} = await supabase.from('booking_requests')
        .select(
            `
            id,
            student_id,
            tutor_id,
            subject,
            schedule_slot_id,
            contact_phone,
            message,
            status,
            created_at,
            updated_at,
            student:profiles!booking_requests_student_id_fkey (
                id,
                full_name,
                avatar_url,
                phone,
                province,
                district,
                address
            )
            `)
        .eq('tutor_id', user.id)
        .order('created_at', {ascending: false})

    if(error){
        console.error('Lỗi lấy danh sách booking request của gia sư', error.message)
        return {
            data: null,
            error: 'Không thể tải danh sách yêu cầu. Vui lòng thử lại sau!'
        }
    }
    return {data, error: null}
}


export async function getStudentBookingRequest(){
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
    if(!user) return { data: null, error: 'Bạn cần đăng nhập để xem danh sách này'}


    const {data:bookings, error} = await supabase.from('booking_requests')
        .select(`
            id,
            student_id,
            tutor_id,
            subject,
            schedule_slot_id,
            contact_phone,
            message,
            status,
            created_at,
            updated_at,
            tutor:profiles!booking_requests_tutor_id_fkey (
                id,
                full_name,
                avatar_url,
                phone,
                tutor_profile: tutor_profiles( 
                    school_name,
                    educations,
                    is_verified
                )
            )
            
        `)
        .eq('student_id', user.id)
        .order('created_at', {ascending: false})

    if(error){
        console.error('Lỗi lấy danh sách booking request của Học sinh', error?.message)
        return {data: null, error: 'Hệ thống đang gặp sự cố khi tải danh sách đã đặt. Vui lòng thử lại sau! '}

    }
    if(!bookings || bookings.length === 0){
        return {data: [], error: null}
    }

    const formattedData = bookings.map((booking) => {
        const tutorProfile = Array.isArray(booking.tutor) ? booking.tutor[0] : booking.tutor

        const tutorDetailArray = tutorProfile?.tutor_profile
        const tutorDetail = Array.isArray(tutorDetailArray) ? tutorDetailArray[0] : tutorDetailArray

        return {
            id: booking.id,
            student_id: booking.student_id,
            tutor_id: booking.tutor_id,
            subject: booking.subject,
            schedule_slot_id: booking.schedule_slot_id,
            contact_phone: booking.contact_phone,
            message: booking.message,
            status: booking.status,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
            tutor: {
                id: tutorProfile?.id || null,
                full_name: tutorProfile?.full_name || null,
                avatar_url: tutorProfile?.avatar_url || null,
                phone: tutorProfile?.phone || null,
                school_name: tutorDetail?.school_name || null,
                educations: tutorDetail?.educations || null,
                is_verified: tutorDetail?.is_verified || false,
                }
            }
     })

    return {data: formattedData, error: null}

}