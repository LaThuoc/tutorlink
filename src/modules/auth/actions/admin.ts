'use server'

import { createClient } from "@/src/lib/supabase/server"    
import { revalidatePath } from "next/cache"

export async function processFirstTimeProfile(
    tutorId: string, action: 'Approve' | 'Reject', rejectionReason?: string){

    const supabase = await createClient()

    const isApproved = action === 'Approve'

    const {error} = await supabase.from('tutor_profiles')
        .update({
            is_verificated: isApproved,
            verification_status: isApproved ? 'Approved' : 'Rejected',
            rejection_reason: isApproved ? null : rejectionReason || 'Hồ sơ chưa đạt yêu cầu'
        })
        .eq('user_id', tutorId)

        if(error){
            return {
                success: false,
                errors: error.message
            }
        }

    revalidatePath('/admin/tutors')
    revalidatePath('/tutors')
    revalidatePath(`.tutors/${tutorId}`)
    
    return {
        success: true
    }
    
}

export async function processNewCertificateRequest(
    requestId: string,
    tutorId: string,
    action: 'Approve' | 'Reject',
    certificateUrl: string,
    rejectionReason: string
){
    const supabase = await createClient()

    if(action === 'Approve'){
        const {data: tutor, error: fetchError} = await supabase.from('tutor_profiles')
            .select('certificates')
            .eq('user_id', tutorId)
            .single()
        if(fetchError){
            return {
                success: false,
                errors: fetchError.message
            }
        }

        const currentCertificates = (tutor?.certificates || []) as string[]

        if(!currentCertificates.includes(certificateUrl)){
            const {error: updateTutorError} = await supabase.from('tutor_profiles')
                .update({
                    certificates: [...currentCertificates, certificateUrl]
                })
                .eq('user_id', tutorId)

            if(updateTutorError){
                return {
                    success: false,
                    erors: updateTutorError.message
                }
            }
        }
        const {error: updateRequestError} = await supabase.from('certificate_requests')
            .update({
                status: 'Approved', rejection_reason: null
            })
            .eq('id', requestId)
        if(updateRequestError){
            return {
                success:false,
                errors: updateRequestError.message
            }
        }
    }else{
        const {error: updateRequestError} = await supabase.from('certificate_requests')
            .update({
                status: 'Rejected', 
                rejection_reason: rejectionReason || 'Ảnh chứng chỉ không hợp lệ'
            })
            .eq('id', requestId)
        if(updateRequestError){
            return {
                success:false,
                errors: updateRequestError.message
            }
        }
    }
    revalidatePath('/admin/certificates')
    revalidatePath(`/tutors/${tutorId}`)
    return {
        success: true
    }
}

