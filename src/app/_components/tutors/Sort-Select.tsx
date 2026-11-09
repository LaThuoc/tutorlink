"use client";

import { SORTS } from "@/src/types/tutor.type";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      aria-label="Sắp xếp"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-11 cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 text-sm font-medium text-slate-700 outline-none transition-all hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
    >
      {Object.entries(SORTS).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}