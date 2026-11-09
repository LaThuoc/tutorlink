// === [ĐÃ SỬA / THÊM MỚI]: Thêm toàn bộ Component Modal Đăng ký học BookingModal ===
'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Loader2, Phone, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import { createBookingRequest } from '@/src/modules/student/student.action';
import { TutorActionState } from '@/src/types/tutor.type';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  subjects: string[];
  selectedSlots: Set<string>;
  onSuccess?: () => void;
};

const initialBookingState: TutorActionState = {
  success: false,
};

export default function BookingModal({ isOpen, onClose, tutorId, tutorName, subjects, selectedSlots, onSuccess }: BookingModalProps) {
  const [state, formAction, isPending] = useActionState(createBookingRequest, initialBookingState);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');

  const hasTriggeredSuccess = useRef(false)
  useEffect(() =>{
    if(!isOpen){
      hasTriggeredSuccess.current = false
    }
  }, [isOpen])

  const chosenSlotsList = Array.from(selectedSlots).map((id) => {
    const [date, time] = id.split('|');
    const [y, m, d] = date.split('-');
    return { id, label: `${d}/${m}/${y} (${time})` };
  });

  useEffect(() => {
    if (state?.success && !hasTriggeredSuccess.current) {
      hasTriggeredSuccess.current = true
      if (onSuccess) onSuccess();
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Gửi yêu cầu học</h3>
            <p className="text-xs text-slate-500 mt-0.5">Gửi đăng ký tới gia sư <span className="font-semibold text-blue-600">{tutorName}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {state?.success ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="size-14 text-emerald-500 animate-bounce" />
            <h4 className="mt-3 text-lg font-bold text-slate-900">Gửi yêu cầu thành công!</h4>
            <p className="mt-1 text-xs text-slate-500">Gia sư sẽ phản hồi yêu cầu của bạn trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <form action={formAction} className="mt-5 space-y-4">
            <input type="hidden" name="tutorId" value={tutorId} />
            {Array.from(selectedSlots).map((slotId) => (
              <input key={slotId} type="hidden" name="scheduleSlotIds" value={slotId} />
            ))}

            {state?.errors && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 ring-1 ring-rose-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{state.errors}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Calendar className="size-4 text-blue-600" /> Khung giờ đã chọn ({chosenSlotsList.length})
              </label>
              {chosenSlotsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {chosenSlotsList.map((slot) => (
                    <span key={slot.id} className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      {slot.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 italic">Chưa chọn khung giờ nào (Có thể đăng ký linh hoạt).</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <BookOpen className="size-4 text-blue-600" /> Môn học đăng ký <span className="text-rose-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contactPhone" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Phone className="size-4 text-blue-600" /> Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                required
                placeholder="Nhập số điện thoại của bạn..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MessageSquare className="size-4 text-blue-600" /> Lời nhắn cho gia sư
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Nêu rõ yêu cầu học, tình hình học tập hoặc mong muốn của bạn..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Xác nhận gửi
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}