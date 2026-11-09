import Link from "next/link";
import { Check, Filter } from "lucide-react";
import type { TutorFilters } from "@/src/types/tutor.type";

function RadioItem({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="size-5 rounded-full border-[1.5px] border-slate-300 peer-checked:border-[6px] peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 transition-all" />
      {label}
    </label>
  );
}

const box = "rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm";
const title = "mb-3 text-[15px] font-bold text-slate-900";
const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 transition-all";

export function FiltersSidebar({ filters }: { filters: TutorFilters }) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div className={`${box} flex items-center justify-between py-4`}>
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
          <Filter className="size-[18px] text-blue-600" aria-hidden="true" /> Bộ lọc
        </h2>
        <Link
          href="/tutors"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
        >
          Xóa tất cả
        </Link>
      </div>

      <fieldset className={box}>
        <legend className="sr-only">Hình thức dạy</legend>
        <h3 className={title}>Hình thức dạy</h3>
        <RadioItem
          name="online"
          value=""
          label="Tất cả hình thức"
          defaultChecked={!filters.online}
        />
        <RadioItem
          name="online"
          value="online"
          label="Dạy Online"
          defaultChecked={filters.online === "online"}
        />
        <RadioItem
          name="online"
          value="offline"
          label="Dạy Offline (Tới nhà)"
          defaultChecked={filters.online === "offline"}
        />
      </fieldset>

      <fieldset className={box}>
        <h3 className={title}>Học phí mỗi giờ (đ)</h3>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Học phí từ</span>
            <input
              name="min"
              type="number"
              min={0}
              step={10000}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Từ"
              defaultValue={filters.min}
              className={field}
            />
          </label>
          <span aria-hidden="true" className="text-slate-400 font-bold">-</span>
          <label className="flex-1">
            <span className="sr-only">Học phí đến</span>
            <input
              name="max"
              type="number"
              min={0}
              step={10000}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Đến"
              defaultValue={filters.max}
              className={field}
            />
          </label>
        </div>
      </fieldset>

      <div className={box}>
        <h3 className={title}>Khu vực</h3>
        <label className="sr-only" htmlFor="area">Khu vực</label>
        <input
          id="area"
          name="area"
          type="text"
          placeholder="Quận, huyện hoặc tỉnh/TP"
          defaultValue={filters.area}
          className={field}
        />
      </div>

      <fieldset className={box}>
        <h3 className={title}>Đánh giá gia sư</h3>
        <RadioItem name="rating" value="" label="Tất cả đánh giá" defaultChecked={!filters.rating} />
        <RadioItem name="rating" value="4" label="Từ 4.0 sao trở lên" defaultChecked={filters.rating === 4} />
        <RadioItem name="rating" value="4.5" label="Từ 4.5 sao trở lên" defaultChecked={filters.rating === 4.5} />
      </fieldset>

      <button
        type="submit"
        className="h-12 w-full rounded-xl bg-blue-600 font-bold text-sm text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
      >
        Áp dụng bộ lọc
      </button>
    </aside>
  );
}