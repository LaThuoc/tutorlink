import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Mail, Search, SearchX, X } from "lucide-react";
import { GRADES, SUBJECTS } from "@/src/lib/constants/constants";
import { PAGE_SIZE, filtersToQuery, getTutors, parseFilters } from "@/src/modules/queries/tutor.query";
import { TutorFilters } from "@/src/types/tutor.type";
import { Pagination } from "../../components/tutors/Pagination";
import { SortSelect } from "../../components/tutors/Sort-Select";
import { FiltersSidebar } from "../../components/tutors/FiltersSidebar";
import { TutorCard } from "../../components/tutors/TutorCard";

export const metadata: Metadata = {
  title: "Tìm gia sư | GiaSuHub",
  description: "Lọc gia sư theo môn học, cấp học, học phí, khu vực và đánh giá.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const money = new Intl.NumberFormat("vi-VN");
const selectClass =
  "h-12 w-full appearance-none rounded-xl bg-white pl-4 pr-10 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600";

function activeChips(f: TutorFilters) {
  const without = (patch: Partial<TutorFilters>) => {
    const q = filtersToQuery({ ...f, ...patch, page: 1 });
    return q ? `/tutors?${q}` : "/tutors";
  };
  const chips: { label: string; href: string }[] = [];
  if (f.q) chips.push({ label: `"${f.q}"`, href: without({ q: undefined }) });
  f.subjects?.forEach((s) =>
    chips.push({ label: s, href: without({ subjects: f.subjects!.filter((x) => x !== s) }) })
  );
  if (f.grade) chips.push({ label: f.grade, href: without({ grade: undefined }) });
  if (f.online) chips.push({ label: "Online", href: without({ online: undefined }) });
  if (f.min !== undefined || f.max !== undefined) {
    chips.push({
      label: `${money.format(f.min ?? 0)}đ - ${f.max !== undefined ? `${money.format(f.max)}đ` : "không giới hạn"}`,
      href: without({ min: undefined, max: undefined }),
    });
  }
  if (f.area) chips.push({ label: f.area, href: without({ area: undefined }) });
  if (f.rating) chips.push({ label: `Từ ${f.rating} sao`, href: without({ rating: undefined }) });
  return chips;
}

export default async function TutorsPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const page = filters.page ?? 1;
  const { tutors, total, pageCount, failed } = await getTutors(filters);
  const chips = activeChips(filters);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = (page - 1) * PAGE_SIZE + tutors.length;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-14 2xl:px-20">
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="text-sm text-slate-600">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>{" "}
        <span className="text-slate-400">/</span>{" "}
        <span className="font-semibold text-slate-900">Tìm gia sư</span>
      </nav>

      {/* Header & Số lượng kết quả */}
      <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tìm gia sư phù hợp với bạn
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Khám phá danh sách gia sư chất lượng cao đã qua kiểm duyệt hồ sơ
          </p>
        </div>
        <p className="text-sm text-slate-600" aria-live="polite">
          Tìm thấy <b className="text-blue-600 font-extrabold">{total}</b> gia sư
        </p>
      </div>

      <form action="/tutors" method="get" role="search">
        <div className="grid gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm theo môn học, lớp, tên gia sư</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Tìm theo môn học, lớp, tên gia sư..."
              className="h-12 w-full rounded-xl bg-slate-50 pl-12 pr-4 text-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Môn học</span>
            <select name="subject" defaultValue={filters.subjects?.[0] ?? ""} className={selectClass}>
              <option value="">Tất cả môn học</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          </label>
          <label className="relative">
            <span className="sr-only">Cấp học</span>
            <select name="grade" defaultValue={filters.grade ?? ""} className={selectClass}>
              <option value="">Tất cả cấp học</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          </label>
          <button type="submit" className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white hover:bg-blue-700 transition-colors sm:col-span-2 lg:col-span-1">
            Tìm kiếm
          </button>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[290px_1fr]">
          <FiltersSidebar filters={filters} />

          <section aria-label="Kết quả tìm kiếm" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap items-center gap-2">
                {chips.length > 0 && <li className="text-sm font-medium text-slate-500">Đang lọc:</li>}
                {chips.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} aria-label={`Bỏ lọc ${c.label}`} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                      {c.label} <X className="size-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                Sắp xếp <SortSelect defaultValue={filters.sort ?? "rating"} />
              </div>
            </div>

            {failed ? (
              <p role="alert" className="rounded-2xl bg-white p-10 text-center text-slate-700 shadow-sm border border-slate-100">
                Không tải được danh sách gia sư. Hãy thử tải lại trang.
              </p>
            ) : tutors.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-100">
                <SearchX className="mx-auto size-10 text-slate-400" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold text-slate-900">Chưa có gia sư phù hợp</p>
                <p className="mt-1 text-slate-600">Thử bỏ bớt bộ lọc hoặc mở rộng khoảng học phí.</p>
                <Link href="/tutors" className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Xóa tất cả bộ lọc
                </Link>
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {tutors.map((t) => (
                  <li key={t.user_id}><TutorCard tutor={t} /></li>
                ))}
              </ul>
            )}

            {total > 0 && (
              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-600">
                  Hiển thị <b className="text-slate-900">{from}</b> - <b className="text-slate-900">{to}</b> trong <b className="text-slate-900">{total}</b> gia sư
                </p>
                <Pagination filters={filters} page={page} pageCount={pageCount} />
              </div>
            )}
          </section>
        </div>
      </form>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-9 text-white sm:px-11 shadow-lg">
        <div>
          <p className="text-2xl font-bold tracking-tight">Chưa tìm được gia sư phù hợp?</p>
          <p className="mt-1.5 text-blue-100">Mô tả nhu cầu của bạn, gia sư phù hợp sẽ chủ động liên hệ.</p>
        </div>
        <Link href="/requests/new" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-blue-800 hover:bg-blue-50 transition-colors shadow-sm">
          <Mail className="size-[18px]" aria-hidden="true" /> Gửi yêu cầu tìm gia sư
        </Link>
      </div>
    </div>
  );
}