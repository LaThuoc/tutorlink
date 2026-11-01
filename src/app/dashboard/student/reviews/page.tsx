
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import { createClient } from '@/src/lib/supabase/client';
import {
  Star,
  Send,
  CheckCircle2,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Users,
  Heart,
  ChevronDown,
  MessageSquareText,
} from 'lucide-react';

type CompletedClass = {
  id: string;
  tutor_id: string;
  tutor_name: string;
  subject: string;
};

type RawBookingResponse = {
  id: string;
  tutor_id: string;
  subject: string;
  tutor?: {
    full_name?: string | null;
  } | null;
};

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Minh bạch',
    description: 'Đánh giá công bằng',
  },
  {
    icon: Users,
    title: 'Cộng đồng',
    description: 'Cùng nhau phát triển',
  },
  {
    icon: Heart,
    title: 'Chia sẻ',
    description: 'Lan tỏa tri thức',
  },
];

export default function StudentReviewsPage() {
  const supabase = createClient();

  const [classes, setClasses] = useState<CompletedClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lấy danh sách lớp học của học viên
  useEffect(() => {
    let isMounted = true;

    async function fetchCompletedClasses() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (isMounted) {
            setErrorMessage('Vui lòng đăng nhập để gửi đánh giá.');
          }
          return;
        }

        const { data, error } = await supabase
          .from('booking_requests')
          .select(`
            id,
            tutor_id,
            subject,
            tutor:tutor_id (full_name)
          `)
          .eq('student_id', user.id)
          .in('status', ['Accepted', 'Completed']);

        if (error) throw error;

        if (data && isMounted) {
          const rawData = data as unknown as RawBookingResponse[];

          const list: CompletedClass[] = rawData.map((item) => ({
            id: item.id,
            tutor_id: item.tutor_id,
            tutor_name: item.tutor?.full_name || 'Gia sư',
            subject: item.subject,
          }));

          setClasses(list);

          if (list.length > 0) {
            setSelectedClass(list[0].id);
          }
        }
      } catch (error) {
        console.error('Fetch classes error:', error);

        if (isMounted) {
          setErrorMessage('Không thể tải danh sách lớp học. Vui lòng thử lại.');
        }
      } finally {
        if (isMounted) {
          setLoadingClasses(false);
        }
      }
    }

    fetchCompletedClasses();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Gửi đánh giá
  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedClass || !comment.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccess(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const currentClass = classes.find(
        (item) => item.id === selectedClass
      );

      if (!user || !currentClass) {
        setErrorMessage('Không tìm thấy thông tin lớp học.');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        student_id: user.id,
        tutor_id: currentClass.tutor_id,
        rating,
        comment: comment.trim(),
      });

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('Bạn đã gửi đánh giá cho gia sư này rồi!');
        } else {
          setErrorMessage(`Gửi đánh giá thất bại: ${error.message}`);
        }
        return;
      }

      setSuccess(true);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Submit review error:', error);
      setErrorMessage('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentClass = classes.find(
    (item) => item.id === selectedClass
  );

  return (
    <main className="bg-slate-50/50 pb-8 pt-3">
      <div className="mx-auto max-w-6xl">

        {/* Main card */}
        <div className="relative overflow-hidden rounded-[32px] border border-blue-100/80 bg-gradient-to-br from-[#eff6ff] via-[#f5f9ff] to-[#eaf3ff] p-3 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:rounded-[40px] sm:p-5">

          {/* Background decoration */}
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="relative grid items-stretch gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:gap-5">

            {/* LEFT: Mascot and introduction */}
            <section className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-[#e5f0ff] via-[#f0f6ff] to-white px-6 pb-7 pt-5 sm:px-9 sm:pt-7">

              {/* Decorative circles */}
              <div className="pointer-events-none absolute -left-16 top-36 h-52 w-52 rounded-full bg-blue-200/30 blur-2xl" />
              <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-white/70 blur-2xl" />

              {/* Mascot */}
              <div className="relative mx-auto -mb-1 h-[270px] w-full max-w-[330px]">
                <Image
                  src="/images/banners/banner7.png"
                  alt="Linh vật chim xanh GiaSuHub"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 330px"
                  className="object-contain object-bottom mix-blend-multiply"
                />
              </div>

              {/* Intro content */}
              <div className="relative z-10 mt-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3.5 py-2 text-xs font-bold text-blue-600 shadow-sm">
                  <GraduationCap className="size-4" />
                  GIASUHUB COMMUNITY
                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-[34px]">
                  Cùng nhau tạo nên những trải nghiệm học tập tốt hơn
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                  Đánh giá của bạn giúp gia sư cải thiện chất lượng giảng dạy
                  và lan tỏa những giá trị tích cực đến cộng đồng học viên.
                </p>
              </div>

              {/* Features */}
              <div className="relative z-10 mt-auto grid grid-cols-3 gap-2 pt-7">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex flex-col items-center rounded-2xl border border-white/80 bg-white/70 px-2 py-3 text-center shadow-sm"
                    >
                      <div className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-600">
                        <Icon className="size-[18px]" />
                      </div>

                      <p className="mt-2 text-xs font-bold text-slate-800">
                        {feature.title}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>

            </section>

            {/* RIGHT: Review form */}
            <section className="relative flex flex-col rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(30,64,175,0.07)] sm:p-8 lg:p-9">

              {/* Form heading */}
              <div className="mb-8 flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageSquareText className="size-6" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    Đánh giá gia sư
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Hãy chia sẻ trải nghiệm của bạn để giúp gia sư ngày càng tốt hơn!
                  </p>
                </div>
              </div>

              {/* Success message */}
              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold">Gửi đánh giá thành công!</p>
                    <p className="mt-1 text-emerald-700">
                      Cảm ơn bạn đã chia sẻ trải nghiệm học tập của mình.
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="flex flex-1 flex-col">

                {/* Select class */}
                <div>
                  <label
                    htmlFor="review-class"
                    className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"
                  >
                    <GraduationCap className="size-5 text-blue-600" />
                    Chọn lớp học cần đánh giá
                  </label>

                  <div className="relative">
                    <select
                      id="review-class"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      disabled={loadingClasses || classes.length === 0}
                      className="h-[58px] w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingClasses ? (
                        <option value="">Đang tải danh sách lớp học...</option>
                      ) : classes.length === 0 ? (
                        <option value="">Không có lớp học đủ điều kiện đánh giá</option>
                      ) : (
                        classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.tutor_name} - Môn {item.subject}
                          </option>
                        ))
                      )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {currentClass && (
                    <p className="mt-2 text-xs text-slate-400">
                      Bạn đang đánh giá gia sư{' '}
                      <span className="font-semibold text-blue-600">
                        {currentClass.tutor_name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-800">
                      Mức độ hài lòng
                      <span className="ml-1 font-medium text-slate-400">
                        (1 - 5 sao)
                      </span>
                    </label>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                      {rating === 5
                        ? 'Tuyệt vời'
                        : rating === 4
                        ? 'Rất tốt'
                        : rating === 3
                        ? 'Bình thường'
                        : rating === 2
                        ? 'Chưa tốt'
                        : 'Không hài lòng'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
                    <div
                      className="flex items-center gap-1 sm:gap-2"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Đánh giá ${star} sao`}
                          aria-pressed={rating === star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="rounded-lg p-1 transition duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                          <Star
                            className={`size-8 sm:size-9 ${
                              (hoverRating || rating) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-100 text-slate-200'
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>

                    <span className="ml-2 text-sm font-bold text-slate-800">
                      {rating}
                      <span className="font-medium text-slate-400"> / 5 sao</span>
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="mt-8 flex flex-1 flex-col">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label
                      htmlFor="review-comment"
                      className="text-sm font-bold text-slate-800"
                    >
                      Nhận xét chi tiết
                    </label>

                    <span className="text-xs text-slate-400">
                      {comment.length}/500
                    </span>
                  </div>

                  <textarea
                    id="review-comment"
                    rows={5}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Hãy chia sẻ cảm nhận của bạn về phương pháp giảng dạy, kiến thức và thái độ của gia sư..."
                    className="min-h-[150px] w-full flex-1 resize-y rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Submit */}
                <div className="mt-7">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingClasses ||
                      classes.length === 0 ||
                      !comment.trim()
                    }
                    className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 hover:shadow-[0_12px_25px_rgba(37,99,235,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Đang gửi đánh giá...
                      </>
                    ) : (
                      <>
                        <Send className="size-5 transition-transform group-hover:translate-x-1" />
                        Gửi đánh giá
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    Đánh giá của bạn góp phần xây dựng cộng đồng học tập uy tín
                  </p>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
