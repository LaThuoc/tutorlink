import { z } from "zod";
export const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên đầy đủ")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  email: z
    .string()
    .trim()
    .email("Định dạng email không hợp lệ")
    .max(200, "Email không được vượt quá 200 ký tự"),
  subject: z
    .string()
    .trim()
    .min(3, "Chủ đề phải có ít nhất 3 ký tự")
    .max(150, "Chủ đề không được vượt quá 150 ký tự"),
  message: z
    .string()
    .trim()
    .min(10, "Nội dung lời nhắn phải có ít nhất 10 ký tự")
    .max(2000, "Nội dung lời nhắn không vượt quá 2000 ký tự"),
});

export type Field = keyof z.infer<typeof ContactSchema>;
