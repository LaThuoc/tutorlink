'use client';

import { useActionState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgetPassword } from "@/src/modules/auth/actions/auth";
import { ActionState } from "@/src/types/auth.type";

const initialState: ActionState = {
  success: false,
  errors: undefined,
  fieldErrors: undefined,
  message: undefined,
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgetPassword as unknown as (state: ActionState | null, formData: FormData) => Promise<ActionState>,
    initialState
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-blue-700">
            <GraduationCap className="size-8 text-blue-600" aria-hidden="true" />
            <span>GiaSuHub</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Quên mật khẩu?</h1>
          <p className="text-sm text-slate-500">
            Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG */}
        {state?.success && state?.message && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed">{state.message}</p>
          </div>
        )}

        {/* HIỂN THỊ THÔNG BÁO LỖI TỔNG THỂ */}
        {state?.errors && typeof state.errors === 'string' && !state.success && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <p>{state.errors}</p>
          </div>
        )}

        <form action={formAction} noValidate className="space-y-4">
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nhapemail@example.com"
                className={`w-full h-12 rounded-xl border pl-11 pr-4 text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                  state?.fieldErrors?.email
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20"
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>
            {state?.fieldErrors?.email && (
              <p className="text-xs font-medium text-rose-600 pl-1">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isPending ? "Đang gửi yêu cầu..." : "Gửi liên kết khôi phục"}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline"
          >
            <ArrowLeft className="size-4" />
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>

      </div>
    </div>
  );
}