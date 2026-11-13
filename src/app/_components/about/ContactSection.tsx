import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { ContactForm } from "./ContactForm";

// TODO: thay bằng thông tin liên hệ thật
const INFO: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
  { icon: Mail, label: "Email hỗ trợ", value: "support@giasuhub.vn", href: "mailto:support@giasuhub.vn" },
  { icon: Phone, label: "Hotline tư vấn", value: "1900 0000", href: "tel:090000000" },
  { icon: MapPin, label: "Địa chỉ văn phòng", value: "Hà Nội, Việt Nam" },
];

export function ContactSection() {
  return (
    <section id="lien-he" className="w-full bg-white py-12 sm:py-16 border-t border-slate-100 scroll-mt-20">
      {/* Khung lề ĐỒNG BỘ 100% với AboutHero, AboutMission, AboutValues */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          
          {/* Cột thông tin liên hệ bên trái */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Liên hệ với chúng tôi</span>
            
            <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]">
              Bạn cần hỗ trợ hoặc muốn hợp tác?
            </h2>
            
            <p className="mt-4 max-w-md text-base sm:text-lg leading-relaxed text-slate-600">
              Gửi tin nhắn cho chúng tôi, đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất có thể.
            </p>

            <ul className="mt-8 space-y-4">
              {INFO.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="group flex items-center gap-4 rounded-2xl bg-slate-50/70 p-4 border border-slate-100 transition-all duration-300 hover:bg-blue-50/50 hover:border-blue-200/80">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    {href ? (
                      <a href={href} className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        {value}
                      </a>
                    ) : (
                      <p className="text-base font-bold text-slate-900">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        <ContactForm />
          
        </div>
      </div>
    </section>
  );
}