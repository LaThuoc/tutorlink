'use server'

import { createClient } from "@/src/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createBookingRequestSchema } from "../validations/booking.schema"
import { ScheduleSlot, TutorActionState } from "../types/tutor.type"
import { requireAuth } from "@/src/lib/auth/auth-guard"

export async function createBookingRequest(prevState: TutorActionState, formData:FormData): Promise<TutorActionState | void>{
    const { user, supabase } = await requireAuth()

    const rawData = {
        tutorId: formData.get('tutorId') as string,
        scheduleSlotIds: formData.getAll('scheduleSlotIds') as string[],
        subject: formData.get('subject') as string,
        contactPhone: formData.get('contactPhone') as string,
        message: formData.get("message") as string
    }

    const validation = createBookingRequestSchema.safeParse(rawData)
    if(!validation.success){
        return {
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin nhập',
            fieldErrors: validation.error.flatten().fieldErrors
        }
    }

    const { tutorId, scheduleSlotIds, subject, contactPhone, message} = validation.data



    const {data: conflictSlots, error} = await supabase.rpc('create_booking_request_safe', {
        p_student_id: user.id,
        p_tutor_id: tutorId,
        p_schedule_slot_ids: scheduleSlotIds,
        p_subject: subject,
        p_contact_phone: contactPhone,
        p_message: message || null,
    })

    if(error){
        return {
            success:false,
            errors: `Lỗi gửi yêu cầu: ${error.message}`
        }
    }

    if(conflictSlots && conflictSlots.length > 0){
        const busyTimes = conflictSlots.map((slot: {slot_title: string}) => slot.slot_title).join(', ')
        return {
            success: false,
            errors: `Các khung giờ sau đã có người đặt ${busyTimes}. Vui lòng chọn và thử lại`
        }
    }
    revalidatePath('/dashboard/student/requests')
    revalidatePath(`/tutors/${tutorId}`)
    return {success: true}
}


export async function cancelBookingRequest(bookingId: string) {
    const { user, supabase } = await requireAuth()

    const {data: booking, error: fetchError} = await supabase.from('booking_requests')
        .select('tutor_id, schedule_slot_id, student_id, status')
        .eq('id', bookingId)
        .eq('student_id', user.id)
        .single()

    if(fetchError || !booking){
        return {
            success: false,
            errors: 'Không tìm thấy yêu cầu đặt lịch hoặc bạn không có quyền thực hiện'
        }
    }
    if(booking.status !== 'Pending'){
        return {
            success: false,
            errors: 'Không thể hủy yêu cầu này vì Gia sư đã xử lý hoặc đơn không còn ở trạng thái chờ duyệt'
        }
    }

    const {data: tutor } = await supabase.from('tutor_profiles')
        .select('schedules_data')
        .eq('tutor_id', booking.tutor_id)
        .single()

    if(tutor && tutor.schedules_data){
        const currentSlots = tutor.schedules_data as ScheduleSlot[]

        const updatedSlots = currentSlots.map((slot) => {
            if(slot.id === booking.schedule_slot_id){
                return {...slot, isAvailable: true}
            }
            return slot
        })
        await supabase.from('tutor_profiles').update({schedules_data: updatedSlots}).eq('user_id', booking.tutor_id)
    }

    revalidatePath('/dashboard/student/requests')
    revalidatePath(`/tutors/${booking.tutor_id}`)

    return {success: true}

}