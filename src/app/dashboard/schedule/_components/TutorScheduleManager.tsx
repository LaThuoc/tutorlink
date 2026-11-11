// ===== FILE MỚI: src/app/dashboard/schedule/_components/TutorScheduleManager.tsx =====
'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  CalendarDays, Plus, Trash2, Lock, Unlock, Loader2, CheckCircle2, AlertCircle,
  Clock, Eye, Info, X,
} from 'lucide-react';
import { ScheduleSlot } from '@/src/types/tutor.type';
import { ScheduleActionResult } from '@/src/types/schedule.type';
import {
  addScheduleSlots,
  toggleScheduleSlotStatus,
  deleteScheduleSlot,
} from '@/src/modules/tutor/schedule';

const DAYS = [
  { value: 2, short: 'T2', label: 'Thứ 2' },
  { value: 3, short: 'T3', label: 'Thứ 3' },
  { value: 4, short: 'T4', label: 'Thứ 4' },
  { value: 5, short: 'T5', label: 'Thứ 5' },
  { value: 6, short: 'T6', label: 'Thứ 6' },
  { value: 7, short: 'T7', label: 'Thứ 7' },
  { value: 8, short: 'CN', label: 'Chủ nhật' },
] as const;

const PRESETS = [
  { label: 'Sáng 08:00 – 10:00', start: '08:00', end: '10:00' },
  { label: 'Chiều 14:00 – 16:00', start: '14:00', end: '16:00' },
  { label: 'Tối 19:00 – 21:00', start: '19:00', end: '21:00' },
];

const WEEKDAYS = [2, 3, 4, 5, 6];
const WEEKEND = [7, 8];

type Notice = { type: 'success' | 'error'; text: string } | null;

interface Props {
  userId: string;
  initialSlots: ScheduleSlot[];
  profileCompleted: boolean;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

export default function TutorScheduleManager({ userId, initialSlots, profileCompleted }: Props) {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notice, setNotice] = useState<Notice>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const open = slots.filter((s) => s.isAvailable).length;
    return { total: slots.length, open, closed: slots.length - open };
  }, [slots]);

  const slotsByDay = useMemo(() => {
    const map = new Map<number, ScheduleSlot[]>();
    for (const d of DAYS) map.set(d.value, []);
    for (const s of slots) map.get(s.dayOfWeek)?.push(s);
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [slots]);

  const run = (
    key: string,
    action: () => Promise<ScheduleActionResult>,
    onSuccess?: () => void,
  ) => {
    setNotice(null);
    setBusyKey(key);
    startTransition(async () => {
      const res = await action();
      setBusyKey(null);
      if (res.slots) setSlots(res.slots);
      if (res.success) {
        setNotice({ type: 'success', text: res.message || 'Thành công' });
        onSuccess?.();
      } else {
        setNotice({
          type: 'error',
          text: typeof res.errors === 'string' && res.errors ? res.errors : 'Đã có lỗi xảy ra, vui lòng thử lại.',
        });
      }
    });
  };

  const toggleDay = (value: number) =>
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));

  const handleAdd = () => {
    if (selectedDays.length === 0) {
      setNotice({ type: 'error', text: 'Vui lòng chọn ít nhất 1 ngày trong tuần.' });
      return;
    }
    run('add', () => addScheduleSlots({ days: selectedDays, startTime, endTime }), () => setSelectedDays([]));
  };

  const handleToggle = (slot: ScheduleSlot) =>
    run(`toggle-${slot.id}`, () => toggleScheduleSlotStatus(slot.id, !slot.isAvailable));

  const handleDelete = (slot: ScheduleSlot) => {
    const dayLabel = DAYS.find((d) => d.value === slot.dayOfWeek)?.label ?? '';
    const ok = window.confirm(
      `Xóa khung giờ ${dayLabel} ${slot.startTime} - ${slot.endTime}? Học viên sẽ không còn thấy khung giờ này.`,
    );
    if (!ok) return;
    run(`delete-${slot.id}`, () => deleteScheduleSlot([slot.id]));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* TIÊU ĐỀ */}
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <CalendarDays className="size-5 text-blue-600" /> Lịch dạy của tôi
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tạo các khung giờ rảnh lặp lại hằng tuần để học viên chọn và gửi yêu cầu học.
          </p>
        </div>
        <Link
          href={`/tutors/${userId}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
        >
          <Eye className="size-4" /> Xem như học viên
        </Link>

        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
            <p className="text-xl font-extrabold text-slate-900">{stats.total}</p>
            <p className="text-[11px] font-semibold text-slate-500">Tổng khung giờ</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
            <p className="text-xl font-extrabold text-emerald-700">{stats.open}</p>
            <p className="text-[11px] font-semibold text-emerald-700/80">Đang mở</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
            <p className="text-xl font-extrabold text-amber-700">{stats.closed}</p>
            <p className="text-[11px] font-semibold text-amber-700/80">Đã đóng / đã đặt</p>
          </div>
        </div>
      </section>

      {!profileCompleted && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-800 ring-1 ring-amber-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            Bạn chưa nộp hồ sơ gia sư nên học viên chưa thể tìm thấy bạn.{' '}
            <Link href="/dashboard/profiletutor" className="font-bold underline">
              Hoàn thiện hồ sơ
            </Link>{' '}
            để lịch dạy được hiển thị công khai.
          </span>
        </div>
      )}

      {/* THÔNG BÁO */}
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs ring-1 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
              : 'bg-rose-50 text-rose-700 ring-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
          )}
          <span className="flex-1">{notice.text}</span>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* FORM THÊM KHUNG GIỜ */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Plus className="size-4 text-blue-600" /> Thêm khung giờ dạy
        </h2>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700">1. Chọn các ngày trong tuần</label>
            <div className="flex gap-2 text-[11px] font-bold text-blue-600">
              <button type="button" onClick={() => setSelectedDays(WEEKDAYS)} className="hover:underline">T2 – T6</button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setSelectedDays(WEEKEND)} className="hover:underline">Cuối tuần</button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setSelectedDays(DAYS.map((d) => d.value))} className="hover:underline">Cả tuần</button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setSelectedDays([])} className="text-slate-500 hover:underline">Bỏ chọn</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = selectedDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(d.value)}
                  className={`min-w-14 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                    on ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">2. Chọn khoảng giờ</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Giờ bắt đầu</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Giờ kết thúc</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setStartTime(p.start); setEndTime(p.end); }}
                className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {busyKey === 'add' ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {busyKey === 'add' ? 'Đang thêm...' : 'Thêm khung giờ'}
          </button>
        </div>
      </section>

      {/* LỊCH TUẦN */}
      <section className="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Clock className="size-4 text-blue-600" /> Lịch dạy hằng tuần
        </h2>

        <div className="divide-y divide-slate-100">
          {DAYS.map((d) => {
            const list = slotsByDay.get(d.value) ?? [];
            return (
              <div key={d.value} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="w-24 shrink-0 pt-1.5 text-sm font-bold text-slate-800">{d.label}</div>
                <div className="flex flex-1 flex-wrap gap-2.5">
                  {list.length === 0 ? (
                    <span className="pt-1.5 text-xs italic text-slate-400">Chưa có khung giờ</span>
                  ) : (
                    list.map((s) => {
                      const toggling = busyKey === `toggle-${s.id}`;
                      const deleting = busyKey === `delete-${s.id}`;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                            s.isAvailable ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{s.startTime} - {s.endTime}</p>
                            <p className={`text-[10px] font-semibold ${s.isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {s.isAvailable ? 'Đang mở' : 'Đã đóng / đã đặt'}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggle(s)}
                            title={s.isAvailable ? 'Đóng khung giờ này' : 'Mở lại khung giờ này'}
                            aria-label={s.isAvailable ? 'Đóng khung giờ' : 'Mở lại khung giờ'}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-blue-600 disabled:opacity-50"
                          >
                            {toggling ? <Loader2 className="size-4 animate-spin" /> : s.isAvailable ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDelete(s)}
                            title="Xóa khung giờ"
                            aria-label="Xóa khung giờ"
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-rose-600 disabled:opacity-50"
                          >
                            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex gap-3 rounded-xl bg-blue-50 p-4 text-[13px] leading-relaxed text-slate-600">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <p>
            Khung giờ <b>Đang mở</b> sẽ lặp lại mỗi tuần và học viên có thể chọn để gửi yêu cầu học. Khung giờ
            <b> Đã đóng / đã đặt</b> không cho học viên chọn. Bạn không thể xóa hoặc mở lại khung giờ đang có yêu cầu học
            chờ duyệt hoặc đã được chấp nhận.
          </p>
        </div>
      </section>
    </div>
  );
}
