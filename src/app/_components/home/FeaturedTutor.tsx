"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Heart, MapPin, Monitor, Star } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

type ProfileEmbed = { full_name: string | null; avatar_url: string | null; district: string | null; province: string | null };
type TutorRow = {
  user_id: string;
  headline: string | null;
  subjects: string[] | null;
  grades: string[] | null;
  hourly_rate: number | null;
  address: string | null;
  is_online: boolean | null;
  experience_years: number | null;
  school_name: string | null;
  education: string | null;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

// Kiểu dữ liệu chuẩn cho gia sư sau khi định dạng (Thay thế cho 'any')
type FormattedTutor = TutorRow & {
  name: string;
  avatar: string | null;
  location: string;
  rating: number | null;
  reviewCount: number;
};

const money = new Intl.NumberFormat("vi-VN");

function FeaturedTutorsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-slate-100 border border-slate-200/60" />
      ))}
    </div>
  );
}

export function FeaturedTutors() {
  // 🟢 Đã chỉ định rõ kiểu dữ liệu FormattedTutor[] thay vì any[]
  const [tutors, setTutors] = useState<FormattedTutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutors() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("tutor_profiles")
        .select(
          "user_id, headline, subjects, grades, hourly_rate, address, is_online, experience_years, school_name, education, profiles(full_name, avatar_url, district, province)"
        )
        .eq("verification_status", "Approved")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Lỗi lấy danh sách gia sư nổi bật:", error.message);
      }

      const tutorRows = (data ?? []) as unknown as TutorRow[];
      if (tutorRows.length === 0) {
        setLoading(false);
        return;
      }

      const { data: reviews } = await supabase
        .from("reviews")
        .select("tutor_id, rating")
        .in("tutor_id", tutorRows.map((t) => t.user_id));

      const stats = new Map<string, { sum: number; count: number }>();
      for (const r of reviews ?? []) {
        const s = stats.get(r.tutor_id) ?? { sum: 0, count: 0 };
        s.sum += r.rating;
        s.count += 1;
        stats.set(r.tutor_id, s);
      }

      const formatted: FormattedTutor[] = tutorRows.map((t) => {
        const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
        const s = stats.get(t.user_id);
        return {
          ...t,
          name: p?.full_name ?? "Gia sư",
          avatar: p?.avatar_url ?? null,
          location: p?.district ? `${p.district}, ${p.province || ''}` : t.address || "Hà Nội",
          rating: s ? s.sum / s.count : null,
          reviewCount: s?.count ?? 0,
        };
      });

      setTutors(formatted);
      setLoading(false);
    }

    fetchTutors();
  }, []);

  return (
    <section id="gia-su-noi-bat" className="w-full bg-white py-10 sm:py-14 scroll-mt-20">
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        <SectionHeading title="Gia sư nổi bật" href="/tutors" />

        {loading ? (
          <FeaturedTutorsSkeleton />
        ) : tutors.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-8 text-center text-xs font-medium text-slate-500 border border-slate-100">
            Chưa có gia sư nào được duyệt. Hãy duyệt hồ sơ trong trang quản trị để hiển thị tại đây.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tutors.map((t, i) => (
              <li key={t.user_id}>
                <Reveal delay={i * 80} className="h-full">
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                      {t.avatar ? (
                        <Image 
                          src={t.avatar} 
                          alt={`Gia sư ${t.name}`} 
                          fill 
                          sizes="(min-width:1024px) 25vw, 50vw" 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-3xl font-bold text-blue-300" aria-hidden="true">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                        Đang dạy
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                        <button type="button" aria-label={`Lưu gia sư ${t.name}`} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Heart className="size-4" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                        <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
                        {t.rating ? (
                          <>
                            <b className="text-slate-900 font-bold">{t.rating.toFixed(1)}</b>
                            <span className="text-slate-400">({t.reviewCount})</span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chưa có đánh giá</span>
                        )}
                      </p>

                      <p className="mt-2 text-base font-extrabold text-blue-600">
                        {money.format(t.hourly_rate ?? 0)}đ <span className="font-normal text-slate-500 text-[11px]">/ giờ</span>
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {[...(t.subjects ?? []).slice(0, 2), ...(t.grades ?? []).slice(0, 1)].map((tag) => (
                          <span key={tag} className="rounded-md bg-blue-50/80 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100/60">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <li className="flex items-center gap-2">
                          <GraduationCap className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{t.school_name || t.education || `${t.experience_years ?? 0} năm kinh nghiệm`}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{t.location}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Monitor className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{t.is_online ? "Có thể dạy Online và Offline" : "Chỉ dạy Offline"}</span>
                        </li>
                      </ul>

                      <div className="mt-4 grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/tutors/${t.user_id}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          href={`/tutors/${t.user_id}?book=true`}
                          className="rounded-lg bg-blue-600 px-2.5 py-2 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm active:bg-blue-800"
                        >
                          Liên hệ
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}