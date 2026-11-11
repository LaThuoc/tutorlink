'use server'
import { requireTutorRole } from "@/src/lib/auth/auth-guard";
import { revalidatePath } from "next/cache";

export async function deleteBookingRequests(ids: string[]) {
  try {
    const { user, supabase } = await requireTutorRole();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập hoặc không có quyền gia sư.' };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: 'Chưa chọn mục nào để xóa.' };
    }

    const { data: bookings, error: fetchErr } = await supabase
      .from('booking_requests')
      .select('id, status, student_id')
      .in('id', ids)
      .eq('tutor_id', user.id);

    if (fetchErr) {
      console.error('[deleteBookingRequests] Fetch error:', fetchErr);
      return { success: false, error: fetchErr.message };
    }

    if (!bookings || bookings.length === 0) {
      return { success: false, error: 'Không tìm thấy dữ liệu cần xóa.' };
    }

    
    const deletableBookingIds = bookings
      .filter((b) => b.status === 'Pending' || b.status === 'Rejected' || b.status === 'Cancelled')
      .map((b) => b.id);

    const acceptedBookings = bookings.filter((b) => b.status === 'Accepted');

    if (acceptedBookings.length > 0) {
      const acceptedIds = acceptedBookings.map((b) => b.id);

      await supabase
        .from('lessons')
        .delete()
        .in('booking_id', acceptedIds)
        .neq('status', 'Completed');

      await supabase
        .from('booking_requests')
        .update({ status: 'Cancelled' })
        .in('id', acceptedIds)
        .eq('tutor_id', user.id);
    }

    if (deletableBookingIds.length > 0) {
      const { error: deleteErr } = await supabase
        .from('booking_requests')
        .delete()
        .in('id', deletableBookingIds)
        .eq('tutor_id', user.id);

      if (deleteErr) {
        console.error('[deleteBookingRequests] Delete error:', deleteErr);
        return { success: false, error: deleteErr.message };
      }
    }

    revalidatePath('/dashboard/requests');
    revalidatePath('/dashboard/revenue');
    revalidatePath('/dashboard/lesson');

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa yêu cầu.';
    return { success: false, error: msg };
  }
}




export async function deleteAcceptedLessons(bookingIds: string[]) {
  try {
    const { user, supabase } = await requireTutorRole();
    if (!user) return { success: false, error: 'Chưa đăng nhập' };

    if (!bookingIds || bookingIds.length === 0) {
      return { success: false, error: 'Chưa chọn mục nào để xóa' };
    }

    const { error: deleteLessonsErr } = await supabase
      .from('lessons')
      .delete()
      .in('booking_id', bookingIds)
      .eq('tutor_id', user.id)
      .neq('status', 'Completed');

    if (deleteLessonsErr) {
      console.error('[deleteAcceptedLessons] Error deleting lessons:', deleteLessonsErr);
      return { success: false, error: deleteLessonsErr.message };
    }

    const { error: updateBookingErr } = await supabase
      .from('booking_requests')
      .update({ status: 'Cancelled' })
      .in('id', bookingIds)
      .eq('tutor_id', user.id);

    if (updateBookingErr) {
      console.error('[deleteAcceptedLessons] Error updating booking:', updateBookingErr);
      return { success: false, error: updateBookingErr.message };
    }

    revalidatePath('/dashboard/lesson');
    revalidatePath('/dashboard/requests');
    revalidatePath('/dashboard/revenue');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa';
    return { success: false, error: msg };
  }
}




export async function archiveOrDeleteStudentRevenue(studentId: string) {
  const {user, supabase} = await requireTutorRole()

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('tutor_id', user.id)
      .eq('student_id', studentId)
      .neq('status', 'Completed'); 

    if (deleteError) {
      console.error('[archiveOrDeleteStudentRevenue] Error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    
    await supabase
      .from('booking_requests')
      .update({ status: 'Cancelled' })
      .eq('tutor_id', user.id)
      .eq('student_id', studentId);

    revalidatePath('/dashboard/revenue');
    revalidatePath('/dashboard/lesson');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}