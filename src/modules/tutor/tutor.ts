'use server'

import { revalidatePath } from "next/cache"
import { TutorActionState, ExperienceItem, EducationItem, CertificateItem, ScheduleSlot } from "../../types/tutor.type"
import { requireTutorRole } from "@/src/lib/auth/auth-guard"
import { educationItemSchema, updateTutorProfileSchema, 
    certificateItemSchema, experienceItemSchema, Section3Schema, PersonalInfoSchema } from "../../validations/tutor.schema"
import { SubjectDetailItem } from "../../types/tutor.type"
import {z} from "zod"
export async function updateTutorProfile(prevState: TutorActionState | null | undefined, formData: FormData): Promise<TutorActionState>{
    const { user, supabase } = await requireTutorRole()


    const {data: currentTutor} = await supabase
        .from('tutor_profiles')
        .select('verification_status, is_verified, education, certificates_data')
        .eq('user_id', user.id)
        .maybeSingle()

    const parseJsonField = <T>(fieldName: string): T[] => {
        const raw = formData.get(fieldName) as string 
        try{
            return raw ? (JSON.parse(raw) as T[]) : []
        }catch{
            return []
        }
    }
    const parseStringArray = (fieldName: string): string[] => {
        const values = (formData.getAll(fieldName) as string[]).filter(Boolean)
        return values.flatMap((v) => {
            const s = String(v).trim()
            if (s.startsWith('[')) {
                try {
                    const arr = JSON.parse(s)
                    return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [s]
                } catch {
                    return [s]
                }
            }
            return [s]
        })
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
        headline: (formData.get('headline') as string) || '', // Bổ sung headline
        // hometown: formData.get('hometown') as string,
        bio: formData.get('bio') as string,
        quote: formData.get('quote') as string,
        subjects: parseStringArray('subjects'),
        grades: parseStringArray('grades'),
        hourlyRate: Number(formData.get('hourlyRate')),
        teachingAreas: parseStringArray('teachingAreas'),
        achievements: parseStringArray('achievements'),
        skills: parseStringArray('skills'),
        experiences: parseJsonField<ExperienceItem>('experiences'),
        educations: parseJsonField<EducationItem>('educations'),
        schedulesData: parseJsonField<ScheduleSlot>('schedulesData'),
        certificates: parseJsonField<CertificateItem>('certificates'),
        schedules: parseStringArray('schedules'),
        schoolName: formData.get('schoolName') as string,
        teachingModes: parseStringArray('teachingModes'),
        subjectDetails: parseJsonField<SubjectDetailItem>('subjectDetails'),

    }

    const validationResult = updateTutorProfileSchema.safeParse(rawData)

    if(!validationResult.success){
        console.log("Lỗi validatation chi tiết:", validationResult.error.flatten().fieldErrors )
        return {
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin',
            fieldErrors: validationResult.error.flatten().fieldErrors
        }
    }


    const data = validationResult.data
    const isNewTutor = !currentTutor || currentTutor.verification_status === 'Draft'
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
        // hometown,
        headline, // Destructure headline
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

    const subjectDetails = rawData.subjectDetails

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
            // hometown: hometown || null,
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
        headline, // Đã thêm vào đây
        bio,
        quote,
        education,
        school_name: schoolName,
        teaching_modes: teachingModes,
        subjects: subjects,
        grades: grades,
        subject_details: subjectDetails as unknown,
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
        is_completed: true,
        updated_at: new Date().toISOString()
    }, {onConflict: 'user_id'})

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
    return {
        success: true,
        isCompleted: true,
        message: 'Cập nhật hồ sơ gia sư thành công'
    }
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


export async function updateTutorCertificates(certificates: CertificateItem[]): Promise<TutorActionState>{
    try{
        const { user, supabase } = await requireTutorRole()
        const parsed = z.array(certificateItemSchema).safeParse(certificates);
        if (!parsed.success) {
            return { success: false, errors: parsed.error.issues[0]?.message || 'Dữ liệu chứng chỉ không hợp lệ' };
        }
        
        const validCerts = parsed.data;
        const { data: existingRequests } = await supabase
            .from('certificate_requests')
            .select('certificate_url')
            .eq('tutor_id', user.id);

        const existingUrls = new Set((existingRequests || []).map((r) => r.certificate_url));


        const newRequestsToInsert = validCerts
            .filter((cert) => cert.imageUrl && !existingUrls.has(cert.imageUrl))
            .map((cert) => ({
                tutor_id: user.id,
                certificate_url: cert.imageUrl,
                title: cert.title,
                issued_by: cert.issuedBy,
                issue_year: cert.issuedYear,
                detail: cert.detail || null,
                status: 'Pending',
        }));
        if (newRequestsToInsert.length === 0) {
            return { success: true, message: 'Không có chứng chỉ mới nào cần gửi xét duyệt.' };
        }

        const {error: insertError} = await supabase.from('certificate_requests').insert(newRequestsToInsert)
        if(insertError){
            return {
                success: false,
                errors: `Lỗi gửi yêu cầu xét duyệt: ${insertError.message}`
            }
        }

        revalidatePath('/dashboard/profiletutor')
        revalidatePath('/admin/certificates')
        
        return {success: true, message: 'Gửi yêu cầu xét duyệt chứng chỉ thành công! Vui lòng chờ Admin phê duyệt.',}
    }catch (err: unknown) {
        return { 
            success: false, 
            // Ép kiểu trực tiếp về 'Error' của hệ thống thay vì dùng 'any'
            errors: (err as Error).message || 'Lỗi server khi gửi chứng chỉ' 
        };
    }
}


export async function removeCertificates(certificatesIds: string[]): Promise<TutorActionState>{
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

export async function updateTutorExperienceAndSkills(payload: {
    experiences: ExperienceItem[],
    achievements:  string[],
    skills: string[];
}): Promise<TutorActionState>{
    try{
        const { user, supabase } = await requireTutorRole()
        const parsed = Section3Schema.safeParse(payload)

        if (!parsed.success) {
            return { success: false, errors: parsed.error.issues[0]?.message || 'Dữ liệu kinh nghiệm/thành tích không hợp lệ' };
        }
        const {error} = await supabase.from('tutor_profiles').update({
            achievements: parsed.data.achievements,
            skills: parsed.data.skills,
            experiences: parsed.data.experiences as unknown,
            updated_at: new Date().toISOString()
        }).eq('user_id', user.id)
        if(error){
            return {
                success:false,
                errors: `Không thể cập nhật Kinh nghiệm & Thành tích ${error.message}`
            }
        }
        revalidatePath('/dashboard/profiletutor');
        revalidatePath('/dashboard/profile')
        revalidatePath(`/tutors/${user.id}`)

        return { success: true }
    }catch (err: unknown) {
        return { 
            success: false, 
            errors: (err as Error).message || 'Lỗi server khi cập nhật Kinh nghiệm & Thành tích' 
        }; 
    }
}

export async function updateTutorPersonalInfo(payload: {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  schoolName: string;
  education: string;
  hourlyRate: number | '';
  headline: string;
  bio: string;
  quote: string;
  subjectDetails: SubjectDetailItem[];
  teachingAreas: string[];
  teachingModes: string[];
}): Promise<TutorActionState> {
  try {
    const { user, supabase } = await requireTutorRole();

    // 🛡️ Validate
    const parsed = PersonalInfoSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.issues[0]?.message || 'Thông tin cá nhân không hợp lệ' };
    }

    const data = parsed.data;

    const derivedSubjects = Array.from(new Set(data.subjectDetails.map((sd) => sd.subject)));
    const derivedGrades = Array.from(new Set(data.subjectDetails.flatMap((sd) => sd.grades || [])));

    await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        gender: data.gender,
        date_of_birth: data.dateOfBirth,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    const { error: profileError } = await supabase
      .from('tutor_profiles')
      .update({
        school_name: data.schoolName,
        education: data.education,
        hourly_rate: data.hourlyRate === '' ? 0 : data.hourlyRate,
        headline: data.headline || '',
        bio: data.bio || '',
        quote: data.quote || '',
        address: data.address || '',
        subject_details: data.subjectDetails as unknown,
        subjects: derivedSubjects,
        grades: derivedGrades,
        teaching_areas: data.teachingAreas,
        teaching_modes: data.teachingModes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (profileError) {
      return { success: false, errors: `Không thể cập nhật hồ sơ: ${profileError.message}` };
    }

    revalidatePath('/dashboard/profiletutor');
    revalidatePath('/dashboard/profile');
    revalidatePath(`/tutors/${user.id}`);
    return { success: true, message: 'Cập nhật thông tin cá nhân & giảng dạy thành công!' };
  }catch (err: unknown) {
    return { 
        success: false, 
        errors: (err as Error).message || 'Lỗi server khi cập nhật thông tin cá nhân' 
    };
    }
}

export async function updateTutorEducations(educations: EducationItem[]): Promise<TutorActionState>{
    try{
        const { user, supabase } = await requireTutorRole()

        const parsed = z.array(educationItemSchema).safeParse(educations)
        if(!parsed.success){
            return {
                success: false,
                errors: parsed.error.issues[0]?.message || 'Dữ liệu học vấn không hợp lệ',
            }
        }
        const {error} = await supabase.from('tutor_profiles').update({
            educations: parsed.data as unknown,
            updated_at: new Date().toISOString()
        }).eq('user_id', user.id)
        if(error){
            return {
                success:false,
                errors: `Không thể cập nhật học vấn: ${error.message}`
            }
        }

        revalidatePath('/dashboard/profile')
        revalidatePath('/dashboard/profiletutor');
        revalidatePath(`/tutors/${user.id}`)

        return { success: true }
    }catch(err: unknown){
        const errorMessage = err instanceof Error ? err.message : 'Lỗi server khi cập nhật học vấn';

        return { 
            success: false, 
            errors: errorMessage 
        }; 
    }
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


export async function completeBookingRequest(requestId: string, tutorId: string){
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