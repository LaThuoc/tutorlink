'use client';

import { useState, useActionState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { signup } from "@/src/modules/auth/actions/auth";
import { ActionState } from "@/src/types/auth.type";

const initialState: ActionState = {
  success: false,
  errors: undefined,
  fieldErrors: undefined,
};

export default function RegisterPage() {
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [showPassword, setShowPassword] = useState(false);

  // Hook xử lý Server Action
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        
        {/* LOGO & TIÊU ĐỀ */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-blue-700">
            <GraduationCap className="size-8 text-blue-600" aria-hidden="true" />
            <span>GiaSuHub</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm text-slate-500">
            Bắt đầu trải nghiệm học tập và giảng dạy đỉnh cao
          </p>
        </div>

        {/* CHỌN VAI TRÒ TÀI KHOẢN */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "student"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="size-4" />
            <span>Học viên / Phụ huynh</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("tutor")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "tutor"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="size-4" />
            <span>Đăng ký Gia sư</span>
          </button>
        </div>

        {/* HIỂN THỊ THÔNG BÁO LỖI TỔNG QUÁT */}
        {state?.errors && typeof state.errors === 'string' && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4 shrink-0" />
            <p>{state.errors}</p>
          </div>
        )}

        {/* FORM ĐĂNG KÝ */}
        <form action={formAction} noValidate className="space-y-4">
          <input type="hidden" name="role" value={role} />

          {/* HỌ VÀ TÊN */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full h-12 rounded-xl border pl-11 pr-4 text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                  state?.fieldErrors?.fullName 
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20" 
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>
            {/* Lỗi chi tiết Họ và tên */}
            {state?.fieldErrors?.fullName && (
              <p className="text-xs font-medium text-rose-600 pl-1">
                {state.fieldErrors.fullName[0]}
              </p>
            )}
          </div>

          {/* EMAIL */}
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
            {/* Lỗi chi tiết Email */}
            {state?.fieldErrors?.email && (
              <p className="text-xs font-medium text-rose-600 pl-1">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          {/* MẬT KHẨU */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
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
            {/* Lỗi chi tiết Mật khẩu */}
            {state?.fieldErrors?.password && (
              <p className="text-xs font-medium text-rose-600 pl-1">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* NÚT ĐĂNG KÝ */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isPending ? "Đang xử lý..." : `Tạo tài khoản ${role === "tutor" ? "Gia sư" : ""}`}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        {/* ĐƯỜNG DẪN ĐĂNG NHẬP */}
        <div className="text-center text-sm text-slate-600 pt-2 border-t border-slate-100">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}