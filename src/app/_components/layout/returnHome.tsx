import Link from 'next/link';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

type StudentBreadcrumbProps = {
  /** Tên trang đang mở, ví dụ: "Hồ sơ cá nhân", "Đã lưu", "Đánh giá gia sư" */
  current: string;
  /** Trang "Học viên" dẫn về đâu. Đổi cho đúng route của bạn */
  studentHref?: string;
};

export function StudentBreadcrumb({
  current,
  studentHref = '/student/profile',
}: StudentBreadcrumbProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-3.5 shadow-sm">
      <nav
        aria-label="Đường dẫn"
        className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm"
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
        >
          <Home className="size-4" />
          <span>Trang chủ</span>
        </Link>

        <ChevronRight className="size-3.5 text-slate-400" />

        <Link
          href={studentHref}
          className="transition-colors hover:text-blue-600"
        >
          Học viên
        </Link>

        <ChevronRight className="size-3.5 text-slate-400" />

        <span aria-current="page" className="font-semibold text-blue-600">
          {current}
        </span>
      </nav>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white active:scale-95 sm:text-sm"
      >
        <ArrowLeft className="size-4" />
        <span>Quay về Trang chủ</span>
      </Link>
    </div>
  );
}