'use server'

import { createClient } from "@/src/lib/supabase/server"    
import { revalidatePath } from "next/cache"
import { CertificateItem } from "../../../types/tutor.type"
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
    rejectionReason?: string
){
    try{
        const {supabase} = await requireAdminRole()

    

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

        if(action === 'Approve'){
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
            const currentCertificates = ((tutor.certificates_data as unknown ) as CertificateItem[]) || []

            const approvedCertItem: CertificateItem = {
                id: certReq.id,
                title: certReq.title || 'Bằng cấp / Chứng chỉ',
                issuedBy: certReq.issued_by || 'Chưa cập nhật',
                detail: certReq.detail || '',
                issuedYear: certReq.issue_year || new Date().getFullYear().toString(),
                imageUrl: certReq.certificate_url,
                isVerified: true

            }

            const updatedCertificates = [...currentCertificates, approvedCertItem];
            const {error: updateTutorError} = await supabase.from('tutor_profiles')
                .update({
                    certificates_data: updatedCertificates as unknown,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', tutorId)

            if(updateTutorError){
                return {
                    success: false,
                    errors: `Lỗi cập nhật hồ sơ: ${updateTutorError.message}`
            }}
            const {error: updateReqError} =  await supabase
                .from('certificate_requests')
                .update({ status: 'Approved', rejection_reason: null })
                .eq('id', requestId);
            if (updateReqError) {
                return {
                    success: false,
                    errors: `Lỗi cập nhật trạng thái certificate_requests (Kiểm tra RLS): ${updateReqError.message}`
                };
            }
        }else{
            await supabase.from('certificate_requests')
                .update({
                    status: 'Rejected', 
                    rejection_reason:rejectionReason || 'Ảnh minh chứng không hợp lệ'
                })
                .eq('id', requestId)
        }
        
    
        revalidatePath('/admin/certificates')
        revalidatePath(`/tutors/${tutorId}`)
        revalidatePath('/dashboard/profiletutor')
        revalidatePath('/dashboard/profile');
        return {
            success: true,
            message: action === 'Approve' ? 'Đã duyệt và công khai chứng chỉ!' : 'Đã từ chối yêu cầu.',
        }
    }catch (err: unknown) {
        return { 
            success: false, 
            // Ép kiểu trực tiếp về Class 'Error' của hệ thống thay vì dùng 'any'
            errors: (err as Error).message || 'Lỗi server khi xử lý yêu cầu' 
        };
    }
}







/**
 * 1. Lấy dữ liệu thống kê tổng quan cho Admin Dashboard
 */
export async function getAdminStats() {
  try {
    const { supabase } = await requireAdminRole();

    const [tutorsRes, studentsRes, requestsRes, pendingCertsRes] = await Promise.all([
      supabase.from('tutor_profiles').select('user_id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('booking_requests').select('id', { count: 'exact', head: true }),
      supabase.from('certificate_requests').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
    ]);

    return {
      totalTutors: tutorsRes.count || 0,
      totalStudents: studentsRes.count || 0,
      totalRequests: requestsRes.count || 0,
      pendingCertificates: pendingCertsRes.count || 0,
    };
  } catch (err) {
    console.error('[getAdminStats] Error:', err);
    return { totalTutors: 0, totalStudents: 0, totalRequests: 0, pendingCertificates: 0 };
  }
}

/**
 * 2. Lấy danh sách các yêu cầu xác minh chứng chỉ đang chờ duyệt
 */
/**
 * 2. Lấy danh sách các yêu cầu xác minh chứng chỉ đang chờ duyệt (Đã sửa query)
 */
export async function getPendingCertificates() {
  try {
    const { supabase } = await requireAdminRole();

    // 🔴 IN LOG 1: Kiểm tra xem hàm đã chạy vào đây chưa
    console.log('===> [DEBUG] Đang truy vấn certificate_requests...');

    const { data: certRequests, error: certError } = await supabase
      .from('certificate_requests')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    // 🔴 IN LOG 2: In lỗi từ Supabase nếu có
    if (certError) {
      console.error('===> [LỖI SUPABASE CERT]:', certError);
      throw certError;
    }

    console.log('===> [DEBUG] Danh sách cert_requests tìm thấy:', certRequests);

    if (!certRequests || certRequests.length === 0) {
      return { success: true, data: [] };
    }

    const tutorIds = Array.from(new Set(certRequests.map((c) => c.tutor_id)));
    console.log('===> [DEBUG] Danh sách tutor_id cần lấy:', tutorIds);

    const { data: tutors, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id, school_name, education, profiles(full_name, email, phone, avatar_url)')
      .in('user_id', tutorIds);

    if (tutorError) {
      console.error('===> [LỖI SUPABASE TUTOR]:', tutorError);
    }

    console.log('===> [DEBUG] Kết quả join tutor_profiles:', tutors);

    const formattedData = certRequests.map((cert) => {
      const tutor = tutors?.find((t) => t.user_id === cert.tutor_id);
      return {
        ...cert,
        tutor_profiles: tutor || {
          school_name: 'Chưa cập nhật',
          education: '',
          profiles: { full_name: 'Gia sư', email: '', phone: '', avatar_url: '' }
        }
      };
    });

    return { success: true, data: formattedData };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách chứng chỉ';
    console.error('===> [CATCH ERROR]:', msg);
    return { success: false, error: msg, data: [] };
  }
}




export type ContactStatus = 'pending' | 'processing' | 'resolved' | 'archived';

// Kiểm tra quyền Admin trước khi thao tác
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Không có quyền truy cập');
  }
  return supabase;
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  try {
    const supabase = await verifyAdmin();

    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/contacts');
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message || 'Lỗi hệ thống' };
  }
}

export async function deleteContactMessage(id: string) {
  try {
    const supabase = await verifyAdmin();

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/contacts');
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message || 'Lỗi hệ thống' };
  }
}