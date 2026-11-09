'use client';

import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
} from "lucide-react";

function FacebookIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function ZaloIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor">
      <path d="M24 4C12.95 4 4 12.05 4 22c0 5.4 2.68 10.22 6.95 13.52L9 42l7.15-3.15C18.6 39.55 21.23 40 24 40c11.05 0 20-8.05 20-18S35.05 4 24 4zm-3.5 23.5h-5v-1.8l3.2-4.2h-3v-1.5h4.8v1.8l-3.2 4.2h3.2v1.5zm6.5 0h-1.6v-7.5h1.6v7.5zm5.5 0c-2.2 0-3.8-1.5-3.8-3.75s1.6-3.75 3.8-3.75 3.8 1.5 3.8 3.75-1.6 3.75-3.8 3.75zm0-1.5c1.2 0 2.1-.9 2.1-2.25s-.9-2.25-2.1-2.25-2.1.9-2.1 2.25.9 2.25 2.1 2.25z"/>
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Khám phá",
    items: [
      "Tìm gia sư",
      "Môn học nổi bật",
      "Gia sư tiêu biểu",
      "Cách thức hoạt động",
    ],
  },
  {
    title: "Dành cho gia sư",
    items: [
      "Đăng ký làm gia sư",
      "Hướng dẫn tạo hồ sơ",
      "Quy định & Chính sách",
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      "Câu hỏi thường gặp",
      "Liên hệ hỗ trợ",
      "Điều khoản sử dụng",
      "Chính sách bảo mật",
    ],
  },
];

const SOCIAL_LINKS = [
  { 
    name: "Facebook", 
    icon: FacebookIcon, 
    color: "hover:bg-white hover:text-blue-600" 
  },
  { 
    name: "Instagram", 
    icon: InstagramIcon, 
    color: "hover:bg-pink-600 hover:text-white" 
  },
  { 
    name: "Zalo", 
    icon: ZaloIcon, 
    color: "hover:bg-white hover:text-blue-500" 
  },
  { 
    name: "Discord", 
    icon: MessageSquare, 
    color: "hover:bg-indigo-600 hover:text-white" 
  },
  { 
    name: "Gmail", 
    icon: Mail, 
    color: "hover:bg-rose-600 hover:text-white" 
  },
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 text-white pt-16 pb-10">
      
      <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        <div className="grid grid-cols-1 gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-12 border-b border-white/20">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-white cursor-default">
              <span className="grid size-10 place-items-center rounded-2xl bg-white/15 border border-white/25 shadow-md">
                <GraduationCap className="size-6 text-white" aria-hidden="true" />
              </span>
              <span className="tracking-tight">GiaSuHub</span>
            </div>
            
            <p className="text-sm leading-relaxed text-blue-50/90 max-w-sm font-medium">
              Nền tảng kết nối học viên với đội ngũ gia sư uy tín, chất lượng hàng đầu Việt Nam. Nâng tầm tri thức, kiến tạo tương lai.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-blue-50/90 font-medium">
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-cyan-200 shrink-0" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-cyan-200 shrink-0" />
                <span>Hotline: 1900 xxxx (8:00 - 21:00)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-cyan-200 shrink-0" />
                <span>Email: support@giasuhub.vn</span>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-3">
                Kết nối với chúng tôi
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      aria-label={item.name}
                      className={`grid size-10 cursor-pointer place-items-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.color}`}
                    >
                      <Icon className="size-4" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.items.map((label) => (
                    <li key={label}>
                      <p className="text-sm text-blue-100/80 font-medium transition-colors hover:text-white cursor-pointer select-none">
                        {label}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="pt-8 text-xs sm:text-sm text-blue-100/80 flex flex-col sm:flex-row justify-between items-center gap-4 font-medium">
          <p>© {new Date().getFullYear()} GiaSuHub. Bảo lưu mọi quyền.</p>
        </div>

      </div>
    </footer>
  );
}