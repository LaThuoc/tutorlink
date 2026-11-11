'use server'

import { revalidatePath } from "next/cache"
import { createBookingRequestSchema } from "../../validations/booking.schema"
import { ScheduleSlot, TutorActionState } from "../../types/tutor.type"
import { requireAuth } from "@/src/lib/auth/auth-guard"
import { ExistingRequestStatus } from "../../types/tutor.type"
export async function createBookingRequest(prevState: TutorActionState | void, formData:FormData): Promise<TutorActionState>{
    const { user, supabase } = await requireAuth()

    const rawData = {
        tutorId: formData.get('tutorId') as string,
        scheduleSlotIds: formData.getAll('scheduleSlotIds') as string[],
        subject: formData.get('subject') as string,
        contactPhone: formData.get('contactPhone') as string,
        message: formData.get("message") as string,
        lessonDate: formData.get('lessonDate') as string,
    }

    const validation = createBookingRequestSchema.safeParse(rawData)
    if(!validation.success){
        return {
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin nhập',
            fieldErrors: validation.error.flatten().fieldErrors
        }
    }

    const { tutorId, scheduleSlotIds, subject, contactPhone, message, lessonDate} = validation.data



    const {data: conflictSlots, error} = await supabase.rpc('create_booking_request_safe', {
        p_student_id: user.id,
        p_tutor_id: tutorId,
        p_schedule_slot_ids: scheduleSlotIds,
        p_subject: subject,
        p_contact_phone: contactPhone,
        p_message: message || null,
        p_lesson_date: lessonDate || null,
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
   try { const { user, supabase } = await requireAuth()

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


    if(booking.schedule_slot_id && booking.tutor_id){
        try{
            const {data: tutor } = await supabase.from('tutor_profiles')
                .select('schedules_data')
                .eq('user_id', booking.tutor_id)
                .single()
            if(tutor && Array.isArray(tutor.schedules_data)){
                const rawSchedules = tutor.schedules_data as ScheduleSlot[]
                const targetSlotId = booking.schedule_slot_id;
                const updatedSchedules = rawSchedules.map((slot) => {
                    const isIdMatched = slot.id && targetSlotId.includes(slot.id);
                    const isTimeMatched = slot.startTime && targetSlotId.includes(slot.startTime);
                    if (isIdMatched || isTimeMatched) {
                    return { ...slot, isAvailable: true };
                    }
                    return slot;
                })
                await supabase
                    .from('tutor_profiles')
                    .update({schedules_data: updatedSchedules})
                    .eq('user_id', booking.tutor_id)
                    
            }
            
        }catch(slotErr){
            console.error('Lỗi khi khôi phục slot lịch (vẫn tiệp tục hủy đơn):', slotErr)
        }
    }



    const { error: deleteError } = await supabase
      .from('booking_requests')
      .delete()
      .eq('id', bookingId)
      .eq('student_id', user.id);

    if (deleteError) {
      return { success: false, errors: `Lỗi khi xóa yêu cầu: ${deleteError.message}` };
    }

    revalidatePath('/dashboard/student/requests')
    revalidatePath(`/tutors/${booking.tutor_id}`)

    return {success: true}
   }catch (err: unknown){
        const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
        return { success: false, errors: message };
   }
}



export async function getExistingBookingRequest(tutorUserId: string): Promise<ExistingRequestStatus> {
    try{
        const {user, supabase} = await requireAuth()
        if(!user) return null
        const {data, error} = await supabase.from('booking_requests')
            .select('id, status, rejection_reason, subject, contact_phone')
            .eq('student_id', user.id)
            .eq('tutor_id', tutorUserId)
            .in('status', ['Pending', 'Accepted', 'Rejected'])
            .order('created_at', {ascending: false})
            .limit(1)
            .maybeSingle()
        if(error || !data) return null

        return {
            id: data.id,
            status: data.status,
            rejectionReason: data.rejection_reason,
            subject: data.subject,
            contactPhone: data.contact_phone
        }
    }catch{return null}
}

