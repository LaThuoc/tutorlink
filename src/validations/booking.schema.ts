import {z} from 'zod'

export const createBookingRequestSchema = z.object({
    tutorId: z.string().uuid('ID gia sư không hợp lệ '),
    scheduleSlotIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một khung giờ"),
    subject: z.string().min(1, 'Vui lòng chọn một môn học'),
    contactPhone: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại liên hệ không hợp lệ'),
  message: z.string().max(500, 'Lời nhắn tối đa 500 ký tự').optional().or(z.literal('')),
})

export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>
