'use server'
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/src/lib/auth/auth-guard"
import { createReviewSchema } from "@/src/validations/review.schema"
import { TutorActionState } from "@/src/types/tutor.type"
import { ActionState } from "../../types/auth.type"

export async function createReview(prevState: ActionState, formData: FormData): Promise<ActionState | void>{

    const {user, supabase} = await requireAuth()

    const rawData = {
        tutorId: formData.get('tutorId'),
        rating: formData.get('rating'),
        comment: formData.get('comment')
    }
    const validationResult = createReviewSchema.safeParse(rawData)

    if(!validationResult.success){
        return{
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin đánh giá',
            fieldErrors: validationResult.error.flatten().fieldErrors
        }
       
    }


    const {tutorId, rating, comment} = validationResult.data
    const {data: profile} = await supabase.from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
   
    if(profile?.role !== 'student'){
        return {
            success: false,
            errors: 'Chỉ tài khoản Học viên mới có quyền đánh giá cho Gia sư'
        }
    }
    const {error} = await supabase.from('reviews')  
        .insert({
            student_id: user.id,
            tutor_id: tutorId,
            rating, 
            comment,
        })

    if(error){
        if(error.code === '23505' || error.message.includes('review_unique')){
            return {
                success: false,
                errors: 'Bạn đã gửi đánh giá cho Gia này trước đó rồi'
            }
        }
        return {
            success:false,
            errors: error.message       
        }

    }
    revalidatePath(`/tutors/${tutorId}`)
    revalidatePath('/dashboard/student/reviews')

    return { 
        success: true,
        message: 'Cảm ơn bạn đã gửi đánh giá cho Gia sư!'
    }
}