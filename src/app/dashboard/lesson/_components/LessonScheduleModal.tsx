'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useTransition } from 'react';
import { 
  X, Calendar, Clock, CheckCircle2, DollarSign, Loader2, AlertCircle, 
  BookOpen, ChevronLeft, ChevronRight, Wallet 
} from 'lucide-react';
import { getOrGenerateLessons, completeSingleLesson, LessonSession } from '@/src/modules/tutor/getStudentRequest';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  studentName: string;
  subject: string;
}

export default function LessonScheduleModal({
  isOpen,
  onClose,
  bookingId,
  studentName,
  subject,
}: Props) {
  const router = useRouter()
  const [lessons, setLessons] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isScheduleMismatch, setIsScheduleMismatch] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [confirmingLesson, setConfirmingLesson] = useState<{id: string; dateStr: string;timeStr?: string} | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  

  useEffect(() => {
    let isMounted = true;

    if (isOpen && bookingId) {
      const fetchData = async () => {
        if (isMounted) {
          setLoading(true);
          setErrorMsg('');
          setIsScheduleMismatch(false);
        }

        const res = await getOrGenerateLessons(bookingId, currentMonth, currentYear);

        if (isMounted) {
          setLoading(false);
          if (res.success && res.lessons) {
            setLessons(res.lessons);
            setIsScheduleMismatch(Boolean(res.isScheduleMismatch));
          } else {
            setErrorMsg(res.error || 'Không thể tải danh sách buổi học');
          }
        }
      };

      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookingId, currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const openCompleteConfirmModal = (lessonId: string, dateStr: string, timeStr?: string) => {
    setActionError('');
    setConfirmingLesson({ id: lessonId, dateStr, timeStr });
  };

  const confirmCompleteLesson = () => {
    if (!confirmingLesson) return;

    const targetId = confirmingLesson.id;
    setCompletingId(targetId);
    setActionError('');

    startTransition(async () => {
      const res = await completeSingleLesson(targetId);
      setCompletingId(null);

      if (res.success) {
        setLessons((prev) =>
          prev.map((item) => (item.id === targetId ? { ...item, status: 'Completed' } : item))
        );
        setConfirmingLesson(null);
        router.refresh(); 
      } else {
        setConfirmingLesson(null);
        setActionError(res.error || 'Có lỗi xảy ra khi hoàn thành buổi học.');
      }
    });
  };


  if (!isOpen) return null;

  const completedCount = lessons.filter((l) => l.status === 'Completed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="size-5 text-blue-600" />
              Lịch học chi tiết - {studentName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Môn học: <span className="font-bold text-blue-600">{subject}</span> · Đã dạy trong tháng: {completedCount}/{lessons.length} buổi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft className="size-4" /> Tháng trước
          </button>

          <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="size-4 text-blue-600" />
            Tháng {currentMonth} / {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Tháng sau <ChevronRight className="size-4" />
          </button>
        </div>


         {actionError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError('')}
              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải lịch học tháng {currentMonth}/{currentYear}...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="size-4" />
            <span>{errorMsg}</span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            Không có lịch học nào trong tháng {currentMonth}/{currentYear}.
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {lessons.map((item, index) => {
              const isCompleted = item.status === 'Completed';
              const isPaid = Boolean(item.is_paid);
              
              const [y, m, d] = item.lesson_date.split('-').map(Number);
              const dateObj = new Date(Date.UTC(y, m - 1, d));
              
              const dateFormatted = dateObj.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                timeZone: 'UTC',
              });
              const displayTime = item.schedule_text?.includes('|')
                ? item.schedule_text.split('|').pop()?.trim()
                : item.schedule_text;


              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 transition-all ${
                    isPaid
                      ? 'border-blue-200 bg-blue-50/40' 
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-xl font-bold text-xs grid place-items-center shrink-0 ${
                      isPaid
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Calendar className="size-3.5 text-blue-600" />
                        <span className="capitalize">{dateFormatted}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="size-3 text-slate-400" />
                        <span>Giờ học: {displayTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {isCompleted ? (
                      isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                          <Wallet className="size-4 text-blue-600" /> Đã thu tiền buổi học này
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="size-4 text-emerald-600" /> Đã dạy xong (Chờ thu tiền)
                        </span>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => openCompleteConfirmModal(item.id, dateFormatted)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {completingId === item.id ? (<Loader2 className="size-3.5 animate-spin" /> ): (<DollarSign className="size-3.5" />)}
                        Đã dạy xong buổi này
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

       {confirmingLesson && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Xác nhận hoàn thành buổi học</h4>
                <p className="text-[11px] text-slate-400">Buổi học sẽ được chuyển sang trạng thái chờ thu tiền</p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>
                Bạn xác nhận đã hoàn thành buổi dạy môn <b className="text-blue-600 capitalize">{subject}</b> cho học viên{' '}
                <b className="text-slate-900">{studentName}</b>?
              </p>
              <div className="pt-1.5 border-t border-slate-200/60 text-[11px] space-y-1">
                <div>
                  Ngày học: <b className="text-slate-800 capitalize">{confirmingLesson.dateStr}</b>
                </div>
                {confirmingLesson.timeStr && (
                  <div>
                    Khung giờ: <b className="text-slate-800">{confirmingLesson.timeStr}</b>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmingLesson(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmCompleteLesson}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Xác nhận đã dạy xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}