'use client';

import Link from "next/link";
import { ChevronDown, Mail } from "lucide-react";

// Danh sách các câu hỏi thường gặp
const FAQS = [
  {
    q: "Đăng ký tài khoản có mất phí không?",
    a: "Học viên đăng ký và tìm gia sư hoàn toàn miễn phí. Mức học phí sẽ do học viên và gia sư tự do thỏa thuận dựa trên lộ trình học.",
  },
  {
    q: "Làm sao biết gia sư đáng tin cậy?",
    a: "Mỗi hồ sơ gia sư đều được đội ngũ quản trị viên xác minh thông tin, bằng cấp trước khi hiển thị, đi kèm các đánh giá chân thật từ học viên đã học.",
  },
  {
    q: "Tôi có thể học online không?",
    a: "Có. Mỗi gia sư đều ghi rõ hình thức giảng dạy trên hồ sơ: học trực tuyến qua video call, dạy tại nhà hoặc linh hoạt cả hai.",
  },
  {
    q: "Tôi muốn đổi gia sư thì sao?",
    a: "Bạn có thể chủ động gửi yêu cầu kết nối tới gia sư khác bất cứ lúc nào nếu thấy không phù hợp, hoàn toàn tự do và không chịu ràng buộc.",
  },
] as const;

export function Questions() {
  return (
    /* LỚP VÙNG (Section Level): Bleed Background tràn 100% hai bên lề màn hình */
    <section id="faq" className="w-full bg-white py-14 sm:py-20 scroll-mt-20">
      
      {/* KHUNG NỘI DUNG (Constrained Content): Căn lề ngang max-w-[1920px] đồng bộ tuyệt đối */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          
          {/* CỘT TRÁI: TIÊU ĐỀ & NÚT HỖ TRỢ (Chiếm 5 cột trên Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold tracking-wide text-blue-600 border border-blue-100/80 mb-4">
              Giải đáp thắc mắc
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] leading-tight">
              Câu hỏi thường gặp
            </h2>

            <p className="mt-4 max-w-md text-base sm:text-lg leading-relaxed text-slate-600">
              Chưa thấy câu trả lời bạn cần? Đội ngũ hỗ trợ của GiaSuHub luôn sẵn sàng giải đáp 24/7.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex h-[52px] items-center gap-2.5 rounded-2xl bg-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95"
            >
              <Mail className="size-4" aria-hidden="true" />
              <span>Liên hệ hỗ trợ</span>
            </Link>
          </div>

          {/* CỘT PHẢI: DANH SÁCH CHI TIẾT CÂU HỎI (Chiếm 7 cột trên Desktop) */}
          <div className="space-y-4 lg:col-span-7">
            {FAQS.map(({ q, a }, i) => (
              <details
                key={q}
                open={i === 0}
                className="group rounded-[22px] bg-slate-50/80 border border-slate-200/60 transition-all duration-300 open:bg-white open:shadow-xl open:shadow-slate-200/50 open:border-blue-100 open:ring-1 open:ring-blue-100"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base sm:text-[17px] font-bold text-slate-900 transition-colors group-hover:text-blue-600 [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white group-open:bg-blue-50 text-slate-500 group-open:text-blue-600 transition-transform duration-300 group-open:rotate-180 border border-slate-200/60 group-open:border-blue-200">
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </span>
                </summary>

                <p className="px-6 pb-6 text-sm sm:text-base leading-relaxed text-slate-600 border-t border-transparent group-open:border-slate-100 pt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}