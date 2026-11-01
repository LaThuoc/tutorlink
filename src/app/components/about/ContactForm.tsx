"use client";

import { useActionState } from "react";
import { CheckCircle2, Mail, Send, RotateCcw } from "lucide-react";
import { sendContact, type ContactState } from "@/src/validations/contact.schema";

const initial: ContactState = {};

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm transition-all duration-200 outline-none placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/10 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus-visible:ring-rose-500/10";

function Field({
  id, label, error, children,
}: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <div 
        role="status" 
        className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-gradient-to-b from-blue-50/80 to-indigo-50/40 p-10 text-center border border-blue-100 shadow-xl shadow-blue-900/5 min-h-[380px]"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200/50">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">Đã gửi tin nhắn thành công!</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            Cảm ơn bạn đã liên hệ với GiaSuHub. Đội ngũ hỗ trợ sẽ phản hồi qua email của bạn trong thời gian sớm nhất.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 active:scale-95"
        >
          <RotateCcw className="size-4" /> Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  return (
    <form 
      action={action} 
      noValidate 
      className="flex flex-col gap-5 rounded-[32px] bg-blue-50/50 p-6 sm:p-9 border border-blue-100/80 shadow-xl shadow-blue-900/5 relative overflow-hidden"
    >
      {/* Decorative ambient background */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-blue-600/5 blur-2xl pointer-events-none" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Họ và tên" error={fe.name?.[0]}>
          <input 
            id="name" 
            name="name" 
            type="text" 
            autoComplete="name" 
            placeholder="Nguyễn Văn A" 
            defaultValue={v.name}
            aria-invalid={!!fe.name} 
            aria-describedby={fe.name ? "name-error" : undefined} 
            className={inputStyle} 
          />
        </Field>
        
        <Field id="email" label="Email liên hệ" error={fe.email?.[0]}>
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            placeholder="email@example.com" 
            defaultValue={v.email}
            aria-invalid={!!fe.email} 
            aria-describedby={fe.email ? "email-error" : undefined} 
            className={inputStyle} 
          />
        </Field>
      </div>

      <Field id="subject" label="Chủ đề cần hỗ trợ" error={fe.subject?.[0]}>
        <input 
          id="subject" 
          name="subject" 
          type="text" 
          placeholder="Ví dụ: Cần tư vấn tìm gia sư Lớp 12" 
          defaultValue={v.subject}
          aria-invalid={!!fe.subject} 
          aria-describedby={fe.subject ? "subject-error" : undefined} 
          className={inputStyle} 
        />
      </Field>

      <Field id="message" label="Nội dung chi tiết" error={fe.message?.[0]}>
        <textarea 
          id="message" 
          name="message" 
          rows={4} 
          placeholder="Nhập nội dung bạn muốn gửi tới đội ngũ GiaSuHub..." 
          defaultValue={v.message}
          aria-invalid={!!fe.message} 
          aria-describedby={fe.message ? "message-error" : undefined} 
          className={`${inputStyle} resize-y min-h-[120px]`} 
        />
      </Field>

      {/* Ô bẫy bot: ẩn khỏi người dùng và trình đọc màn hình */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website <input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {state.error && (
        <div role="alert" className="rounded-xl bg-rose-50 p-3.5 border border-rose-200/80 text-xs font-semibold text-rose-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2.5 self-start rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Đang gửi...</span>
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            <span>Gửi tin nhắn</span>
          </>
        )}
      </button>
    </form>
  );
}