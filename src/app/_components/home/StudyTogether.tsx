import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const POINTS = ["Lộ trình học cá nhân hóa", "Học online hoặc offline linh hoạt", "Hồ sơ gia sư được xác minh"];

export function StudyTogether() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      {/* Khung lề đồng bộ max-w-[1920px] */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        {/* Layout Grid: items-stretch giúp 2 cột cao bằng nhau tuyệt đối */}
        <div className="relative grid items-stretch overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-100/90 via-blue-50 to-indigo-100/80 border border-blue-200/50 shadow-sm lg:grid-cols-12">
          
          {/* Cột trái: Nội dung chữ */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:col-span-6 lg:p-14 xl:p-16">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]">
              Học tốt hơn khi có người đồng hành đúng lúc
            </h2>
            
            <p className="mt-4 max-w-lg text-base sm:text-lg leading-relaxed text-slate-600">
              Gia sư theo sát tiến độ, sửa lỗi sai từng buổi và xây lộ trình riêng cho mục tiêu của bạn, dù học tại nhà hay trực tuyến.
            </p>

            <ul className="mb-8 mt-6 space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-800">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div>
              <Link 
                href="/tutors" 
                className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
              >
                Bắt đầu tìm gia sư <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Cột phải: Hình ảnh phủ kín chiều cao & bo góc chuẩn sang phải */}
          <div className="relative min-h-[320px] w-full overflow-hidden sm:min-h-[400px] lg:col-span-6 lg:min-h-full">
            <Image 
              src="/images/stu/group.jpg" 
              alt="Nhóm gia sư GiaSuHub" 
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center rounded-b-[36px] lg:rounded-b-none lg:rounded-tr-[36px] lg:rounded-br-[36px]" 
            />
          </div>

        </div>

      </div>
    </section>
  );
}