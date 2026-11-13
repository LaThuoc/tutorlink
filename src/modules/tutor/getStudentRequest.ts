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
    if (!user) {
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





function convertVnDayToJsUtcDay(vnDay: number): number {
  if (vnDay === 8 || vnDay === 0 || vnDay === 1) return 0; 
  if (vnDay >= 2 && vnDay <= 7) return vnDay - 1;          
  return -1;
}


function isSlotMatchedWithBooking(slot: ScheduleSlot, rawBookingSlots: string): boolean {
  const requestedItems = rawBookingSlots
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const slotTimeRange = `${slot.startTime} - ${slot.endTime}`;
  const slotJsDay = convertVnDayToJsUtcDay(Number(slot.dayOfWeek));

  return requestedItems.some((item) => {
    if (item === slot.id) return true;

    if (item.includes('|')) {
      const [datePart, timePart] = item.split('|').map((s) => s.trim());
      const d = new Date(`${datePart}T00:00:00Z`);
      const itemJsDay = !isNaN(d.getTime()) ? d.getUTCDay() : -1;
      return itemJsDay === slotJsDay && timePart === slotTimeRange;
    }

    return item === slotTimeRange;
  });
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
            
                const updatedSlots = currentSlots.map((slot) =>  isSlotMatchedWithBooking(slot, bookingReq.schedule_slot_id)
                    ? {...slot, isAvailable: false}
                    : slot
                )

                await supabase.from('tutor_profiles').update({schedules_data: updatedSlots as unknown}).eq('user_id', user.id)
            }
        }
        revalidatePath('/dashboard/requests')
        revalidatePath('/dashboard/schedule');
        revalidatePath('/dashboard/students');
        revalidatePath('/dashboard/student/requests');
        revalidatePath(`/tutors/${user.id}`)

            return { success: true };
    }catch(err: unknown){
        const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
        return { success: false, errors: msg };
    }
}



export async function completeSingleLesson(lessonId: string) {
    const {user, supabase} = await requireTutorRole()

  try {
    

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

interface TutorScheduleSlot {
  id: string;
  dayOfWeek: number; 
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

interface ResolvedScheduleRule {
  jsTargetDay: number;
  timeText: string;
  startFromDate: string | null;
  isMatched: boolean;
}


function extractDateAndTime(rawText: string | null): { extractedDate: string | null; cleanTime: string } {
  if (!rawText) return { extractedDate: null, cleanTime: '' };

  if (rawText.includes('|')) {
    const [left, right] = rawText.split('|').map((s) => s.trim());
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(left);
    return {
      extractedDate: isDate ? left : null,
      cleanTime: right || left,
    };
  }

  const match = rawText.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return { extractedDate: null, cleanTime: match[1].trim() };
  }

  return { extractedDate: null, cleanTime: rawText.trim() };
}

function resolveScheduleFromTutorProfile(
  schedulesData: TutorScheduleSlot[] | null,
  scheduleSlotId: string | null,
  rawLessonDate: string | null
): ResolvedScheduleRule {
  const slots = Array.isArray(schedulesData) ? schedulesData : [];
  const { extractedDate, cleanTime } = extractDateAndTime(scheduleSlotId);

  const effectiveStartDate = extractedDate || (rawLessonDate ? rawLessonDate.slice(0, 10) : null);

  if (scheduleSlotId) {
    const matchedById = slots.find(
      (s) => s.id === scheduleSlotId || scheduleSlotId.includes(s.id)
    );
    if (matchedById) {
      return {
        jsTargetDay: convertVnDayToJsUtcDay(Number(matchedById.dayOfWeek)),
        timeText: `${matchedById.startTime} - ${matchedById.endTime}`,
        startFromDate: effectiveStartDate,
        isMatched: true,
      };
    }
  }

  if (effectiveStartDate) {
    const d = new Date(`${effectiveStartDate}T00:00:00Z`);
    const jsDayFromDate = !isNaN(d.getTime()) ? d.getUTCDay() : null;

    const matchedByDayAndTime = slots.find((s) => {
      const slotTime = `${s.startTime} - ${s.endTime}`;
      const slotJsDay = convertVnDayToJsUtcDay(Number(s.dayOfWeek));
      return slotTime === cleanTime && (jsDayFromDate === null || slotJsDay === jsDayFromDate);
    });

    if (matchedByDayAndTime) {
      return {
        jsTargetDay: convertVnDayToJsUtcDay(Number(matchedByDayAndTime.dayOfWeek)),
        timeText: `${matchedByDayAndTime.startTime} - ${matchedByDayAndTime.endTime}`,
        startFromDate: effectiveStartDate,
        isMatched: true,
      };
    }

    if (jsDayFromDate !== null) {
      return {
        jsTargetDay: jsDayFromDate,
        timeText: cleanTime || 'Chưa xác định khung giờ',
        startFromDate: effectiveStartDate,
        isMatched: false,
      };
    }
  }

  if (cleanTime) {
    const matchedByTime = slots.find((s) => `${s.startTime} - ${s.endTime}` === cleanTime);
    if (matchedByTime) {
      return {
        jsTargetDay: convertVnDayToJsUtcDay(Number(matchedByTime.dayOfWeek)),
        timeText: `${matchedByTime.startTime} - ${matchedByTime.endTime}`,
        startFromDate: effectiveStartDate,
        isMatched: true,
      };
    }
  }

  return {
    jsTargetDay: -1,
    timeText: cleanTime || 'Chưa xác định khung giờ',
    startFromDate: effectiveStartDate,
    isMatched: false,
  };
}

function resolveMultipleSchedulesFromBooking(
  schedulesData: TutorScheduleSlot[] | null,
  rawScheduleSlotId: string | null,
  rawLessonDate: string | null
): { rules: ResolvedScheduleRule[]; hasAnyMismatch: boolean } {
  const slots = Array.isArray(schedulesData) ? schedulesData : [];
  const rawItems = (rawScheduleSlotId || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawItems.length === 0) {
    const fallback = resolveScheduleFromTutorProfile(slots, null, rawLessonDate);
    return { rules: [fallback], hasAnyMismatch: !fallback.isMatched };
  }

  const rules = rawItems.map((singleItem) =>
    resolveScheduleFromTutorProfile(slots, singleItem, rawLessonDate)
  );

  return {
    rules,
    hasAnyMismatch: rules.some((r) => !r.isMatched),
  };
}

export async function getOrGenerateLessons(
  bookingId: string,
  month: number,
  year: number
) {
  const { user, supabase } = await requireTutorRole();

  try {
   
    if (!user) return { success: false, error: 'Chưa đăng nhập' };

    const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: booking, error: bookingErr } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return { success: false, error: 'Không tìm thấy thông tin đăng ký' };
    }

    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('schedules_data')
      .eq('user_id', user.id)
      .single();

    const { rules, hasAnyMismatch } = resolveMultipleSchedulesFromBooking(
      (tutorProfile?.schedules_data as TutorScheduleSlot[]) || [],
      booking.schedule_slot_id,
      booking.lesson_date
    );

    const { data: existingLessons, error: fetchErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('booking_id', bookingId)
      .gte('lesson_date', startDateStr)
      .lte('lesson_date', endDateStr)
      .order('lesson_date', { ascending: true });

    if (fetchErr) return { success: false, error: fetchErr.message };

    if (existingLessons && existingLessons.length > 0) {
      const validDaysSet = new Set(rules.map((r) => r.jsTargetDay));

      const hasCorruptedData = existingLessons.some((l) => {
        const d = new Date(`${l.lesson_date}T00:00:00Z`);
        const matchedRule = rules.find((r) => r.jsTargetDay === d.getUTCDay());
        const isWrongDay = !validDaysSet.has(d.getUTCDay());
        const hasRawPipe = l.schedule_text?.includes('|');
        const isBeforeStartDate = matchedRule?.startFromDate
          ? l.lesson_date < matchedRule.startFromDate
          : false;
        return l.status === 'Pending' && !l.is_paid && (isWrongDay || hasRawPipe || isBeforeStartDate);
      });

      if (!hasCorruptedData) {
        return {
          success: true,
          lessons: existingLessons as LessonSession[],
          isScheduleMismatch: hasAnyMismatch,
        };
      }

      await supabase
        .from('lessons')
        .delete()
        .eq('booking_id', bookingId)
        .eq('status', 'Pending')
        .eq('is_paid', false)
        .gte('lesson_date', startDateStr)
        .lte('lesson_date', endDateStr);
    }

    const generatedLessons = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateUtc = new Date(Date.UTC(year, month - 1, day));
      const currentDayOfWeek = dateUtc.getUTCDay();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const matchedRule = rules.find((r) => r.jsTargetDay === currentDayOfWeek);

      if (matchedRule) {
        if (matchedRule.startFromDate && dateStr < matchedRule.startFromDate) {
          continue;
        }

        generatedLessons.push({
          booking_id: bookingId,
          tutor_id: user.id,
          student_id: booking.student_id,
          subject: booking.subject,
          lesson_date: dateStr,
          schedule_text: matchedRule.timeText,
          status: 'Pending',
          is_paid: false,
        });
      }
    }

    if (generatedLessons.length === 0) {
      return { success: true, lessons: [], isScheduleMismatch: hasAnyMismatch };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('lessons')
      .insert(generatedLessons)
      .select();

    if (insertErr) return { success: false, error: insertErr.message };

    return {
      success: true,
      lessons: inserted as LessonSession[],
      isScheduleMismatch: hasAnyMismatch,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: msg };
  }
}