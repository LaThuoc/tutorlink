import { z } from 'zod'

export const experienceItemSchema = z.object({
  id: z.string(),
  period: z.string().min(1,'Thời gian không được để trống'),
  role: z.string().min(1,'Ví trí/ chức danh không được để trống'),
  company: z.string().min(1,'Nơi làm việc không được để trống'),
  description: z.string().optional().default('')
})

export const educationItemSchema = z.object({
  id: z.string(),
  period: z.string().min(1, 'Thời gian không được để trống'),
  schoolName: z.string().min(1, 'Tên trường không được để trống'),
  major: z.string().min(1, 'Chuyên ngành/Khối học không được để trống'),
  gpa: z.string().optional().default(''),
  status: z.string().optional().default(''),
  description: z.string().optional().default('')
})

export const certificateItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Tên bằng cấp/chứng chỉ không được để trống'),
  issuedBy: z.string().min(1, 'Nơi cấp không được để trống'),
  detail: z.string().optional().default(''),
  issuedYear: z.string().min(1, 'Năm cấp không được để trống'),
  imageUrl: z.string().min(1, 'Ảnh bằng cấp không được để trống'),
  isVerified: z.boolean().optional().default(false)
})


export const scheduleSlotSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().min(2, 'Thứ không hợp lệ').max(8, 'Thứ không hợp lệ'),
  startTime: z.string().min(1, 'Giờ bắt đầu không được để trống'),
  endTime: z.string().min(1, 'Giờ kết thúc không được để trống'),
  isAvailable: z.boolean().optional().default(true)
})

export const updateTutorProfileSchema = z.object({
  avatarUrl: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').optional().or(z.literal('')),
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
  gender: z.string().min(1,'Vui lòng chọn giới tính'),
  dateOfBirth: z.string().min(1,'Vui lòng chọn ngày sinh'),
  phone: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  address: z.string().optional(),
  hometown: z.string().optional(),
  
  bio: z.string().max(1000, 'Tiểu sử tối đa 1000 ký tự').optional(),
  quote: z.string().max(300, 'Trích dẫn tối đa 300 ký tự').optional(),
  education: z.string().min(2, 'Vui lòng nhập trình độ học vấn'),
  subjects: z.array(z.string()).min(1, 'Vui lòng thêm ít nhất 1 môn học'), 
  grades: z.array(z.string()).min(1,'Vui lòng chọn ít nhất 1 lớp/khối lớp'),
  hourlyRate: z.coerce
    .number({ error: 'Học phí phải là số' })
    .min(10000, 'Học phí tối thiểu là 10.000 VNĐ')
    .max(5000000, 'Học phí tối đa là 5.000.000 VNĐ'), 
  teachingAreas: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  experiences: z.array(experienceItemSchema).optional().default([]),
  educations: z.array(educationItemSchema).optional().default([]),
  certificates: z.array(certificateItemSchema).optional().default([]),
  schedulesData: z.array(scheduleSlotSchema).optional().default([]),
  schedules: z.array(z.string()).optional().default([]),
  schoolName: z.string().min(1, 'Vui lòng nhập tên trường/đơn vị công tác'),
  teachingModes: z.array(z.string()).min(1, 'Chọn ít nhất 1 hình thức dạy')
})