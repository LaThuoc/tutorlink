'use client';

import React, { useState, useTransition } from 'react';
import { 
  CheckCircle2, XCircle, Clock, MessageSquare, Phone, BookOpen, 
  Calendar, AlertCircle, Loader2, Filter, Trash2, CheckSquare, Square
} from 'lucide-react';
import { BookingRequestItem, BookingStatus } from '@/src/types/tutor.type';
import { updateBookingStatus } from '@/src/modules/tutor/getStudentRequest';
import { deleteBookingRequests } from '@/src/modules/tutor/deletePageTutor';

export interface ScheduleSlotDB {
  id: string;
  dayOfWeek: number | string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

interface Props {
  initialRequests: BookingRequestItem[];
  tutorSchedules?: ScheduleSlotDB[];
}

const MAP_DAY_NUMBER: Record<number | string, string> = {
  1: 'Chủ nhật',
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
  8: 'Chủ nhật',
};

const FALLBACK_SLOT_MAP: Record<string, string> = {
  'slot_mon_night': 'Thứ 2 (19:00 - 21:00)',
  'slot_wed_night': 'Thứ 4 (18:00 - 20:00)',
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; badge: string; icon: React.ElementType }> = {
  Pending: { label: 'Đang chờ xử lý', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  Accepted: { label: 'Đã chấp nhận', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  Rejected: { label: 'Đã từ chối', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  Cancelled: { label: 'Học viên đã hủy', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertCircle },
  Completed: { label: 'Đã hoàn thành', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
};

export default function BookingRequestsManager({ initialRequests, tutorSchedules = [] }: Props) {
  const [requests, setRequests] = useState<BookingRequestItem[]>(initialRequests);
  const [filter, setFilter] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const renderScheduleText = (slotId: string | null) => {
    if (!slotId) return 'Thỏa thuận trực tiếp';

    const foundSlot = tutorSchedules.find((s) => s.id === slotId);
    if (foundSlot) {
      let dayText = '';
      const dayVal = foundSlot.dayOfWeek;

      if (MAP_DAY_NUMBER[dayVal]) {
        dayText = MAP_DAY_NUMBER[dayVal];
      } else if (typeof dayVal === 'number') {
        dayText = `Thứ ${dayVal}`;
      } else {
        dayText = String(dayVal).includes('Thứ') || String(dayVal).includes('Chủ') 
          ? String(dayVal) 
          : `Thứ ${dayVal}`;
      }

      const timeText = foundSlot.startTime && foundSlot.endTime 
        ? ` (${foundSlot.startTime} - ${foundSlot.endTime})` 
        : '';

      return `${dayText}${timeText}`;
    }

    if (FALLBACK_SLOT_MAP[slotId]) {
      return FALLBACK_SLOT_MAP[slotId];
    }

    if (slotId.includes('Thứ') || slotId.includes('Chủ nhật')) {
      return slotId;
    }

    return `Lịch ID: ${slotId.slice(0, 8)}...`;
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

  const countPending = requests.filter((r) => r.status === 'Pending').length;

  const handleSelectAll = () => {
    const filteredIds = filteredRequests.map((r) => r.id);
    const isAllSelected = filteredIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedIds, ...filteredIds]));
      setSelectedIds(newSelected);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteBatch = (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;

    const confirmMsg = idsToDelete.length === 1
      ? 'Bạn có chắc chắn muốn xóa yêu cầu đăng ký này khỏi danh sách?'
      : `Bạn có chắc chắn muốn xóa ${idsToDelete.length} yêu cầu đăng ký đã chọn?`;

    if (!confirm(confirmMsg)) return;

    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteBookingRequests(idsToDelete);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => !idsToDelete.includes(r.id)));
        setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      } else {
        setErrorMsg(res.error || 'Lỗi khi xóa yêu cầu');
      }
    });
  };

  const handleAccept = (req: BookingRequestItem) => {
    if (!confirm(`Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu dạy môn ${req.subject} cho học viên ${req.student?.full_name || 'này'}?`)) {
      return;
    }

    setErrorMsg('');
    startTransition(async () => {
      const res = await updateBookingStatus(req.id, 'Accepted');
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: 'Accepted' as BookingStatus } : r))
        );
      } else {
        setErrorMsg(res.errors || 'Lỗi khi chấp nhận yêu cầu');
      }
    });
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectionReason('Gia sư bận lịch học khác');
    setErrorMsg('');
  };

  const confirmReject = () => {
    if (!rejectingId) return;

    setErrorMsg('');
    startTransition(async () => {
      const res = await updateBookingStatus(rejectingId, 'Rejected', rejectionReason);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === rejectingId
              ? { ...r, status: 'Rejected' as BookingStatus, rejection_reason: rejectionReason }
              : r
          )
        );
        setRejectingId(null);
      } else {
        setErrorMsg(res.errors || 'Lỗi khi từ chối yêu cầu');
      }
    });
  };

  const isAllFilteredSelected = filteredRequests.length > 0 && 
    filteredRequests.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Yêu cầu học từ sinh viên</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và phản hồi các đề nghị đăng ký học từ học viên gửi đến bạn.
          </p>
        </div>
        {countPending > 0 && (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            Có {countPending} yêu cầu đang chờ phản hồi
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả', count: requests.length },
            { key: 'Pending', label: 'Đang chờ', count: requests.filter((r) => r.status === 'Pending').length },
            { key: 'Accepted', label: 'Đã chấp nhận', count: requests.filter((r) => r.status === 'Accepted').length },
            { key: 'Rejected', label: 'Đã từ chối', count: requests.filter((r) => r.status === 'Rejected').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filteredRequests.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer px-2 py-1"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="size-4 text-blue-600" />
              ) : (
                <Square className="size-4 text-slate-400" />
              )}
              <span>{isAllFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteBatch(selectedIds)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Xóa {selectedIds.length} đã chọn
              </button>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
          <div className="size-16 bg-slate-50 text-slate-400 rounded-full grid place-items-center mx-auto">
            <Filter className="size-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không có yêu cầu học nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'Hiện tại bạn chưa nhận được yêu cầu đăng ký học nào từ học viên.'
              : `Không có yêu cầu nào ở trạng thái "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => {
            const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
            const StatusIcon = statusConfig.icon;
            const studentName = req.student?.full_name || 'Học viên ẩn danh';
            const avatarUrl = req.student?.avatar_url;
            const isSelected = selectedIds.includes(req.id);

            const formattedLessonDate = req.lesson_date 
              ? new Date(req.lesson_date).toLocaleDateString('vi-VN')
              : 'Chưa chọn ngày';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all space-y-4 relative ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(req.id)}
                      className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={studentName}
                        className="size-12 rounded-full object-cover ring-2 ring-blue-50"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-blue-100 text-blue-600 font-bold grid place-items-center text-sm">
                        {studentName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{studentName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        Gửi lúc: {new Date(req.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badge}`}
                    >
                      <StatusIcon className="size-3.5" />
                      {statusConfig.label}
                    </span>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteBatch([req.id])}
                      title="Xóa yêu cầu này"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Môn học đăng ký</span>
                    <span className="font-bold text-blue-600 text-sm flex items-center gap-1.5">
                      <BookOpen className="size-4" />
                      {req.subject}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Số điện thoại liên hệ</span>
                    <a
                      href={`tel:${req.contact_phone}`}
                      className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5"
                    >
                      <Phone className="size-4 text-emerald-600" />
                      {req.contact_phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Ngày bắt đầu học</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="size-4 text-blue-600" />
                      {formattedLessonDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Khung giờ trong tuần</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="size-4 text-amber-600" />
                      {renderScheduleText(req.schedule_slot_id)}
                    </span>
                  </div>
                </div>

                {req.message && (
                  <div className="text-xs text-slate-700 bg-blue-50/40 border border-blue-100 p-3.5 rounded-2xl space-y-1">
                    <b className="text-blue-900 flex items-center gap-1.5 font-bold">
                      <MessageSquare className="size-3.5 text-blue-600" /> Lời nhắn từ học viên:
                    </b>
                    <p className="italic leading-relaxed text-slate-600">{`"${req.message}"`}</p>
                  </div>
                )}

                {req.status === 'Rejected' && req.rejection_reason && (
                  <div className="text-xs text-rose-700 bg-rose-50/50 border border-rose-100 p-3.5 rounded-2xl">
                    <b className="block font-bold mb-0.5">Lý do từ chối:</b>
                    <span>{req.rejection_reason}</span>
                  </div>
                )}

                {req.status === 'Pending' && (
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openRejectModal(req.id)}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAccept(req)}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                      Chấp nhận yêu cầu
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Từ chối yêu cầu dạy học</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng nhập lý do từ chối để hệ thống gửi thông báo thỏa đáng cho học viên.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Lý do từ chối:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: Trùng lịch dạy, Không thuộc khu vực nhận dạy..."
                className="w-full h-24 p-3 border border-slate-200 rounded-2xl text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending || !rejectionReason.trim()}
                onClick={confirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}