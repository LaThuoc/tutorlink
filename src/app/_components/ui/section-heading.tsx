import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ title, description, href, linkLabel = "Xem tất cả" }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        <span className="mt-2 block h-[3px] w-9 rounded-full bg-blue-600" />
        {description && <p className="mt-3 max-w-xl text-slate-600">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
