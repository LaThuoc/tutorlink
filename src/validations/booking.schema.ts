import {z} from 'zod'

export const createBookingRequestSchema = z.object({
    tutorId: z.string().uuid('ID gia sư không hợp lệ '),
    scheduleSlotIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một khung giờ"),
    subject: z.string().min(1, 'Vui lòng chọn một môn học'),
    contactPhone: z
    .string()
    .trim()
    .min(1, 'Số được điện thoại không được để trống')
    .refine((val) => {
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      return phoneRegex.test(val);
    }, {
      message: 'Số điện thoại liên hệ không hợp lệ',
    }),
  message: z.string().max(500, 'Lời nhắn tối đa 500 ký tự').optional().or(z.literal('')),
})

export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>