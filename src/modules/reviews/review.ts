'use server'
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/src/lib/auth/auth-guard"
import { createReviewSchema } from "@/src/validations/review.schema"
import { TutorActionState } from "@/src/types/tutor.type"
import { ActionState } from "../../types/auth.type"
import { ReviewItem, ReviewStats } from '@/src/types/review.type';
import { requireTutorRole } from "@/src/lib/auth/auth-guard"

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





export async function getTutorReviews(): Promise<{
  success: boolean;
  data?: ReviewItem[];
  stats?: ReviewStats;
  error?: string;
}> {
    const {user, supabase} = await requireTutorRole()


    try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
        return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn.' };
        }

        const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            id,
            student_id,
            tutor_id,
            rating,
            comment,
            created_at,
            student:profiles!reviews_student_id_fkey(full_name, avatar_url)
        `)
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

        if (error) {
        console.error('[getTutorReviews] Error:', error);
        return { success: false, error: error.message };
        }

        const items = (reviews as unknown as ReviewItem[]) || [];

        const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalScore = 0;

        items.forEach((r) => {
        const score = Math.min(5, Math.max(1, Math.round(r.rating)));
        ratingCounts[score] = (ratingCounts[score] || 0) + 1;
        totalScore += r.rating;
        });

        const totalReviews = items.length;
        const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

        return {
        success: true,
        data: items,
        stats: { averageRating, totalReviews, ratingCounts },
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
        return { success: false, error: msg };
    }
}