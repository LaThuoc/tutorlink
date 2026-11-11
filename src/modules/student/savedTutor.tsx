'use server'

import { requireAuth } from "@/src/lib/auth/auth-guard"
import { revalidatePath } from "next/cache"

export async function toggleSaveTutor(tutorUserId: string, currentSaved: boolean){
    try{
        const {user, supabase} = await requireAuth()

        if(currentSaved){
            const {error} = await supabase
                .from('saved_tutors')
                .delete()
                .eq('student_id', user.id )
                .eq('tutor_id', tutorUserId )
            if(error){
            return {success: false, errors: `Lỗi khi bỏ lưu: ${error.message}`}
            }
            revalidatePath(`/tutors/${tutorUserId}`);
            return { success: true, saved: false, message: 'Đã bỏ lưu gia sư.' };
        }else{
            const {error} = await supabase.from('saved_tutors')
                .insert({
                    student_id: user.id,
                    tutor_id: tutorUserId
                })
            if(error){
                return {
                    success:false,
                    errors: `Lỗi khi lưu gia sư: ${error.message}`
                }
            }
            revalidatePath(`/tutors/${tutorUserId}`);
             return { success: true, saved: true, message: 'Đã lưu gia sư thành công!' };
        }
        
    }catch(err){
        const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
        const isAuthError = 
        message.toLowerCase().includes('unauthorized') || 
        message.toLowerCase().includes('authenticated') ||
        message.toLowerCase().includes('đăng nhập');

        if (isAuthError) {
        return { 
            success: false, 
            requireAuth: true, 
            errors: 'Vui lòng đăng nhập để thực hiện thao tác này!' 
        };
        }
        return {success:false, errors: message}
    }
}


export async function checkIfTutorIsSaved(tutorUserId: string): Promise<boolean>{
    try{
        const {user, supabase} = await requireAuth()
        const {data} = await supabase
            .from('saved_tutors')
            .select('id')
            .eq('student_id', user.id)
            .eq('tutor_id', tutorUserId)
            .maybeSingle()
        return !!data
    }catch{
        return false
    }
}