import React from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/src/modules/auth/actions/admin';
import { 
  Users, ShieldCheck, Award, ArrowRight, 
  Sparkles, TrendingUp 
} from 'lucide-react';

export const revalidate = 0; 

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 lg:p-10 rounded-3xl text-white shadow-xl shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 size-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 top-0 size-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Bảng điều khiển Trung tâm</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
              Chào mừng trở lại, Administrator!
            </h1>
            <p className="text-blue-100 text-xs lg:text-sm leading-relaxed font-normal">
              Hệ thống hoạt động ổn định. Kiểm duyệt hồ sơ gia sư, quản lý danh sách học viên và xác minh bằng cấp thời gian thực.
            </p>
          </div>
        </div>
      </div>

      {/* 2. LƯỚI THỐNG KÊ (STATS CARDS - 3 CỘT CÂN ĐỐI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* CARD 1: TỔNG GIA SƯ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Gia sư hệ thống
            </span>
            <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalTutors}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="size-3 text-emerald-500" /> Hồ sơ gia sư đăng ký
            </p>
          </div>
        </div>

        {/* CARD 2: TỔNG HỌC VIÊN */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Tổng Học viên
            </span>
            <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Users className="size-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalStudents}</div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Tài khoản học sinh / phụ huynh
            </p>
          </div>
        </div>

        {/* CARD 3: CHỨNG CHỈ CHỜ DUYỆT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Bằng cấp chờ duyệt
            </span>
            <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center">
              <Award className="size-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-black tracking-tight ${stats.pendingCertificates > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.pendingCertificates}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Chứng chỉ mới nộp cần xác minh
            </p>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC THAO TÁC NỔI BẬT (QUICK ACTIONS) */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Thao tác quản trị chính</h3>
            <p className="text-xs text-slate-400">Các truy cập nhanh tới các phân hệ nghiệp vụ chính</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ACTION 1: DUYỆT CHỨNG CHỈ */}
          <Link
            href="/admin/certificates"
            className="group relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-white hover:border-amber-400/80 hover:bg-amber-50/30 transition-all shadow-xs hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center group-hover:scale-110 transition-transform">
                <Award className="size-6" />
              </div>
              <ArrowRight className="size-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Duyệt chứng chỉ gia sư
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kiểm tra hình ảnh bằng cấp, chứng chỉ ngoại ngữ TOEIC/IELTS do gia sư cập nhật.
              </p>
            </div>
          </Link>

          {/* ACTION 2: QUẢN LÝ GIA SƯ */}
          <Link
            href="/admin/tutors"
            className="group relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-white hover:border-indigo-400/80 hover:bg-indigo-50/30 transition-all shadow-xs hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 grid place-items-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="size-6" />
              </div>
              <ArrowRight className="size-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Quản lý tài khoản gia sư
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Xem toàn bộ hồ sơ gia sư, phê duyệt đăng ký lần đầu hoặc xem lịch sử bằng cấp.
              </p>
            </div>
          </Link>

          {/* ACTION 3: QUẢN LÝ HỌC VIÊN */}
          <Link
            href="/admin/students"
            className="group relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-white hover:border-emerald-400/80 hover:bg-emerald-50/30 transition-all shadow-xs hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center group-hover:scale-110 transition-transform">
                <Users className="size-6" />
              </div>
              <ArrowRight className="size-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Quản lý học viên & phụ huynh
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Theo dõi toàn bộ danh sách học sinh và phụ huynh đã đăng ký tài khoản trên hệ thống.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}