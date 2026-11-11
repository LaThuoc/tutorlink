'use server'

import { createClient } from "@/src/lib/supabase/server"
import { requireTutorRole } from "@/src/lib/auth/auth-guard"
import { revalidatePath } from "next/cache"
import { ScheduleSlot, TutorActionState } from "../../types/tutor.type"
import { ScheduleActionResult } from "@/src/types/schedule.type"
import { addScheduleSlotsSchema, scheduleSlotSchema, toMinutes } from "@/src/validations/schedule"
import z from "zod"



type TutorCtx = Awaited<ReturnType<typeof requireTutorRole>>
 
const DAY_LABEL: Record<number, string> = {
    2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ nhật',
}
 
// ---------- Helpers (không export) ----------
function parseSlots(raw: unknown): ScheduleSlot[] {
    let value = raw
    if (typeof value === 'string') {
        try { value = JSON.parse(value) } catch { return [] }
    }
    return Array.isArray(value) ? (value as ScheduleSlot[]) : []
}
 
function sortSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
    return [...slots].sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek || toMinutes(a.startTime) - toMinutes(b.startTime)
    )
}
 
function isOverlap(a: ScheduleSlot, b: Pick<ScheduleSlot, 'dayOfWeek' | 'startTime' | 'endTime'>): boolean {
    return (
        a.dayOfWeek === b.dayOfWeek &&
        toMinutes(a.startTime) < toMinutes(b.endTime) &&
        toMinutes(b.startTime) < toMinutes(a.endTime)
    )
}
 
const BOOKED_ID_REGEX = /(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2}) - (\d{2}:\d{2})/g
 
function dayOfWeekFromIso(iso: string): number {
    const js = new Date(`${iso}T00:00:00`).getDay() // 0 = Chủ nhật
    return js === 0 ? 8 : js + 1
}
 
/**
 * Tìm các khung giờ đang có yêu cầu học còn hiệu lực (Pending / Accepted) trong tương lai.
 * schedule_slot_id của học viên có dạng "YYYY-MM-DD|HH:MM - HH:MM" -> quy ra thứ trong tuần để đối chiếu.
 */
async function getSlotsWithActiveBooking(ctx: TutorCtx, slots: ScheduleSlot[]): Promise<Set<string>> {
    const busy = new Set<string>()
    const { data } = await ctx.supabase
        .from('booking_requests')
        .select('schedule_slot_id')
        .eq('tutor_id', ctx.user.id)
        .in('status', ['Pending', 'Accepted'])
 
    const todayIso = new Date().toISOString().slice(0, 10)
    for (const row of data || []) {
        const text = row.schedule_slot_id ?? ''
        for (const m of text.matchAll(BOOKED_ID_REGEX)) {
            const [, iso, start, end] = m
            if (iso < todayIso) continue
            const dow = dayOfWeekFromIso(iso)
            for (const s of slots) {
                if (s.dayOfWeek === dow && s.startTime === start && s.endTime === end) busy.add(s.id)
            }
        }
    }
    return busy
}
 
async function loadSlots(ctx: TutorCtx): Promise<ScheduleSlot[] | null> {
    const { data, error } = await ctx.supabase
        .from('tutor_profiles')
        .select('schedules_data')
        .eq('user_id', ctx.user.id)
        .maybeSingle()
    if (error || !data) return null
    return parseSlots(data.schedules_data)
}
 
async function saveSlots(ctx: TutorCtx, slots: ScheduleSlot[]): Promise<string | null> {
    const { data, error } = await ctx.supabase
        .from('tutor_profiles')
        .update({
            schedules_data: slots as unknown,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', ctx.user.id)
        .select('user_id')
 
    if (error) return `Không thể lưu lịch: ${error.message}`
    if (!data || data.length === 0) {
        return 'Không thể lưu lịch (không có dòng nào được cập nhật - hãy kiểm tra hồ sơ gia sư và policy UPDATE của bảng tutor_profiles).'
    }
    return null
}
 
function revalidateSchedulePaths(userId: string) {
    revalidatePath('/dashboard/schedule')
    revalidatePath('/dashboard/tutor')
    revalidatePath(`/tutors/${userId}`)
}
 
async function withTutor(fn: (ctx: TutorCtx) => Promise<ScheduleActionResult>): Promise<ScheduleActionResult> {
    try {
        const ctx = await requireTutorRole()
        return await fn(ctx)
    } catch (err: unknown) {
        return { success: false, errors: err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định' }
    }
}
 
// ---------- Server actions ----------
 
/** Lấy toàn bộ khung giờ dạy của gia sư đang đăng nhập */
export async function getMySchedule(): Promise<ScheduleActionResult> {
    return withTutor(async (ctx) => {
        const slots = await loadSlots(ctx)
        if (slots === null) return { success: false, errors: 'Không tìm thấy hồ sơ gia sư' }
        return { success: true, slots: sortSlots(slots) }
    })
}
 
/** Thêm khung giờ mới: chọn nhiều thứ cùng lúc + 1 khoảng giờ -> tạo mỗi thứ một khung giờ lặp lại hằng tuần */
export async function addScheduleSlots(input: {
    days: number[]
    startTime: string
    endTime: string
}): Promise<ScheduleActionResult> {
    return withTutor(async (ctx) => {
        const parsed = addScheduleSlotsSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, errors: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' }
        }
        const { days, startTime, endTime } = parsed.data
 
        const current = await loadSlots(ctx)
        if (current === null) return { success: false, errors: 'Không tìm thấy hồ sơ gia sư' }
 
        const added: ScheduleSlot[] = []
        const skipped: string[] = []
 
        for (const day of Array.from(new Set(days))) {
            const candidate = { dayOfWeek: day, startTime, endTime }
            const clash = [...current, ...added].find((s) => isOverlap(s, candidate))
            if (clash) {
                skipped.push(`${DAY_LABEL[day]} (trùng ${clash.startTime} - ${clash.endTime})`)
                continue
            }
            added.push({
                id: crypto.randomUUID(),
                dayOfWeek: day,
                startTime,
                endTime,
                isAvailable: true,
            })
        }
 
        if (added.length === 0) {
            return { success: false, errors: `Khung giờ bị trùng với lịch đã có: ${skipped.join(', ')}` }
        }
 
        const next = sortSlots([...current, ...added])
        const saveError = await saveSlots(ctx, next)
        if (saveError) return { success: false, errors: saveError }
 
        revalidateSchedulePaths(ctx.user.id)
        return {
            success: true,
            slots: next,
            message:
                skipped.length > 0
                    ? `Đã thêm ${added.length} khung giờ. Bỏ qua ${skipped.length} ngày bị trùng: ${skipped.join(', ')}`
                    : `Đã thêm ${added.length} khung giờ ${startTime} - ${endTime}`,
        }
    })
}


























export async function UpdateTutorSchedule(slots: ScheduleSlot[]): Promise<ScheduleActionResult> {
    return withTutor(async (ctx) => {
        const parsed = z.array(scheduleSlotSchema).safeParse(slots)
        if (!parsed.success) {
            return { success: false, errors: parsed.error.issues[0]?.message || 'Dữ liệu lịch không hợp lệ' }
        }
        const valid = parsed.data as ScheduleSlot[]
 
        for (let i = 0; i < valid.length; i++) {
            for (let j = i + 1; j < valid.length; j++) {
                if (isOverlap(valid[i], valid[j])) {
                    return {
                        success: false,
                        errors: `Hai khung giờ bị trùng nhau vào ${DAY_LABEL[valid[i].dayOfWeek]}`,
                    }
                }
            }
        }
 
        const next = sortSlots(valid)
        const saveError = await saveSlots(ctx, next)
        if (saveError) return { success: false, errors: saveError }
 
        revalidateSchedulePaths(ctx.user.id)
        return { success: true, slots: next, message: 'Đã lưu lịch dạy' }
    })
}




export async function toggleScheduleSlotStatus(slotId: string, isAvailable: boolean): Promise<ScheduleActionResult> {
    return withTutor(async (ctx) => {
        const current = await loadSlots(ctx)
        if (current === null) return { success: false, errors: 'Không tìm thấy hồ sơ gia sư' }
 
        const target = current.find((s) => s.id === slotId)
        if (!target) return { success: false, errors: 'Không tìm thấy khung giờ' }
 
        if (isAvailable) {
            const busy = await getSlotsWithActiveBooking(ctx, current)
            if (busy.has(slotId)) {
                return {
                    success: false,
                    errors: 'Khung giờ này đang có yêu cầu học (chờ duyệt hoặc đã chấp nhận) nên chưa thể mở lại.',
                }
            }
        }
 
        const next = sortSlots(current.map((s) => (s.id === slotId ? { ...s, isAvailable } : s)))
        const saveError = await saveSlots(ctx, next)
        if (saveError) return { success: false, errors: saveError }
 
        revalidateSchedulePaths(ctx.user.id)
        return {
            success: true,
            slots: next,
            message: isAvailable ? 'Đã mở lại khung giờ cho học viên đăng ký' : 'Đã đóng khung giờ',
        }
    })
}
 
/** Xóa một hoặc nhiều khung giờ */
export async function deleteScheduleSlot(slotIds: string[]): Promise<ScheduleActionResult> {
    return withTutor(async (ctx) => {
        if (!slotIds || slotIds.length === 0) {
            return { success: false, errors: 'Vui lòng chọn ít nhất 1 khung giờ để xóa' }
        }
 
        const current = await loadSlots(ctx)
        if (current === null) return { success: false, errors: 'Không tìm thấy hồ sơ gia sư' }
 
        const busy = await getSlotsWithActiveBooking(ctx, current)
        const blocked = current.filter((s) => slotIds.includes(s.id) && busy.has(s.id))
        if (blocked.length > 0) {
            const text = blocked.map((s) => `${DAY_LABEL[s.dayOfWeek]} ${s.startTime} - ${s.endTime}`).join(', ')
            return {
                success: false,
                errors: `Không thể xóa vì đang có yêu cầu học: ${text}. Hãy xử lý yêu cầu đó trước.`,
            }
        }
 
        const next = current.filter((s) => !slotIds.includes(s.id))
        if (next.length === current.length) return { success: false, errors: 'Không tìm thấy khung giờ cần xóa' }
 
        const saveError = await saveSlots(ctx, next)
        if (saveError) return { success: false, errors: saveError }
 
        revalidateSchedulePaths(ctx.user.id)
        return { success: true, slots: sortSlots(next), message: 'Đã xóa khung giờ' }
    })
}