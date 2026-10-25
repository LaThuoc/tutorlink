'use server'

import { createClient } from "@/src/lib/supabase/server"    
import { revalidatePath } from "next/cache"
import { CertificateItem } from "../types/tutor.type"
import { requireAdminRole } from "@/src/lib/auth/auth-guard"

export async function processFirstTimeProfile(
    tutorId: string, action: 'Approve' | 'Reject', rejectionReason?: string){

    const {supabase} = await requireAdminRole()

    const isApproved = action === 'Approve'

    const {error} = await supabase.from('tutor_profiles')
        .update({
            is_verified: isApproved,
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

    const{error: requestError} = await supabase.from('certificate_requests')
        .update({
            status: isApproved ? 'Approved' : 'Rejected',
            rejection_reason: isApproved ? null : rejectionReason || 'Hồ sơ tổng thể bị từ chối'

        })
        .eq('tutor_id', tutorId)
        .eq('status', 'Pending')
    if(requestError){
        console.error('Lỗi đồng bộ trạng thái chứng chỉ', requestError.message)
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
    rejectionReason: string
){
    const {supabase} = await requireAdminRole()

    if(action === 'Approve'){

        const {data: certReq, error: reqFetchError} = await supabase 
            .from('certificate_requests')
            .select('*')
            .eq('id', requestId)
            .single()
        if(reqFetchError || !certReq){
            return {
                success: false,
                errors: reqFetchError?.message || 'Không tìm thấy yêu cầu xác minh'
            }
        }


        const {data: tutor, error: fetchError} = await supabase.from('tutor_profiles')
            .select('certificates_data')
            .eq('user_id', tutorId)
            .single()
        if(fetchError){
            return {
                success: false,
                errors: fetchError.message
            }
        }

        const currentCertificates = ((tutor?.certificates_data as unknown ) as CertificateItem[]) || []

        const isExist = currentCertificates.some(c => c.imageUrl === certReq.certificate_url)

        if(!isExist){
            const newCertificateItem: CertificateItem = {
                id: certReq.id,
                title: certReq.title || 'Bằng cấp / Chứng chỉ',
                issuedBy: certReq.issued_by || 'Chưa cập nhật',
                detail: certReq.detail || '',
                issuedYear: certReq.issue_year || new Date().getFullYear().toString(),
                imageUrl: certReq.certificate_url,
                isVerified: true

            }
            const {error: updateTutorError} = await supabase.from('tutor_profiles')
                .update({
                    certificates_data: [...currentCertificates, newCertificateItem] as unknown
                })
                .eq('user_id', tutorId)

            if(updateTutorError){
                return {
                    success: false,
                    errors: updateTutorError.message
                }
            }
        }else{
            return {
                success: false,
                errors: 'Chứng chỉ này đã tồn tại trong hồ sơ.'
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
    revalidatePath('/dashboard/profile')
    return {
        success: true
    }
}


