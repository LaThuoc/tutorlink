import { z } from 'zod'
export const signupSchema = z.object({
  email: z.string({ error: 'Vui lòng nhập Email' }).trim().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
  password: z.string({ error: 'Vui lòng nhập mật khẩu' }).min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  fullName: z.string({ error: 'Vui lòng nhập họ và tên' }).trim().min(2, 'Họ và tên quá ngắn'),
  confirmPassword: z.string({error: 'Vui lòng xác nhận mật khẩu'}).min(1,'Vui lòng nhập lại mật khẩu'),
  role: z.enum(['student', 'tutor'], { 
    error: 'Vui lòng chọn vai trò'
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string({ error: 'Vui lòng nhập Email' }).trim().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
  password: z.string({ error: 'Vui lòng nhập mật khẩu' }).min(1, 'Vui lòng nhập mật khẩu'),
})

export type SignUpInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer< typeof loginSchema>