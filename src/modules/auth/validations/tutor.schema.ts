import { z } from 'zod'

export const subjectDetailItemSchema = z.object({
  subject: z.string().min(1, 'Tên môn học không được để trống'),
  gradeRange: z.string().optional(),
  tag: z.string().optional(),
  hourlyRate: z.coerce
    .number({ error: 'Học phí phải là số' })
    .min(10000, 'Học phí tối thiểu là 10.000 VNĐ')
    .max(5000000, 'Học phí tối đa là 5.000.000 VNĐ'),
})

export const updateTutorProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
  phone: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  address: z.string().optional(),
  
  bio: z.string().max(1000, 'Tiểu sử tối đa 1000 ký tự').optional(),
  quote: z.string().max(300, 'Trích dẫn tối đa 300 ký tự').optional(),
  education: z.string().min(2, 'Vui lòng nhập trình độ học vấn'),
  
  subjectDetails: z.array(subjectDetailItemSchema).min(1, 'Thêm ít nhất 1 môn học'),
  teachingAreas: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  certificates: z.array(z.string().url('Đường dẫn ảnh không hợp lệ')).optional().default([]),
  schedules: z.array(z.string()).optional().default([]),
})