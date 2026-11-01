"use server";

import { z } from "zod";
import { createClient } from "../lib/supabase/server";

const schema = z.object({
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

type Field = keyof z.infer<typeof schema>;

export type ContactState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
  values?: Partial<Record<Field, string>>;
};

export async function sendContact(
  _prev: ContactState, 
  formData: FormData
): Promise<ContactState> {
  
  const honeypot = formData.get("website");
  if (honeypot && String(honeypot).trim() !== "") {
    return { ok: true };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { 
      fieldErrors: parsed.error.flatten().fieldErrors, 
      values 
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (error) {
      console.error("[sendContact Error]:", error.message);
      return { 
        error: "Gửi tin nhắn thất bại. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.", 
        values 
      };
    }

    return { ok: true };
  } catch (err) {
    console.error("[sendContact Unexpected Error]:", err);
    return { 
      error: "Đã xảy ra lỗi hệ thống bất ngờ. Vui lòng thử lại sau ít phút.", 
      values 
    };
  }
}