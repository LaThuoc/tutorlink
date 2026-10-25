'use server'

import { createClient } from "@/src/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ScheduleSlot, TutorActionState } from "../types/tutor.type"


export async function UpdateTutorSchedule(slots: ScheduleSlot[]): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if(!user){ 
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }

    for(const slot of slots){
        if(!slot.startTime || !slot.endTime){
            return {success: false, errors: 'Thời gian bắt đầu và kết thúc không được để trống'}
        }
        if(slot.dayOfWeek < 2 || slot.dayOfWeek > 8){
            return { success: false, errors: 'Ngày trong tuần không hợp lệ'}
        }
    }

    const { error} = await supabase.from('tutor_profiles')
        .update({
            schedules_data: slots as unknown,
            updated_at: new Date().toISOString()

        })
        .eq('user_id', user.id)
    
    if(error){
        return { success:false, errors: `Không thể lưu lịch: ${error.message}`}
    }

    revalidatePath('/dashboard/schedule')
    revalidatePath('/dashboard/profile')
    revalidatePath(`/tutors/${user.id}`)
    return { success: true}
}


export async function toggleScheduleSlotStatus(slotId: string, isAvailable: boolean): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const { data: {user}} = await supabase.auth.getUser()
    if(!user){
        return {success: false, errors: 'Bạn chưa đăng nhập'}
    }

    const {data: tutor} = await supabase.from('tutor_profiles')
        .select('schedules_data')
        .eq('user_id', user.id)
        .single()

    const currentSlots = (tutor?.schedules_data as unknown as ScheduleSlot[]) || []

    const updatedSlots = currentSlots.map((slot) => slot.id === slotId ? {...slot, isAvailable}: slot)

    const {error} = await supabase.from('tutor_profiles')
        .update({
            schedules_data: updatedSlots as unknown,
            updated_at: new Date().toISOString()
        })
    if(error){
        return {success:false, errors: error.message}
    }
    revalidatePath('/dashboard/schedule')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}   


export async function deleteScheduleSlot(slotIds: string[]): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
    if(!user){
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }

    const {data: tutor} = await supabase.from('tutor_profiles')
        .select('schedules_data')
        .eq('user.id', user.id)
        .single()

    const currentSlots = (tutor?.schedules_data as unknown as ScheduleSlot[]) || []

    const updatedSlots = currentSlots.filter((slot) => !slotIds.includes(slot.id))


    const {error} = await supabase.from('tutor_profiles').
        update({
            schedules_data: updatedSlots as unknown,
            updated_at: new Date().toISOString()
        }).eq('user_id', user.id)

    if(error){
        return {
            success: false,
            errors: error.message
        }
    }

    revalidatePath('/dashboard/shedule')
    revalidatePath(`/tutors/${user.id}`)
    return {success: true}

}