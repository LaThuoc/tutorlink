import Link from "next/link";
import { ChevronDown, Mail } from "lucide-react";

export type FaqItem = { q: string; a: string };

const DEFAULT_ITEMS: FaqItem[] = [
  { q: "Đăng ký tài khoản có mất phí không?", a: "Học viên đăng ký và tìm gia sư miễn phí. Học phí do học viên và gia sư tự thỏa thuận." },
  { q: "Làm sao biết gia sư đáng tin cậy?", a: "Mỗi hồ sơ gia sư được quản trị viên duyệt trước khi hiển thị, kèm đánh giá thật từ học viên đã học." },
  { q: "Tôi có thể học online không?", a: "Có. Mỗi gia sư ghi rõ hình thức dạy: trực tuyến, tại nhà hoặc cả hai." },
  { q: "Tôi muốn đổi gia sư thì sao?", a: "Bạn có thể gửi yêu cầu mới tới gia sư khác bất cứ lúc nào, không bị ràng buộc." },
];

type FaqProps = {
  title?: string;
  description?: string;
  items?: FaqItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function Faq({
  title = "Câu hỏi thường gặp",
  description = "Chưa thấy câu trả lời bạn cần? Đội ngũ hỗ trợ luôn sẵn sàng.",
  items = DEFAULT_ITEMS,
  ctaLabel = "Liên hệ hỗ trợ",
  ctaHref = "/about#lien-he",
}: FaqProps) {
  return (
    <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-24 items-start gap-12 px-4 pt-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:px-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-[44px]">{title}</h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">{description}</p>
        <Link 
          href={ctaHref} 
          className="mt-7 inline-flex h-[52px] items-center gap-2.5 rounded-2xl bg-blue-600 px-7 font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
        >
          <Mail className="size-[18px]" aria-hidden="true" /> {ctaLabel}
        </Link>
      </div>

      <div className="space-y-3">
        {items.map(({ q, a }, i) => (
          <details 
            key={`${q}-${i}`} 
            open={i === 0} 
            className="group rounded-[20px] bg-blue-50/60 transition-colors hover:bg-blue-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[17px] font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
              <span>{q}</span>
              <ChevronDown className="size-5 shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="px-6 pb-5 leading-relaxed text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}