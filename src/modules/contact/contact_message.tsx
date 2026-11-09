'use server'

import { Field } from "@/src/validations/contact.schema";
import { createClient } from "@/src/lib/supabase/server";
import { ContactSchema } from "@/src/validations/contact.schema";
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

  const parsed = ContactSchema.safeParse(values);
  if (!parsed.success) {
    return { 
      fieldErrors: parsed.error.flatten().fieldErrors, 
      values 
    };
  }

  try {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser()

    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      user_id: user?.id || null,
      status: "pending"
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


