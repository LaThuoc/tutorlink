'use server'

import { createClient } from "@/src/lib/supabase/server"    
import { revalidatePath } from "next/cache"
import { certificateItemSchema, updateTutorProfileSchema } from "../validations/tutor.schema"
import { TutorActionState, ExperienceItem, EducationItem, CertificateItem, ScheduleSlot } from "../types/tutor.type"
import { requireAdminRole } from "@/src/lib/auth/auth-guard"
import { requireTutorRole } from "@/src/lib/auth/auth-guard"

export async function updateTutorProfile(prevState: TutorActionState, formData: FormData): Promise<TutorActionState | void>{
    const { user, supabase } = await requireTutorRole()


    const {data: currentTutor} = await supabase
        .from('tutor_profiles')
        .select('verification_status, is_verified, education, certificates_data')
        .eq('user_id', user.id)
        .maybeSingle()

    const parseJsonField = <T>(fieldName: string): T[] => {
        const raw = formData.get(fieldName) as string 
        try{
            return raw ? JSON.parse(raw) : []
        }catch{
            return []
        }
    }

    const rawData = {
        avatarUrl: formData.get('avatarUrl') as string,
        fullName: formData.get('fullName') as string,
        gender: formData.get('gender') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        phone: formData.get('phone') as string,
        education: formData.get('education') as string,
        province: formData.get('province') as string,
        district: formData.get('district') as string,
        address: formData.get('address') as string,
        hometown: formData.get('hometown') as string,
        bio: formData.get('bio') as string,
        quote: formData.get('quote') as string,
        subjects: (formData.getAll('subjects') as string[]).filter(Boolean), 
        grades: (formData.getAll('grades') as string[]).filter(Boolean),
        hourlyRate: Number(formData.get('hourlyRate')),
        teachingAreas: (formData.getAll('teachingAreas') as string[]).filter(Boolean),
        achievements: (formData.getAll('achievements') as string[]).filter(Boolean),
        skills: (formData.getAll('skills') as string[]).filter(Boolean),
        experiences: parseJsonField<ExperienceItem>('experiences'),
        educations: parseJsonField<EducationItem>('educations'),
        schedulesData: parseJsonField<ScheduleSlot>('schedulesData'),
        certificates: parseJsonField<CertificateItem>('certificates'),
        schedules: (formData.getAll('schedules') as string[]).filter(Boolean),
        schoolName: formData.get('schoolName') as string,
        teachingModes: (formData.getAll('teachingModes') as string[]).filter(Boolean)
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

    let finalCertificates: CertificateItem[] = []

    if (isNewTutor) {
        if (data.certificates.length === 0) {
        return {
            success: false,
            errors: 'Vui lòng tải lên ít nhất 1 bằng cấp/chứng chỉ để tạo hồ sơ gửi duyệt.',
        }
        }
        finalCertificates = data.certificates 
    } else {
        finalCertificates = (currentTutor?.certificates_data as unknown as CertificateItem[]) || []
    }

    const targetStatus = isNewTutor ? 'Pending' : (isAlreadyApproved ? 'Approved' : (currentTutor?.verification_status || 'Draft'))

    const {
        avatarUrl,
        fullName,
        gender,
        dateOfBirth,
        phone,
        province,
        district,
        address,
        hometown,
        bio,
        quote,
        education,
        subjects,
        grades,
        hourlyRate,
        teachingAreas,
        achievements,
        skills,
        experiences,
        educations,
        schedulesData,
        schedules,
        schoolName,
        teachingModes
    } = validationResult.data

    const {error: profileError} = await supabase
        .from('profiles')
        .update({
            avatar_url: avatarUrl || null,
            full_name: fullName,
            phone: phone || null,
            gender: gender || null,
            date_of_birth: dateOfBirth || null,
            province,
            district,
            address,
            hometown: hometown || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if(profileError){
        return {
            success: false,
            errors: profileError.message
        }
    }

    const {error: tutorError} = await supabase.from('tutor_profiles').upsert({
        user_id: user.id,
        bio,
        quote,
        education,
        school_name: schoolName,
        teaching_modes: teachingModes,
        subjects: subjects,
        grades: grades,
        hourly_rate: hourlyRate,
        teaching_areas: teachingAreas,
        achievements,
        skills,
        experiences: experiences as unknown,
        educations: educations as unknown,
        certificates_data: finalCertificates as unknown,
        schedules_data: schedulesData as unknown,
        schedules,
        verification_status: targetStatus,
        is_verified: isAlreadyApproved ? true : false,
        updated_at: new Date().toISOString()
    })

    if(tutorError){
        return {
            success: false,
            errors: tutorError.message
        }
    }
    if(isNewTutor && finalCertificates.length > 0){
        const requestRow = finalCertificates.map(cert => ({
            tutor_id:user.id,
            certificate_url: cert.imageUrl,
            title: cert.title,
            issued_by: cert.issuedBy,
            issue_year: cert.issuedYear,
            detail: cert.detail,
            status: 'Pending' as const 
        }))
        const {error: requestError} = await supabase.from('certificate_requests').insert(requestRow)
        if(requestError){
            console.error('Lỗi tự động tạo yêu cầu chứng chỉ:', requestError.message)
        }
    }
    revalidatePath('/dashboard/profile')
    revalidatePath('/tutors')
    revalidatePath(`/tutors/${user.id}`)
    return {success: true}
}

export async function updateTutorSchedules(prevState: TutorActionState, formData: FormData): Promise<TutorActionState | void>{
    const { user, supabase } = await requireTutorRole()
    const schedules = (formData.getAll('schedules') as string []).filter(Boolean)

    const {error} = await supabase.from("tutor_profiles").update({schedules}).eq('user_id',user.id)

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


export async function submitNewVerification(certificate: CertificateItem): Promise<TutorActionState | void>{
    const { user, supabase } = await requireTutorRole()
    if(!certificate.imageUrl){
        return {
            success: false,
            errors: 'Đường dẫn chứng chỉ không được để trống'
        }
    }
    const {error} = await supabase.from('certificate_requests').insert({
        tutor_id: user.id,
        certificate_url: certificate.imageUrl,
        title: certificate.title,
        issued_by: certificate.issuedBy,
        issue_year: certificate.issuedYear,
        detail: certificate.detail,
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


export async function removeCertificates(certificatesIds: string[]): Promise<TutorActionState| void>{
    const { user, supabase } = await requireTutorRole()
    if(!certificatesIds || certificatesIds.length === 0){
        return {
            success: false,
            errors: 'Vui lòng chọn ít nhất 1 chứng chỉ để xóa'
        }   
    }

    const {data: tutor} = await supabase.from('tutor_profiles').select('certificates_data').eq('user_id', user.id).single()

    if(!tutor){
        return {
            success: false,
            errors: 'Không tìm thấy hồ sơ'
        }
    }

    const currentCertificates = (tutor.certificates_data as unknown as CertificateItem[]) || []

    const updatedCertificates = currentCertificates.filter((item) => !certificatesIds.includes(item.id))

    const {error} = await supabase
        .from('tutor_profiles')
        .update({certificates_data: updatedCertificates as unknown})
        .eq('user_id', user.id)

    if(error){
        return {
            success: false,
            errors: error.message
        }
    }

    const {error: RequestDeleteError} = await supabase.from('certificate_requests').delete().eq('tutor_id', user.id).in('id', certificatesIds)
    if(RequestDeleteError){
            console.error('Lỗi dọn dẹp lịch sử yêu cầu chứng chỉ', RequestDeleteError.message)
    }
    revalidatePath('/dashboard/profile')
    revalidatePath('/admin/certificates')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}

export async function updateTutorExperience(experiences: ExperienceItem[]): Promise<TutorActionState>{
    const { user, supabase } = await requireTutorRole()

    const {error} = await supabase.from('tutor_profiles').update({
        experiences: experiences as unknown,
        updated_at: new Date().toISOString()
    }).eq('user_id', user.id)
    if(error){
        return {
            success:false,
            errors: `Không thể cập nhật kinh nghiệm ${error.message}`
        }
    }
    revalidatePath('/dashboard/profile')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}


export async function UpdateTutorEducations(educations: EducationItem[]): Promise<TutorActionState | void>{
    const { user, supabase } = await requireTutorRole()
    const {error} = await supabase.from('tutor_profiles').update({
        educations: educations as unknown,
        updated_at: new Date().toISOString()
    }).eq('user_id', user.id)
    if(error){
        return {
            success:false,
            errors: `Không thể cập nhật học vấn: ${error.message}`
        }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath(`/tutors/${user.id}`)

    return { success: true }
}



export async function updateBookingStatus(requestId: string, tutorId: string, action: 'Accepted' | 'Rejected'){
    const { user, supabase } = await requireTutorRole()

    const {data: bookingReq} = await supabase.from('booking_requests').select('schedule_slot_id')
        .eq('id', requestId).eq('tutor_id',tutorId ).single()
    if(!bookingReq) return { success:false, errors: 'Không tìm thấy yêu cầu'}

    const {error} = await supabase.from('booking_request')
            .update({status: action, updated_at: new Date().toISOString()})
            .eq('id', requestId)

    if(error) return {success: false, errors: error.message}

    if(action === 'Accepted' && bookingReq.schedule_slot_id){
        const {data: tutor} = await supabase.from('tutor_profiles')
            .select('schedules_data')
            .eq('user_id', tutorId)
            .single()
        
        const currentSlots = (tutor?.schedules_data as unknown as ScheduleSlot[]) || []

        const updatedSlots = currentSlots.map((slot) =>  slot.id === bookingReq.schedule_slot_id
            ? {...slot, isAvailable: false}
            : slot
        )

        await supabase.from('tutor_profiles').update({schedules_data: updatedSlots as unknown}).eq('user_id', tutorId)
        
        revalidatePath('/dashboard/requests')
        revalidatePath(`/tutors/${tutorId}`)
    }
}


export async function compleBookingRequest(requestId: string, tutorId: string){
    const { user, supabase } = await requireTutorRole()
    const {data: bookingReq} = await supabase.from('booking_requests')
        .select('status')
        .eq('id', requestId)
        .eq('tutor_id', tutorId)
        .single()
    if(!bookingReq || bookingReq.status !== 'Accepted'){
        return {
            success: false,
            errors: 'Chỉ có thể hoàn thành các yêu cầu đã được chấp nhận'
        }
    }

    const {error: updatedError} = await supabase.from('booking_requests')
        .update({
            status: 'Completed',
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if(updatedError){
        return {
            success: false,
            errors: updatedError.message
        }
    }

    const {data: tutor} = await supabase.from('tutor_profiles')
        .select('total_lessons_taught')
        .eq('user_id', tutorId)
        .single()

    const currentLessons = tutor?.total_lessons_taught || 0
    await supabase.from('tutor_profiles')
        .update({
            total_Lessons_taught: currentLessons + 1,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', tutorId)

    revalidatePath('/dashboard/requests')
    revalidatePath(`/tutors/${tutorId}`)

    return { success: true }
}