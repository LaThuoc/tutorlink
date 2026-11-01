'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import {
  Atom, Award, BadgeCheck, BookOpen, Briefcase, Calculator, CalendarDays, Check,
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Code, FlaskConical, Globe, GraduationCap,
  Heart, Home, Info, Leaf, Loader2, Mail, MapPin, Medal, Phone, Quote, School, Send, Share2,
  Sparkles, Star, Trophy, User, Users, type LucideIcon,
} from 'lucide-react';


type TabType = 'about' | 'experience' | 'education' | 'reviews';

type Item = { title: string; sub?: string; detail?: string; year?: string };
type Experience = { role?: string; title?: string; period?: string; time?: string; description?: string; desc?: string; subtitle?: string };
type Education = { degree?: string; school?: string; period?: string; time?: string; detail?: string; status?: string };
type SlotRaw = string | { time: string; booked?: boolean };
type ScheduleRaw = { day?: string; date?: string; slots?: SlotRaw[] };

type FullTutorDetail = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  headline: string;
  bio: string;
  quote: string;
  subjects: string[];
  grades: string[];
  hourly_rate: number;
  address: string;
  is_online: boolean;
  is_verified: boolean;
  total_lessons_taught: number;
  rating_avg: number;
  rating_count: number;
  school_name: string;
  education: string;
  experiences: Experience[];
  educations: Education[];
  certificates: Item[];
  achievements: Item[];
  skills: string[];
  teaching_methods: string[];
  schedules: ScheduleRaw[];
};

type Review = { id: string; rating: number; comment: string | null; created_at: string; name: string };

type RawTutor = {
  id: string;
  user_id: string;
  headline?: string | null;
  bio?: string | null;
  quote?: string | null;
  subjects?: string[] | null;
  grades?: string[] | null;
  hourly_rate?: number | string | null;
  address?: string | null;
  is_online?: boolean | null;
  is_verified?: boolean | null;
  total_lessons_taught?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  school_name?: string | null;
  education?: string | null;
  experiences?: unknown;
  educations?: unknown;
  schedules_data?: unknown;
  certificates?: unknown;
  achievements?: unknown;
  skills?: string[] | null;
  teaching_methods?: string[] | null;
  user?: { full_name?: string | null; avatar_url?: string | null; phone?: string | null; email?: string | null; address?: string | null } | null;
};


function parseJsonSafely<T>(val: unknown): T[] {
  if (!val) return [];
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T[]; } catch { return []; }
  }
  return Array.isArray(val) ? (val as T[]) : [];
}

function toItems(val: unknown): Item[] {
  return parseJsonSafely<unknown>(val)
    .map((x): Item | null => {
      if (typeof x === 'string') return { title: x };
      if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>;
        const title = String(o.title ?? o.name ?? '');
        if (!title) return null;
        return {
          title,
          sub: o.issuer ? String(o.issuer) : o.sub ? String(o.sub) : undefined,
          detail: o.detail ? String(o.detail) : undefined,
          year: o.year ? String(o.year) : undefined,
        };
      }
      return null;
    })
    .filter((x): x is Item => x !== null);
}

const DAY_KEYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
type DayKey = (typeof DAY_KEYS)[number];
const DAY_LABEL: Record<DayKey, string> = { T2: 'Thứ 2', T3: 'Thứ 3', T4: 'Thứ 4', T5: 'Thứ 5', T6: 'Thứ 6', T7: 'Thứ 7', CN: 'Chủ nhật' };

function dayKeyOf(raw?: string): DayKey | null {
  if (!raw) return null;
  const s = raw.toLowerCase().normalize('NFC').trim();
  if (s.startsWith('chủ nhật') || s === 'cn') return 'CN';
  const names: [string, DayKey][] = [['hai', 'T2'], ['ba', 'T3'], ['tư', 'T4'], ['năm', 'T5'], ['sáu', 'T6'], ['bảy', 'T7']];
  for (const [n, k] of names) if (s.includes(`thứ ${n}`)) return k;
  const m = s.match(/(?:thứ\s*|t)([2-7])/);
  return m ? DAY_KEYS[Number(m[1]) - 2] : null;
}

// Biểu tượng + nhãn nhỏ cho từng môn (có thể bổ sung thêm)
const SUBJECT_META: Record<string, { icon: LucideIcon; tint: string; tag: string }> = {
  'Toán': { icon: Calculator, tint: 'bg-blue-100 text-blue-600', tag: 'Tư duy logic' },
  'Vật lý': { icon: Atom, tint: 'bg-emerald-100 text-emerald-600', tag: 'Lý thuyết + Bài tập' },
  'Hóa học': { icon: FlaskConical, tint: 'bg-violet-100 text-violet-600', tag: 'Nắm chắc lý thuyết' },
  'Tiếng Anh': { icon: Globe, tint: 'bg-amber-100 text-amber-600', tag: 'Giao tiếp + Ôn thi' },
  'Ngữ văn': { icon: BookOpen, tint: 'bg-rose-100 text-rose-600', tag: 'Kỹ năng viết' },
  'Sinh học': { icon: Leaf, tint: 'bg-emerald-100 text-emerald-600', tag: 'Hiểu bản chất' },
  'Tin học': { icon: Code, tint: 'bg-blue-100 text-blue-600', tag: 'Thực hành' },
};
const FALLBACK_META = { icon: BookOpen, tint: 'bg-blue-100 text-blue-600', tag: '' };

/* ============================== THÀNH PHẦN NHỎ ============================== */

const card = 'rounded-2xl bg-white shadow-sm ring-1 ring-slate-100';

function SectionTitle({ icon: Icon, children, className = '' }: { icon: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`flex items-center gap-2.5 text-base font-bold text-slate-900 ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600"><Icon className="size-[18px]" /></span>
      {children}
    </h3>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-[13px] text-slate-700">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <Check className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={2.5} /> {t}
        </li>
      ))}
    </ul>
  );
}

function QuoteBox({ text, author, className = '' }: { text: string; author?: string; className?: string }) {
  return (
    <div className={`rounded-xl bg-blue-50 p-5 ring-1 ring-blue-100 ${className}`}>
      <div className="flex gap-3">
        <Quote className="size-7 shrink-0 fill-blue-600 text-blue-600" />
        <p className="text-sm font-medium italic leading-relaxed text-blue-900">&ldquo;{text}&rdquo;</p>
      </div>
      {author && <p className="mt-3 text-right text-xs italic text-slate-500">- {author} -</p>}
    </div>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} width={size} height={size} className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
      ))}
    </span>
  );
}

function ReviewStrip({ reviews, total, onViewAll }: { reviews: Review[]; total: number; onViewAll: () => void }) {
  const [i, setI] = useState(0);
  const r = reviews[i];
  return (
    <div className={`${card} p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle icon={Star}>Đánh giá từ học sinh và phụ huynh</SectionTitle>
        <button type="button" onClick={onViewAll} className="text-xs font-semibold text-blue-600 hover:underline">Xem tất cả</button>
      </div>
      {r ? (
        <div className="flex items-start gap-4 rounded-xl border border-slate-100 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-500"><User className="size-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{r.name}</p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <Stars value={r.rating} /> <b className="text-slate-800">{r.rating.toFixed(1)}</b>
              <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{r.comment}</p>
          </div>
          {reviews.length > 1 && (
            <div className="flex shrink-0 gap-2 self-center">
              <button type="button" aria-label="Đánh giá trước" onClick={() => setI((i - 1 + reviews.length) % reviews.length)} className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><ChevronLeft className="size-4" /></button>
              <button type="button" aria-label="Đánh giá sau" onClick={() => setI((i + 1) % reviews.length)} className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><ChevronRight className="size-4" /></button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500">{total > 0 ? 'Chưa tải được nội dung đánh giá.' : 'Chưa có đánh giá nào.'}</p>
      )}
    </div>
  );
}


type Slot = { time: string; booked: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const viDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const KEY_OF_JS_DAY: DayKey[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']; // Date.getDay(): 0 = Chủ nhật

function parseDmy(s?: string): string | null {
  const m = s?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}` : null;
}

function normalizeSlots(raw?: SlotRaw[]): Slot[] {
  return (raw ?? []).map((x) => (typeof x === 'string' ? { time: x, booked: false } : { time: x.time, booked: !!x.booked }));
}


function buildAvailability(schedules: ScheduleRaw[]) {
  const weekly: Partial<Record<DayKey, Slot[]>> = {};
  const byDate: Record<string, Slot[]> = {};
  for (const s of schedules) {
    const slots = normalizeSlots(s.slots);
    const key = dayKeyOf(s.day);
    if (key) {
      weekly[key] = [...(weekly[key] ?? []), ...slots];
      continue;
    }
    const iso = parseDmy(s.date);
    if (iso) byDate[iso] = [...(byDate[iso] ?? []), ...slots];
  }
  return (d: Date): Slot[] => byDate[isoOf(d)] ?? weekly[KEY_OF_JS_DAY[d.getDay()]] ?? [];
}

const MAX_MONTHS_AHEAD = 12;

function MonthSchedule({ schedules, selected, onToggle }: { schedules: ScheduleRaw[]; selected: Set<string>; onToggle: (id: string) => void }) {
  const slotsOn = useMemo(() => buildAvailability(schedules), [schedules]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [picked, setPicked] = useState<string | null>(null);

  const firstAvailable = useMemo(() => {
    for (let i = 0; i < 400; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (slotsOn(d).some((s) => !s.booked)) return d;
    }
    return null;
  }, [slotsOn, today]);

  const activeIso = picked ?? (firstAvailable ? isoOf(firstAvailable) : null);
  const activeDate = activeIso ? new Date(`${activeIso}T00:00:00`) : null;
  const activeSlots = activeDate ? slotsOn(activeDate) : [];

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const atFirstMonth = year === today.getFullYear() && month === today.getMonth();
  const monthsFromNow = (year - today.getFullYear()) * 12 + (month - today.getMonth());
  const goMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  const chosen = [...selected].sort().map((id) => {
    const [iso, time] = id.split('|');
    const d = new Date(`${iso}T00:00:00`);
    return { id, label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${time}` };
  });

  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={CalendarDays} className="mb-5">Lịch rảnh của gia sư</SectionTitle>

      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Tháng trước" disabled={atFirstMonth} onClick={() => goMonth(-1)}
          className="grid size-8 place-items-center rounded-full text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-bold text-slate-900" aria-live="polite">Tháng {month + 1}/{year}</p>
        <button type="button" aria-label="Tháng sau" disabled={monthsFromNow >= MAX_MONTHS_AHEAD} onClick={() => goMonth(1)}
          className="grid size-8 place-items-center rounded-full text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {DAY_KEYS.map((k) => (
          <span key={k} className="pb-1 text-[11px] font-bold text-slate-400">{k}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = isoOf(d);
          const past = d < today;
          const slots = past ? [] : slotsOn(d);
          const free = slots.some((s) => !s.booked);
          const full = slots.length > 0 && !free;
          const isActive = iso === activeIso;
          const isToday = d.getTime() === today.getTime();
          const count = [...selected].filter((id) => id.startsWith(`${iso}|`)).length;
          return (
            <button
              key={iso}
              type="button"
              disabled={!free}
              aria-pressed={isActive}
              aria-label={`${viDate(d)}${free ? ', còn lịch' : full ? ', đã kín lịch' : ', không có lịch'}`}
              onClick={() => setPicked(iso)}
              className={`relative aspect-square rounded-lg text-[13px] font-semibold transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-sm'
                : free ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : full ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                : past ? 'cursor-not-allowed text-slate-300' : 'cursor-not-allowed text-slate-400'
              } ${isToday && !isActive ? 'ring-1 ring-blue-400' : ''}`}
            >
              {d.getDate()}
              {count > 0 && <span className={`absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full ${isActive ? 'bg-white' : 'bg-blue-600'}`} />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-blue-50 ring-1 ring-blue-200" />Còn lịch</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-blue-600" />Đang xem</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-slate-100" />Kín lịch</span>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        {activeDate ? (
          <>
            <p className="mb-2.5 text-[13px] font-bold text-slate-900">
              {DAY_LABEL[KEY_OF_JS_DAY[activeDate.getDay()]]}, ngày {viDate(activeDate)}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {activeSlots.map((s) => {
                const id = `${activeIso}|${s.time}`;
                const on = selected.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={s.booked}
                    aria-pressed={on}
                    onClick={() => onToggle(id)}
                    className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                      s.booked ? 'cursor-not-allowed bg-slate-100 text-slate-400' : on ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {s.time}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">Gia sư chưa cập nhật lịch rảnh cụ thể.</p>
        )}
      </div>

      {chosen.length > 0 && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">
          <p className="mb-2 text-xs font-bold text-slate-900">Đã chọn {chosen.length} khung giờ</p>
          <div className="flex flex-wrap gap-2">
            {chosen.map((c) => (
              <button key={c.id} type="button" onClick={() => onToggle(c.id)} aria-label={`Bỏ chọn ${c.label}`}
                className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700">
                {c.label} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3 rounded-xl bg-blue-50 p-4 text-[13px] leading-relaxed text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
        <p>Bạn có thể chọn khung giờ phù hợp và gửi yêu cầu học. Gia sư sẽ xác nhận hoặc đề xuất thời gian khác nếu cần.</p>
      </div>
    </div>
  );
}


export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = use(params);
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [tutor, setTutor] = useState<FullTutorDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const toggleSlot = (id: string) =>
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const select = `*, user:profiles!tutor_profiles_user_id_fkey (full_name, avatar_url, phone, email, address)`;

        let { data } = await supabase.from('tutor_profiles').select(select).eq('user_id', targetId).maybeSingle();
        if (!data) {
          ({ data } = await supabase.from('tutor_profiles').select(select).eq('id', targetId).maybeSingle());
        }
        if (cancelled) return;
        if (!data) { setTutor(null); return; }

        const raw = data as unknown as RawTutor;
        const subjects = raw.subjects ?? [];

        setTutor({
          id: raw.id,
          user_id: raw.user_id,
          full_name: raw.user?.full_name || 'Gia sư Tutorlink',
          avatar_url: raw.user?.avatar_url || null,
          phone: raw.user?.phone || null,
          email: raw.user?.email || null,
          headline: raw.headline || `Gia sư ${subjects.join(' · ')}`,
          bio: raw.bio || 'Chưa cập nhật thông tin giới thiệu.',
          quote: raw.quote || '',
          subjects,
          grades: raw.grades ?? [],
          hourly_rate: Number(raw.hourly_rate) || 0,
          address: raw.address || raw.user?.address || 'Chưa cập nhật',
          is_online: raw.is_online ?? true,
          is_verified: raw.is_verified ?? false,
          total_lessons_taught: raw.total_lessons_taught || 0,
          rating_avg: Number(raw.rating_avg) || 0,
          rating_count: raw.rating_count || 0,
          school_name: raw.school_name || '',
          education: raw.education || '',
          experiences: parseJsonSafely<Experience>(raw.experiences),
          educations: parseJsonSafely<Education>(raw.educations),
          certificates: toItems(raw.certificates),
          achievements: toItems(raw.achievements),
          skills: raw.skills ?? [],
          teaching_methods: raw.teaching_methods ?? [],
          schedules: parseJsonSafely<ScheduleRaw>(raw.schedules_data),
        });

        const { data: rv } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, student:profiles!reviews_student_id_fkey (full_name)')
          .eq('tutor_id', raw.user_id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (cancelled) return;
        setReviews(
          (rv ?? []).map((r) => {
            const st = Array.isArray(r.student) ? r.student[0] : r.student;
            return { id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, name: st?.full_name || 'Học viên' };
          }),
        );
      } catch (err) {
        console.error('Lỗi fetch dữ liệu gia sư:', err);
        if (!cancelled) setTutor(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (targetId) load();
    return () => { cancelled = true; };
  }, [targetId, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">Đang tải thông tin gia sư...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F8FC] px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy gia sư</h2>
        <p className="mt-1 text-xs text-slate-500">Hồ sơ gia sư này có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
        <Link href="/tutors" className="mt-5 inline-flex h-10 items-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
          Quay lại danh sách gia sư
        </Link>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'experience', label: 'Kinh nghiệm' },
    { id: 'education', label: 'Học vấn' },
    { id: 'reviews', label: `Đánh giá (${tutor.rating_count})` },
  ];

  const achievementLines = [...tutor.achievements, ...tutor.certificates].map((x) => x.title);
  const methods = tutor.teaching_methods.length ? tutor.teaching_methods : tutor.skills;

  return (
    <div className="min-h-screen bg-[#F4F8FC] pb-20 font-sans text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"><Home className="size-3.5" /> Trang chủ</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <Link href="/tutors" className="text-blue-600 hover:underline">Tìm gia sư</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="font-semibold text-blue-700">{tutor.full_name}</span>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* ============ CỘT TRÁI ============ */}
          <div className="space-y-5 lg:col-span-8">
            {/* Thẻ hồ sơ */}
            <section className={`${card} p-6`}>
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative shrink-0 self-start">
                  {tutor.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tutor.avatar_url} alt={tutor.full_name} className="h-[230px] w-[220px] rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-[230px] w-[220px] select-none place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-6xl font-extrabold text-white">
                      {tutor.full_name.trim().split(' ').pop()?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">Đang dạy</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">{tutor.full_name}</h1>
                    {tutor.is_verified && <BadgeCheck className="size-6 fill-blue-500 text-white" aria-label="Đã xác minh" />}
                    {tutor.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                        <CheckCircle2 className="size-3.5" /> Đã xác minh
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{tutor.headline}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Star className="size-[18px] fill-amber-400 text-amber-400" />
                      <b className="text-slate-900">{tutor.rating_avg.toFixed(1)}</b>
                      <span className="text-slate-500">({tutor.rating_count} đánh giá)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Users className="size-[18px] text-slate-500" /> Đã dạy {tutor.total_lessons_taught}+ buổi
                    </span>
                  </div>

                  {/* Thiết kế ghi "/ buổi"; dữ liệu lấy từ cột hourly_rate */}
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {tutor.hourly_rate.toLocaleString('vi-VN')}đ <span className="text-sm font-medium text-slate-500">/ buổi</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...tutor.subjects, ...tutor.grades].map((t) => (
                      <span key={t} className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">{t}</span>
                    ))}
                  </div>

                  <ul className="mt-3.5 space-y-2 text-[13px] text-slate-600">
                    {tutor.school_name && <li className="flex items-center gap-2.5"><MapPin className="size-4 text-slate-500" />{tutor.school_name}</li>}
                    {tutor.education && <li className="flex items-center gap-2.5"><GraduationCap className="size-4 text-slate-500" />{tutor.education}</li>}
                    <li className="flex items-center gap-2.5"><Clock className="size-4 text-slate-500" />{tutor.is_online ? 'Có thể dạy Online và Offline' : 'Chỉ dạy Offline'}</li>
                  </ul>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1.6fr_1fr_0.8fr]">
                    <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                      <Send className="size-4" />
                      Gửi yêu cầu học{selectedSlots.size > 0 && ` (${selectedSlots.size} khung giờ)`}
                    </button>
                    <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50">
                      <Heart className="size-4" /> Lưu gia sư
                    </button>
                    <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                      <Share2 className="size-4" /> Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className={card}>
              <div role="tablist" className="flex gap-1 border-b border-slate-100 px-4">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative px-5 py-4 text-sm font-semibold transition-colors ${activeTab === t.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {t.label}
                    {activeTab === t.id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-7">
                    <div>
                      <SectionTitle icon={User} className="mb-3">Về bản thân</SectionTitle>
                      <p className="whitespace-pre-line pl-1 text-sm leading-[1.8] text-slate-700">{tutor.bio}</p>
                      {tutor.quote && <QuoteBox text={tutor.quote} className="mt-4" />}
                    </div>

                    {tutor.subjects.length > 0 && (
                      <div>
                        <SectionTitle icon={BookOpen} className="mb-4">Môn học dạy</SectionTitle>
                        <div className="grid gap-4 sm:grid-cols-3">
                          {tutor.subjects.map((sub) => {
                            const m = SUBJECT_META[sub] ?? FALLBACK_META;
                            const Icon = m.icon;
                            return (
                              <div key={sub} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <div className="flex gap-3">
                                  <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${m.tint}`}><Icon className="size-6" /></span>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900">{sub}</h4>
                                    <p className="mt-0.5 text-[13px] text-slate-600">{tutor.grades.join(', ') || 'Mọi cấp'}</p>
                                  </div>
                                </div>
                                {m.tag && <span className="mt-3 ml-14 inline-block rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">{m.tag}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(tutor.achievements.length > 0 || tutor.education) && (
                      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                        <div>
                          <SectionTitle icon={Briefcase} className="mb-3">Kinh nghiệm &amp; Thành tích</SectionTitle>
                          {tutor.achievements.length > 0 ? (
                            <CheckList items={tutor.achievements.map((a) => a.title)} />
                          ) : (
                            <p className="text-xs text-slate-500">Chưa cập nhật thành tích.</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-blue-50/60 p-4 ring-1 ring-blue-100">
                          <div className="flex gap-3">
                            <GraduationCap className="size-7 shrink-0 text-blue-600" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{tutor.education || 'Gia sư'}</p>
                              {tutor.school_name && <p className="text-xs text-slate-500">{tutor.school_name}</p>}
                            </div>
                          </div>
                          {tutor.quote && <p className="mt-3 text-xs italic leading-relaxed text-slate-600">&ldquo;{tutor.quote}&rdquo;</p>}
                          <p className="mt-2 text-right text-xs italic text-slate-500">- {tutor.full_name} -</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                      <div>
                        <SectionTitle icon={CalendarDays} className="mb-5">Kinh nghiệm giảng dạy</SectionTitle>
                        {tutor.experiences.length > 0 ? (
                          <ol className="relative ml-1 space-y-6 border-l-2 border-blue-100 pl-5">
                            {tutor.experiences.map((e, i) => (
                              <li key={i} className="relative">
                                <span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-200" />
                                <p className="text-xs font-semibold text-blue-600">{e.period || e.time}</p>
                                <h4 className="mt-0.5 text-sm font-bold text-slate-900">{e.role || e.title}</h4>
                                {e.subtitle && <p className="text-xs text-slate-500">{e.subtitle}</p>}
                                {(e.description || e.desc) && <p className="mt-1 text-xs leading-relaxed text-slate-600">{e.description || e.desc}</p>}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs text-slate-500">Chưa cập nhật chi tiết kinh nghiệm.</p>
                        )}
                      </div>
                      {tutor.quote && <QuoteBox text={tutor.quote} author={tutor.full_name} className="self-start" />}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 p-5">
                        <SectionTitle icon={Sparkles} className="mb-4">Phương pháp giảng dạy</SectionTitle>
                        {methods.length > 0 ? <CheckList items={methods} /> : <p className="text-xs text-slate-500">Chưa cập nhật.</p>}
                      </div>
                      <div className="rounded-xl border border-slate-100 p-5">
                        <SectionTitle icon={Award} className="mb-4">Thành tích &amp; chứng chỉ</SectionTitle>
                        {achievementLines.length > 0 ? <CheckList items={achievementLines} /> : <p className="text-xs text-slate-500">Chưa cập nhật.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------- HỌC VẤN ---------- */}
                {activeTab === 'education' && (
                  <div className="space-y-7">
                    <div>
                      <SectionTitle icon={GraduationCap} className="mb-5">Quá trình học tập</SectionTitle>
                      {tutor.educations.length > 0 ? (
                        <ol className="relative ml-1 space-y-3 border-l-2 border-blue-100 pl-5">
                          {tutor.educations.map((e, i) => (
                            <li key={i} className="relative grid items-stretch gap-3 sm:grid-cols-[110px_1fr]">
                              <span className="absolute -left-[27px] top-5 size-3 rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-200" />
                              <div className="rounded-xl bg-slate-100/70 px-3 py-4 text-center text-xs font-semibold text-blue-700">{e.period || e.time}</div>
                              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                                <span className="mt-0.5 text-blue-600">{i === 0 ? <GraduationCap className="size-6" /> : <School className="size-6" />}</span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-bold text-slate-900">{e.school}</h4>
                                  {e.degree && <p className="mt-0.5 text-xs text-slate-600">{e.degree}</p>}
                                  {e.detail && <p className="mt-0.5 text-xs text-slate-600">{e.detail}</p>}
                                </div>
                                {e.status && <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">{e.status}</span>}
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="rounded-xl border border-slate-100 p-5">
                          <h4 className="text-sm font-bold text-slate-900">{tutor.school_name || 'Chưa cập nhật'}</h4>
                          {tutor.education && <p className="mt-0.5 text-xs text-slate-500">{tutor.education}</p>}
                        </div>
                      )}
                    </div>

                    {tutor.certificates.length > 0 && (
                      <div>
                        <SectionTitle icon={Award} className="mb-4">Bằng cấp &amp; chứng chỉ</SectionTitle>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {tutor.certificates.map((c) => (
                            <div key={c.title} className="flex gap-3 rounded-xl border border-slate-100 p-4">
                              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Award className="size-5" /></span>
                              <div className="min-w-0">
                                <h4 className="text-[13px] font-bold text-slate-900">{c.title}</h4>
                                {c.sub && <p className="text-xs text-slate-500">{c.sub}</p>}
                                {c.detail && <p className="text-xs text-slate-500">{c.detail}</p>}
                                {c.year && <p className="text-xs text-slate-500">{c.year}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tutor.achievements.length > 0 && (
                      <div className="rounded-xl bg-slate-50 p-4">
                        <SectionTitle icon={Star} className="mb-3">Chứng chỉ và thành tích nổi bật</SectionTitle>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {tutor.achievements.slice(0, 3).map((a, i) => {
                            const Icon = [Trophy, Medal, Star][i % 3];
                            return (
                              <div key={a.title} className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-slate-100">
                                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Icon className="size-5" /></span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900">{a.title}</p>
                                  {(a.sub || a.year) && <p className="text-[11px] text-slate-500">{a.sub || a.year}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------- ĐÁNH GIÁ ---------- */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="mb-5 flex items-center gap-4">
                      <p className="text-4xl font-extrabold text-slate-900">{tutor.rating_avg.toFixed(1)}</p>
                      <div>
                        <Stars value={tutor.rating_avg} size={18} />
                        <p className="mt-1 text-xs text-slate-500">{tutor.rating_count} đánh giá từ học viên</p>
                      </div>
                    </div>
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-500">Chưa có đánh giá nào.</p>
                    ) : (
                      <ul className="space-y-3">
                        {reviews.map((r) => (
                          <li key={r.id} className="flex gap-4 rounded-xl border border-slate-100 p-4">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-500"><User className="size-5" /></span>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{r.name}</p>
                              <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                <Stars value={r.rating} /> <b className="text-slate-800">{r.rating.toFixed(1)}</b>
                                <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                              </p>
                              {r.comment && <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{r.comment}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </section>

            {(activeTab === 'about' || activeTab === 'experience') && (
              <ReviewStrip reviews={reviews} total={tutor.rating_count} onViewAll={() => setActiveTab('reviews')} />
            )}
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <MonthSchedule schedules={tutor.schedules} selected={selectedSlots} onToggle={toggleSlot} />

            <div className={`${card} p-6`}>
              <SectionTitle icon={Phone} className="mb-4">Thông tin liên hệ</SectionTitle>
              <ul className="space-y-4 text-[13px]">
                <li className="flex items-start gap-3.5">
                  <Phone className="mt-0.5 size-[18px] text-slate-500" />
                  <div>
                    <p className="text-slate-500">Số điện thoại</p>
                    <p className="font-semibold text-blue-600">{tutor.phone || 'Ẩn số điện thoại'}</p>
                    {tutor.phone && <p className="text-[11px] text-slate-400">(Hiển thị với học sinh)</p>}
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <Mail className="mt-0.5 size-[18px] text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-slate-500">Email</p>
                    <p className="truncate font-medium text-slate-800">{tutor.email || 'Ẩn email'}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <MapPin className="mt-0.5 size-[18px] text-slate-500" />
                  <div>
                    <p className="text-slate-500">Địa chỉ</p>
                    <p className="font-medium text-slate-800">{tutor.address}</p>
                  </div>
                </li>
              </ul>
              {tutor.is_verified && (
                <div className="mt-5 flex items-center gap-3 rounded-lg bg-emerald-50 p-3.5">
                  <CheckCircle2 className="size-8 shrink-0 fill-emerald-600 text-white" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Đã xác minh thông tin</p>
                    <p className="text-[11px] text-emerald-700/80">Hồ sơ đã được kiểm duyệt bởi Tutorlink</p>
                  </div>
                </div>
              )}
            </div>

            <div className={`${card} p-6`}>
              <SectionTitle icon={Sparkles} className="mb-4">Kỹ năng nổi bật</SectionTitle>
              {tutor.skills.length > 0 ? <CheckList items={tutor.skills} /> : <p className="text-xs text-slate-400">Chưa cập nhật kỹ năng</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
