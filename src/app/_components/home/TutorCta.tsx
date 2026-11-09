'use client';

import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const BENEFITS = [
  "Hồ sơ được quản trị viên duyệt và gắn huy hiệu xác minh",
  "Tự đặt học phí, môn dạy và hình thức dạy linh hoạt",
  "Nhận và quản lý yêu cầu học ngay trên bảng điều khiển",
] as const;

export function TutorCta() {
  return (
    /* LỚP NỀN FULL-WIDTH (Bleed Background) */
    <section className="w-full bg-white py-12 sm:py-16">
      
      {/* KHUNG NỘI DUNG CHUẨN MAX-WIDTH 1920PX */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        {/* BANNER MAIN CONTAINER */}
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#0B132B] px-6 pt-10 text-white sm:px-12 sm:pt-14 lg:px-16 lg:pt-16 shadow-2xl shadow-blue-900/20">
          
          {/* Đốm mờ nghệ thuật làm phông nền (Background Lighting) */}
          <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-10 size-96 rounded-full bg-cyan-400/20 blur-3xl" />

          {/* LƯỚI GRID 2 CỘT CÂN BẰNG 6 - 6 */}
          <div className="relative z-10 grid items-end gap-8 lg:grid-cols-12">
            
            {/* CỘT TRÁI: NỘI DUNG (Chiếm 6 cột)[cite: 1] */}
            <div className="pb-10 lg:col-span-6 lg:pb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-200 backdrop-blur-md mb-5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Dành cho Gia Sư & Giảng Viên
              </div>

              <h2 className="text-3xl font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-[40px]">
                Bạn muốn chia sẻ kiến thức <br className="hidden sm:block" />
                và nâng cao thu nhập?
              </h2>

              {/* Danh sách lợi ích[cite: 1] */}
              <ul className="mb-10 mt-7 space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/30">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-sm sm:text-base font-medium text-blue-50/95 leading-snug">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Cụm nút bấm hành động[cite: 1] */}
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="/dashboard/tutor/onboarding" 
                  className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-white px-8 font-bold text-blue-900 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Đăng ký làm gia sư</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                
                <Link 
                  href="/guide/profile" 
                  className="inline-flex h-[54px] items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-7 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/40 active:scale-95"
                >
                  Xem hướng dẫn
                </Link>
              </div>
            </div>

            {/* CỘT PHẢI: ẢNH NHÓM SINH VIÊN RỘNG CÂN ĐỒI & SÁT ĐÁY (Chiếm 6 cột)[cite: 1] */}
            <div className="relative lg:col-span-6 flex justify-center lg:justify-end items-end h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
              
              {/* Quầng sáng tập trung chiếu sau lưng nhóm người[cite: 1, 2] */}
              <div className="pointer-events-none absolute bottom-0 right-10 size-80 rounded-full bg-blue-400/20 blur-3xl" />

              {/* Khung chứa ảnh mở rộng chiều ngang tối đa[cite: 1] */}
              <div className="relative w-full max-w-[560px] h-[260px] sm:h-[340px] lg:h-[380px] xl:h-[420px]">
                <Image
                  src="/images/stu/stu5.png" // File PNG đã tách nền nhóm sinh viên[cite: 1]
                  alt="Đội ngũ gia sư chất lượng cao"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:scale-[1.01]"
                  priority
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}