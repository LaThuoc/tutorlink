import { 
  Calculator, 
  Languages, 
  Atom, 
  Code2, 
  BookOpenCheck, 
  Globe2, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";

const FEATURED_SUBJECTS = [
  { 
    name: "Toán Học", 
    count: "1,200+ Gia sư", 
    icon: Calculator, 
    gradient: "from-blue-600 to-indigo-600 shadow-blue-500/20 text-white", 
    tag: "Phổ biến nhất" 
  },
  { 
    name: "Tiếng Anh & IELTS", 
    count: "2,500+ Gia sư", 
    icon: Languages, 
    gradient: "from-sky-500 to-blue-600 shadow-sky-500/20 text-white", 
    tag: "Hot Search" 
  },
  { 
    name: "Vật Lý & Hóa Học", 
    count: "1,100+ Gia sư", 
    icon: Atom, 
    gradient: "from-indigo-600 to-purple-600 shadow-indigo-500/20 text-white", 
    tag: "Luyện thi THPT" 
  },
  { 
    name: "Lập Trình & Tin Học", 
    count: "650+ Gia sư", 
    icon: Code2, 
    gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/20 text-white", 
    tag: "Xu hướng" 
  },
  { 
    name: "Ngữ Văn", 
    count: "800+ Gia sư", 
    icon: BookOpenCheck, 
    gradient: "from-rose-500 to-pink-600 shadow-rose-500/20 text-white", 
    tag: "" 
  },
  { 
    name: "Ngoại Ngữ Khác", 
    count: "900+ Gia sư", 
    icon: Globe2, 
    gradient: "from-emerald-500 to-teal-600 shadow-emerald-500/20 text-white", 
    tag: "Nhật / Hàn / Trung" 
  },
];

export function BentoSubjectsGrid() {
  return (
    <section className="w-full bg-slate-50/60 py-14 sm:py-18 border-y border-slate-100">
      {/* Khung lề đồng bộ max-w-[1920px] */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/50">
              <Sparkles className="size-3.5" aria-hidden="true" /> Khám phá lĩnh vực học
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
              Môn học nổi bật tại GiaSuHub
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600 leading-relaxed">
            Hơn 20+ bộ môn từ chương trình phổ thông đến chứng chỉ quốc tế luôn có sẵn gia sư chất lượng sẵn sàng đồng hành.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_SUBJECTS.map((sub) => {
            const Icon = sub.icon;
            return (
              <a
                key={sub.name}
                href={`/tutors?subject=${encodeURIComponent(sub.name)}`}
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-400"
              >
                <div className="flex items-center gap-4 relative z-10">
                  {/* Khung Icon Lucide thiết kế dạng Gradient Glow */}
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${sub.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    {sub.tag && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {sub.tag}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      {sub.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {sub.count}
                    </p>
                  </div>
                </div>

                {/* Nút mũi tên tương tác */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </div>

                {/* Background Gradient nhẹ khi Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/20 to-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}