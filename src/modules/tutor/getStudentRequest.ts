'use server';
import { requireTutorRole } from "@/src/lib/auth/auth-guard"
import { ScheduleSlot } from "@/src/types/tutor.type"
import { revalidatePath } from "next/cache"
import { BookingStatus, BookingRequestItem } from "@/src/types/tutor.type"



export async function getTutorBookingRequests(): Promise<{
  success: boolean;
  data?: BookingRequestItem[];
  tutorSchedules?: ScheduleSlot[];
  error?: string;
}> {
  const { user, supabase } = await requireTutorRole()

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn.' };
    }

    const [{ data: requests, error: reqErr }, { data: tutorProfile }] = await Promise.all([
      supabase
        .from('booking_requests')
        .select(`
          *,
          student:profiles!booking_requests_student_id_fkey(full_name, avatar_url, phone)
        `)
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('tutor_profiles')
        .select('schedules_data')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    if (reqErr) {
      console.error('[getTutorBookingRequests] Error:', reqErr);
      return { success: false, error: reqErr.message };
    }

    let tutorSchedules: ScheduleSlot[] = [];
    if (tutorProfile?.schedules_data) {
      try {
        tutorSchedules = typeof tutorProfile.schedules_data === 'string'
          ? JSON.parse(tutorProfile.schedules_data)
          : (tutorProfile.schedules_data as ScheduleSlot[]);
      } catch {
        tutorSchedules = [];
      }
    }

    return { 
      success: true, 
      data: (requests as unknown as BookingRequestItem[]) || [],
      tutorSchedules 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}


export async function updateBookingStatus(requestId: string, action: 'Accepted' | 'Rejected', rejectionReason?: string): Promise<{ success: boolean; errors?: string }>{
    const { user, supabase } = await requireTutorRole()

    try{

        const {data: bookingReq, error: fetchErr} = await supabase.from('booking_requests').select('id, schedule_slot_id, tutor_id')
            .eq('id', requestId).eq('tutor_id',user.id ).single()

        if (fetchErr || !bookingReq) {
            return { success: false, errors: 'Không tìm thấy yêu cầu học hoặc bạn không có quyền xử lý.' };
        }

        const updatePayload: {
            status: BookingStatus;
            updated_at: string;
            rejection_reason?: string | null;
            } = {
            status: action,
            updated_at: new Date().toISOString(),
        };

        if (action === 'Rejected') {
            updatePayload.rejection_reason = rejectionReason?.trim() || 'Gia sư bận lịch học khác';
        }

        const { error: updateErr } = await supabase
            .from('booking_requests')
            .update(updatePayload)
            .eq('id', requestId);

        if (updateErr) {
            return { success: false, errors: updateErr.message };
        }

        

        if(action === 'Accepted' && bookingReq.schedule_slot_id){
            const {data: tutor} = await supabase.from('tutor_profiles')
                .select('schedules_data')
                .eq('user_id', user.id)
                .maybeSingle()

            if (tutor?.schedules_data) {
                let currentSlots: ScheduleSlot[] = [];
                try {
                currentSlots = typeof tutor.schedules_data === 'string'
                    ? JSON.parse(tutor.schedules_data)
                    : (tutor.schedules_data as ScheduleSlot[]);
                } catch {
                    currentSlots = [];
                }
            
                const updatedSlots = currentSlots.map((slot) =>  slot.id === bookingReq.schedule_slot_id
                    ? {...slot, isAvailable: false}
                    : slot
                )

                await supabase.from('tutor_profiles').update({schedules_data: updatedSlots as unknown}).eq('user_id', user.id)
            }
        }
        revalidatePath('/dashboard/requests')
        revalidatePath('/dashboard/schedule');
        revalidatePath(`/tutors/${user.id}`)

            return { success: true };
    }catch(err: unknown){
        const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
        return { success: false, errors: msg };
    }
}




export interface LessonSession {
  id: string;
  booking_id: string;
  student_id: string;
  subject: string;
  lesson_date: string;
  schedule_text: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  is_paid: boolean;
}


function parseTargetDayOfWeek(scheduleSlotId: string | null, rawLessonDate: string | null): number {
  if (scheduleSlotId) {
    const slotLower = scheduleSlotId.toLowerCase();
    if (slotLower.includes('thứ 2') || slotLower.includes('mon')) return 1;
    if (slotLower.includes('thứ 3') || slotLower.includes('tue')) return 2;
    if (slotLower.includes('thứ 4') || slotLower.includes('wed')) return 3;
    if (slotLower.includes('thứ 5') || slotLower.includes('thu')) return 4;
    if (slotLower.includes('thứ 6') || slotLower.includes('fri')) return 5;
    if (slotLower.includes('thứ 7') || slotLower.includes('sat')) return 6;
    if (slotLower.includes('chủ nhật') || slotLower.includes('sun')) return 0;
  }

  if (rawLessonDate) {
    const d = new Date(rawLessonDate);
    if (!isNaN(d.getTime())) {
      return d.getUTCDay();
    }
  }

  return 2; 
}


function formatTimeOnly(slotText: string | null): string {
  if (!slotText) return '14:00 - 16:00';
  
  const match = slotText.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return slotText;
}

export async function getOrGenerateLessons(
  bookingId: string, 
  month: number, 
  year: number   
) {
  const {user, supabase} = await requireTutorRole()

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: existingLessons, error: fetchErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('booking_id', bookingId)
      .gte('lesson_date', startDateStr)
      .lte('lesson_date', endDateStr)
      .order('lesson_date', { ascending: true });

    if (fetchErr) return { success: false, error: fetchErr.message };

    if (existingLessons && existingLessons.length > 0) {
      return { success: true, lessons: existingLessons as LessonSession[] };
    }

    const { data: booking } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) return { success: false, error: 'Không tìm thấy thông tin đăng ký' };

    const targetDayOfWeek = parseTargetDayOfWeek(booking.schedule_slot_id, booking.lesson_date);
    const timeOnlyText = formatTimeOnly(booking.schedule_slot_id);

    const generatedLessons = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateUtc = new Date(Date.UTC(year, month - 1, day));
      const currentDayOfWeek = dateUtc.getUTCDay();

      if (currentDayOfWeek === targetDayOfWeek) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        generatedLessons.push({
          booking_id: bookingId,
          tutor_id: user.id,
          student_id: booking.student_id,
          subject: booking.subject,
          lesson_date: dateStr,
          schedule_text: timeOnlyText, 
          status: 'Pending',
          is_paid: false,
        });
      }
    }

    if (generatedLessons.length === 0) {
      return { success: true, lessons: [] };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('lessons')
      .insert(generatedLessons)
      .select();

    if (insertErr) return { success: false, error: insertErr.message };

    return { success: true, lessons: inserted as LessonSession[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}

export async function completeSingleLesson(lessonId: string) {
    const {user, supabase} = await requireTutorRole()


  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Chưa đăng nhập' };

    const { data: updatedLesson, error } = await supabase
      .from('lessons')
      .update({ status: 'Completed' })
      .eq('id', lessonId)
      .eq('tutor_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/lesson');
    revalidatePath('/dashboard/revenue');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}