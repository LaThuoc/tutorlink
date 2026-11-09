'use client';

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Heart, MapPin, Monitor, Star } from "lucide-react";
import type { TutorCardData } from "@/src/types/tutor.type";

const money = new Intl.NumberFormat("vi-VN");

function getAvatarFallback(name?: string): string {
  if (!name) return "GS";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TutorCard({ tutor: t }: { tutor: TutorCardData }) {
  const tags = [...t.subjects.slice(0, 2), ...t.grades.slice(0, 1)];

  const hasCustomAvatar = Boolean(t.avatar && t.avatar.trim() !== "");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
        {hasCustomAvatar ? (
          <img
            src={t.avatar!}
            alt={`Gia sư ${t.name}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="grid h-full place-items-center bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-extrabold text-white select-none group-hover:scale-105 transition-transform duration-500"
            aria-hidden="true"
          >
            {getAvatarFallback(t.name)}
          </div>
        )}

        <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
          Đang dạy
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
            {t.name}
          </h3>
          <button
            type="button"
            aria-label={`Lưu gia sư ${t.name}`}
            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Heart className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
          <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
          {t.rating_count > 0 && t.rating_avg ? (
            <>
              <b className="text-slate-900 font-bold">{Number(t.rating_avg).toFixed(1)}</b>
              <span className="text-slate-400">({t.rating_count} đánh giá)</span>
            </>
          ) : (
            <span className="text-slate-400 text-[11px]">Chưa có đánh giá</span>
          )}
        </p>

        <p className="mt-2 text-base font-extrabold text-blue-600">
          {money.format(t.hourly_rate ?? 0)}đ{" "}
          <span className="font-normal text-slate-500 text-[11px]">/ giờ</span>
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-50/80 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <li className="flex items-center gap-2">
            <GraduationCap className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">
              {t.school_name || t.education || `${t.experience_years ?? 0} năm kinh nghiệm`}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{t.address ?? "Chưa cập nhật"}</span>
          </li>
          <li className="flex items-center gap-2">
            <Monitor className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">
              {t.is_online ? "Có thể dạy Online và Offline" : "Chỉ dạy Offline"}
            </span>
          </li>
        </ul>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`/tutors/${t.user_id}`}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Xem chi tiết
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
  );
}