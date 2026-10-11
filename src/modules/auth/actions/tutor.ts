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
            errors: 'Vui lòng kiểm tra lại thông tin nhập vào',
            fieldErrors: validationResult.error.flatten().fieldErrors
        }
    }

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
        certificates,
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
        certificates,
        schedules
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


export async function requestVerification(): Promise<TutorActionState | void>{
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if(!user){
        return {
            success: false,
            errors: 'Bạn chưa đăng nhập'
        }
    }
    const {data: tutor} = await supabase
        .from('tutor_profiles')
        .select('education, subject_details, certificates')
        .eq('id', user.id)
        .single()
    if(!tutor || !tutor.education || !tutor.subject_details.length ){
        return {
            success: false,
            errors: 'Vui lòng hoạn thiện Học vấn và Môn dạy trước khi gửi yêu cầu duyệt'
        }
    }
    if(!tutor.certificates || tutor.certificates.length === 0){
        return {
            success: false,
            errors: 'Vui lòng tải lên ít nhất 1 chứng chỉ/bằng cấp để hệ thống phê duyệt'
        }
    }

    const {error} = await supabase.from('tutor_profiles').update()
}