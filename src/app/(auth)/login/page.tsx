'use client';

import { useState, useActionState, useTransition, } from "react";
import Link from "next/link";
import { useSearchParams} from "next/navigation";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { login, signInWithGoogle } from "@/src/modules/auth/actions/auth";
import { ActionState } from "@/src/types/auth.type";

const initialState: ActionState = {
  success: false,
  errors: undefined,
  fieldErrors: undefined,
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const isSignupSuccess = searchParams.get("signup") === "success";
  const isResetSuccess = searchParams.get("reset") === "success";

  const [state, formAction, isPending] = useActionState(
    login,
    initialState
  );
  

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
       await signInWithGoogle();
    })
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-blue-700">
            <GraduationCap className="size-8 text-blue-600" aria-hidden="true" />
            <span>GiaSuHub</span>
          </Link>
          <p className="text-sm text-slate-500">
            Đăng nhập để tiếp tục hành trình học tập cùng GiaSuHub
          </p>
        </div>

        {isSignupSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <p>Đăng ký tài khoản thành công! Vui lòng đăng nhập.</p>
          </div>
        )}

        {isResetSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <p>Đổi mật khẩu thành công! Vui lòng đăng nhập lại.</p>
          </div>
        )}

        {state?.errors && typeof state.errors === 'string' && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <AlertCircle className="size-4 shrink-0" />
            <p>{state.errors}</p>
          </div>
        )}

        <form action={formAction} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mật khẩu
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
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
            <span>{isPending ? "Đang xử lý..." : "Đăng nhập"}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute">hoặc</span>
          </div>

          <form action={handleGoogleSignIn}>
            <button
              type="submit"
              disabled={isGooglePending}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGooglePending ? "Đang xử lý..." : "Tiếp tục với Google"}</span>
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-slate-600 pt-2 border-t border-slate-100">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}