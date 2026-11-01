import { z } from 'zod'

export const createReviewSchema = z.object({
  tutorId: z.string().uuid({ message: 'Mã định danh Gia sư không hợp lệ' }),
  rating: z.coerce
    .number({ message: 'Vui lòng chọn số sao đánh giá' })
    .min(1, { message: 'Đánh giá tối thiểu là 1 sao' })
    .max(5, { message: 'Đánh giá tối đa là 5 sao' }),
  comment: z
    .string()
    .max(1000, { message: 'Nội dung bình luận không được vượt quá 1000 ký tự' })
    .optional()
    .default('')
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
