'use client';

import { useState, useActionState } from "react";
import Link from "next/link";
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { updatePassword } from "@/src/modules/auth/actions/auth";
import { ActionState } from "@/src/types/auth.type";

const initialState: ActionState = {
  success: false,
  errors: undefined,
  fieldErrors: undefined,
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    updatePassword as unknown as (state: ActionState | null, formData: FormData) => Promise<ActionState>,
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
          <h1 className="text-xl font-bold text-slate-800">Đặt lại mật khẩu</h1>
          <p className="text-sm text-slate-500">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {state?.errors && typeof state.errors === 'string' && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <p>{state.errors}</p>
          </div>
        )}

        <form action={formAction} noValidate className="space-y-4">
          
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full h-12 rounded-xl border pl-11 pr-11 text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                  state?.fieldErrors?.password
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20"
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {state?.fieldErrors?.password && (
              <p className="text-xs font-medium text-rose-600 pl-1">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

      </div>
    </div>
  );
}