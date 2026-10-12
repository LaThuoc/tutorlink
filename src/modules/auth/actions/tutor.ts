'use server'

import { createClient } from "@/src/lib/supabase/server"    
import { revalidatePath } from "next/cache"
import { updateTutorProfileSchema } from "../validations/tutor.schema"
import { TutorActionState } from "../types/tutor.type"

export async function updateTutorProfile(prevState: TutorActionState, formData: FormData): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const {data: {user}, error} = await supabase.auth.getUser()

    if(!user){
        return {
            success: false, 
            errors: 'Bạn chưa đăng nhập'
        }
    }

    const {data: currentTutor} = await supabase
        .from('tutor_profiles')
        .select('verification_status, is_verified, education, certificates')
        .eq('user_id', user.id)
        .maybeSingle()


    let rawSubjectDetails = []
    try {
        const jsonString = formData.get('subjectDetails') as string
        rawSubjectDetails = jsonString ? JSON.parse(jsonString) : []
    }catch(e){
        return {
            success: false,
            errors: 'Dữ liệu môn học không hợp lệ'
        }
    }

    const rawData = {
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        province: formData.get('province') as string,
        district: formData.get('district') as string,
        address: formData.get('address') as string,
        bio: formData.get('bio') as string,
        quote: formData.get('quote') as string,
        education: formData.get('education') as string,
        subjectDetails: rawSubjectDetails,
        teachingAreas: (formData.getAll('teachingAreas') as string[]).filter(Boolean),
        achievements: (formData.getAll('achievements') as string[]).filter(Boolean),
        skills: (formData.getAll('skills') as string[]).filter(Boolean),
        certificates: (formData.getAll('certificates') as string[]).filter(Boolean),
        schedules: (formData.getAll('schedules') as string[]).filter(Boolean),
    }

    const validationResult = updateTutorProfileSchema.safeParse(rawData)

    if(!validationResult.success){
        return {
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin',
            fieldErrors: validationResult.error.flatten().fieldErrors
        }
    }


    const data = validationResult.data
    const isNewTutor = !currentTutor
    const isAlreadyApproved = currentTutor?.verification_status === 'Approved'

    let finalCertificates: string[] = []

    if (isNewTutor) {
        if (data.certificates.length === 0) {
        return {
            success: false,
            errors: 'Vui lòng tải lên ít nhất 1 bằng cấp/chứng chỉ để tạo hồ sơ gửi duyệt.',
        }
        }
        finalCertificates = data.certificates 
    } else {
        finalCertificates = currentTutor?.certificates || []
    }

    const targetStatus = isNewTutor ? 'Pending' : (isAlreadyApproved ? 'Approved' : (currentTutor?.verification_status || 'Draft'))

    const {
        fullName,
        phone,
        province,
        district,
        address,
        bio,
        quote,
        education,
        subjectDetails,
        teachingAreas,
        achievements,
        skills,
        schedules,
    } = validationResult.data

    const {error: profileError} = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone: phone || null,
            province,
            district,
            address,
        })
        .eq('id', user.id)

    if(profileError){
        return {
            success: false,
            errors: profileError.message
        }
    }


    const subjectList = subjectDetails.map((item) => item.subject)

    const {error: tutorError} = await supabase.from('tutor_profiles').upsert({
        user_id: user.id,
        bio,
        quote,
        education,
        subjects: subjectList,
        subject_details: subjectDetails,
        teaching_areas: teachingAreas,
        achievements,
        skills,
        certificates: finalCertificates,
        schedules,
        verification_status: targetStatus,
        is_verified: isAlreadyApproved ? true : false
    })

    if(tutorError){
        return {
            success: false,
            errors: tutorError.message
        }
    }
    revalidatePath('/dashboard/profile')
    revalidatePath('/tutors')
    revalidatePath(`/tutors/${user.id}`)
    return {success: true}
}

export async function updateTutorSchedules(prevState: TutorActionState, formData: FormData): Promise<TutorActionState | void>{
    const supabase = await createClient()
    const {data : {user}} = await supabase.auth.getUser()
    if(!user){
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }

    const schedules = (formData.getAll('schedules') as string []).filter(Boolean)

    const {error} = await supabase.from("tutor_profiles").update({schedules}).eq('id',user.id)

    if(error){
        return {
            success: false,
            errors: error.message   
        }
    }
    revalidatePath('/dashboard/profile')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}


export async function submitNewVerification(certificateUrl: string): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if(!user){
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }
    if(!certificateUrl){
        return {
            success: false,
            errors: 'Đường dẫn chứng chỉ không được để trống'
        }
    }
    const {error} = await supabase.from('certificate_requests').insert({
        tutor_id: user.id,
        certificate_url: certificateUrl,
        status: 'Pending'
    })
    if(error){
        return {
            success: false,
            errors: error.message
        }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/admin/certificates')
    
    return {success: true}
}


export async function removeCertificates(certificatesUrl: string[]): Promise<TutorActionState| void>{
    const supabase = await createClient()

    const { data: { user}} = await supabase.auth.getUser()

    if(!user){
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }

    if(!certificatesUrl || certificatesUrl.length === 0){
        return {
            success: false,
            errors: 'Vui lòng chọn ít nhất 1 chứng chỉ để xóa'
        }
    }

    const {data: tutor} = await supabase.from('tutor_profiles').select('certificates').eq('user_id', user.id).single()

    if(!tutor){
        return {
            success: false,
            errors: 'Không tìm thấy hồ sơ'
        }
    }

    const currentCertificates = tutor.certificates || []

    const updatedCertificates = currentCertificates.filter((url: string) => !certificatesUrl.includes(url))

    const {error} = await supabase
        .from('tutor_profiles')
        .update({certificates: updatedCertificates})
        .eq('user_id', user.id)

    if(error){
        return {
            success: false,
            errors: error.message
        }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}