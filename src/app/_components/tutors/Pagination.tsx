import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filtersToQuery } from "@/src/modules/queries/tutor.query";
import type { TutorFilters } from "@/src/types/tutor.type";

function pageList(current: number, last: number): (number | "…")[] {
  const set = new Set([1, last, current - 1, current, current + 1].filter((n) => n >= 1 && n <= last));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

const base = "grid size-11 place-items-center rounded-xl text-sm font-semibold transition-all duration-200";

export function Pagination({ filters, page, pageCount }: { filters: TutorFilters; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const q = filtersToQuery({ ...filters, page: p });
    return q ? `/tutors?${q}` : "/tutors";
  };

  return (
    <nav aria-label="Phân trang" className="flex items-center gap-2">
      {page > 1 ? (
        <Link 
          href={href(page - 1)} 
          aria-label="Trang trước" 
          className={`${base} bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95`}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${base} bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed`} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageList(page, pageCount).map((n, i) =>
        n === "…" ? (
          <span key={`g${i}`} className="px-1 text-slate-400 font-bold" aria-hidden="true">…</span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${base} ${
              n === page 
                ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-200" 
                : "bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
            }`}
          >
            {n}
          </Link>
        )
      )}

      {page < pageCount ? (
        <Link 
          href={href(page + 1)} 
          aria-label="Trang sau" 
          className={`${base} bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95`}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${base} bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed`} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}