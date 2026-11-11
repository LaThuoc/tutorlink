import z from "zod"

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
const dayOfWeekSchema = z
  .number()
  .int()
  .min(2, 'Ngày trong tuần không hợp lệ')
  .max(8, 'Ngày trong tuần không hợp lệ');

const timeSchema = z.string().regex(TIME_REGEX, 'Giờ không hợp lệ (định dạng HH:MM)');
export const addScheduleSlotsSchema = z
  .object({
    days: z.array(dayOfWeekSchema).min(1, 'Vui lòng chọn ít nhất 1 ngày trong tuần'),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((d) => toMinutes(d.startTime) < toMinutes(d.endTime), {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
  })
  .refine((d) => toMinutes(d.endTime) - toMinutes(d.startTime) >= 30, {
    message: 'Mỗi khung giờ tối thiểu 30 phút',
    path: ['endTime'],
  });
 

export const scheduleSlotSchema = z.object({
  id: z.string().min(1),
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  isAvailable: z.boolean(),
}).refine((s) => toMinutes(s.startTime) < toMinutes(s.endTime), {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',})