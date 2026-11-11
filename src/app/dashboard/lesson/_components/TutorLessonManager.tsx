'use client';

import React, { useState, useTransition } from 'react';
import { 
  BookOpen, Calendar, Clock, CheckCircle2, Filter, Phone, User, 
  ExternalLink, Trash2, CheckSquare, Square, Loader2, AlertCircle
} from 'lucide-react';
import { BookingRequestItem } from '@/src/types/tutor.type';
import LessonScheduleModal from './LessonScheduleModal';
import { deleteAcceptedLessons } from '@/src/modules/tutor/deletePageTutor';

interface Props {
  initialLessons: BookingRequestItem[];
}

export default function TutorLessonManager({ initialLessons }: Props) {
  const [lessons, setLessons] = useState<BookingRequestItem[]>(initialLessons);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Completed'>('ALL');
  const [studentFilter, setStudentFilter] = useState<string>('ALL');

  // STATE QUẢN LÝ XÓA (1 HOẶC NHIỀU HỌC VIÊN)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string>('');

  // STATE QUẢN LÝ POPUP MODAL BUỔI HỌC
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    studentName: string;
    subject: string;
  } | null>(null);

  const uniqueStudents = Array.from(
    new Set(lessons.map((l) => l.student?.full_name).filter(Boolean))
  ) as string[];

  const filteredLessons = lessons.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || (item.lesson_status || 'Pending') === statusFilter;
    const matchStudent = studentFilter === 'ALL' || item.student?.full_name === studentFilter;
    return matchStatus && matchStudent;
  });

  const handleSelectAll = () => {
    const filteredIds = filteredLessons.map((l) => l.id);
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

  const handleDelete = (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;

    const confirmMsg = idsToDelete.length === 1
      ? 'Bạn có chắc chắn muốn xóa học viên này khỏi danh sách quản lý lớp?'
      : `Bạn có chắc chắn muốn xóa ${idsToDelete.length} học viên đã chọn khỏi danh sách?`;

    if (!confirm(confirmMsg)) return;

    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteAcceptedLessons(idsToDelete);
      if (res.success) {
        setLessons((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
        setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi xóa học viên');
      }
    });
  };

  const isAllFilteredSelected = filteredLessons.length > 0 && 
    filteredLessons.every((l) => selectedIds.includes(l.id));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý Buổi học theo Sinh viên</h1>
        <p className="text-xs text-slate-500 mt-1">
          Bấm vào sinh viên để mở bảng lịch danh sách tất cả các buổi học trong tháng và điểm danh từng ngày.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: 'ALL', label: 'Tất cả sinh viên', count: lessons.length },
            { key: 'Pending', label: 'Đang giảng dạy', count: lessons.filter((l) => (l.lesson_status || 'Pending') === 'Pending').length },
            { key: 'Completed', label: 'Đã hoàn thành khóa', count: lessons.filter((l) => l.lesson_status === 'Completed').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as 'ALL' | 'Pending' | 'Completed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {uniqueStudents.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <User className="size-3.5 text-blue-600" /> Học viên:
              </span>
              <select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="ALL">Tất cả học viên ({uniqueStudents.length})</option>
                {uniqueStudents.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          )}

          {filteredLessons.length > 0 && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
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
                <span>{isAllFilteredSelected ? 'Bỏ chọn' : 'Chọn tất cả'}</span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(selectedIds)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Xóa ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {filteredLessons.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
          <div className="size-16 bg-slate-50 text-slate-400 rounded-full grid place-items-center mx-auto">
            <Filter className="size-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy sinh viên nào</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((item) => {
            const studentName = item.student?.full_name || 'Học viên ẩn danh';
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 hover:shadow-md transition-all relative ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="size-10 rounded-full bg-blue-100 text-blue-600 font-bold grid place-items-center text-xs">
                      {studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{studentName}</h4>
                      <p className="text-xs text-blue-600 font-bold mt-0.5">{item.subject}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete([item.id])}
                    title="Xóa học viên không còn học nữa"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-blue-600 shrink-0" />
                    <span>Lịch đăng ký: <b>{item.schedule_slot_id || 'Thỏa thuận trực tiếp'}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-emerald-600 shrink-0" />
                    <span>SĐT: <b>{item.contact_phone}</b></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking({
                    id: item.id,
                    studentName,
                    subject: item.subject,
                  })}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="size-4" />
                  Xem lịch học & Điểm danh buổi học
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooking && (
        <LessonScheduleModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          bookingId={selectedBooking.id}
          studentName={selectedBooking.studentName}
          subject={selectedBooking.subject}
        />
      )}
    </div>
  );
}