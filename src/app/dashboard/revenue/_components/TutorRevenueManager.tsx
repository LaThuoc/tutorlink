'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition, useEffect } from 'react';
import { 
  DollarSign, CheckCircle2, RotateCcw, Wallet, Calendar, 
  Phone, Loader2, AlertCircle, TrendingUp, Trash2, CheckSquare, Square
} from 'lucide-react';
import { RevenueDashboardData, StudentRevenueSummary } from '@/src/types/revenue.type';
import { resetStudentBalance} from '@/src/modules/tutor/revenue';
import { archiveOrDeleteStudentRevenue } from '@/src/modules/tutor/deletePageTutor';

interface Props {
  initialData: RevenueDashboardData;
}
function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
export default function TutorRevenueManager({ initialData }: Props) {
  const router = useRouter()
  const [data, setData] = useState<RevenueDashboardData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [activeResetId, setActiveResetId] = useState<string | null>(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

   const [confirmingResetStudent, setConfirmingResetStudent] = useState<StudentRevenueSummary | null>(null);
  const [confirmingDeleteIds, setConfirmingDeleteIds] = useState<string[] | null>(null);

  const handleSelectAll = () => {
    if (selectedStudentIds.length === data.studentSummaries.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(data.studentSummaries.map((s) => s.studentId));
    }
  };
  const handleToggleSelect = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };


   const openDeleteModal = (idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setConfirmingDeleteIds(idsToDelete);
  };

  const confirmDeleteStudents = () => {
    if (!confirmingDeleteIds || confirmingDeleteIds.length === 0) return;

    const targetIds = confirmingDeleteIds;
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(async () => {
      let hasError = false;

      for (const id of targetIds) {
        const res = await archiveOrDeleteStudentRevenue(id);
        if (!res.success) {
          hasError = true;
          setErrorMsg(res.error || 'Có lỗi xảy ra khi dọn dẹp dữ liệu.');
          break;
        }
      }

      if (!hasError) {
        setData((prev) => ({
          ...prev,
          studentSummaries: prev.studentSummaries.filter(
            (s) => !targetIds.includes(s.studentId)
          ),
        }));
        setSelectedStudentIds((prev) => prev.filter((id) => !targetIds.includes(id)));
        setSuccessMsg(`Đã dọn dẹp thành công ${targetIds.length} học viên khỏi danh sách hiển thị.`);
        router.refresh();
      }
      setConfirmingDeleteIds(null);
    });
  };

  const openResetModal = (student: StudentRevenueSummary) => {
    setErrorMsg('');
    setSuccessMsg('');
    setConfirmingResetStudent(student);
  };

  const confirmResetBalance = () => {
    if (!confirmingResetStudent) return;

    const targetStudent = confirmingResetStudent;
    setErrorMsg('');
    setSuccessMsg('');
    setActiveResetId(targetStudent.studentId);

    startTransition(async () => {
      const res = await resetStudentBalance(targetStudent.studentId);
      setActiveResetId(null);

      if (res.success) {
        setData((prev) => {
          const updatedSummaries = prev.studentSummaries.map((s) => {
            if (s.studentId === targetStudent.studentId) {
              return {
                ...s,
                paidAmount: s.paidAmount + s.unpaidAmount,
                unpaidAmount: 0,
                unpaidLessonsCount: 0,
              };
            }
            return s;
          });

          return {
            ...prev,
            totalPaidRevenue: prev.totalPaidRevenue + targetStudent.unpaidAmount,
            totalUnpaidRevenue: prev.totalUnpaidRevenue - targetStudent.unpaidAmount,
            studentSummaries: updatedSummaries,
          };
        });
        setSuccessMsg(
          `Đã xác nhận thu tiền và reset học phí của học viên ${targetStudent.studentName} về 0đ.`
        );
        router.refresh(); 
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi reset số tiền.');
      }
      setConfirmingResetStudent(null);
    });
  };


  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg('');
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMsg]);

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg('');
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMsg]);
  
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý Doanh thu & Học phí</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi thu nhập từ các buổi học đã hoàn thành và quản lý việc đóng học phí của sinh viên.
        </p>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md shadow-blue-600/15 space-y-2">
          <div className="flex items-center justify-between opacity-80 text-xs font-bold">
            <span>TỔNG DOANH THU ĐÃ THU</span>
            <Wallet className="size-5" />
          </div>
          <b className="text-3xl font-black block">
            {data.totalPaidRevenue.toLocaleString('vi-VN')}đ
          </b>
          <p className="text-[11px] text-blue-100">Số tiền sinh viên đã thanh toán hoàn tất.</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>DOANH THU CHỜ THU (CẦN THU)</span>
            <DollarSign className="size-5 text-amber-500" />
          </div>
          <b className="text-3xl font-black text-amber-600 block">
            {data.totalUnpaidRevenue.toLocaleString('vi-VN')}đ
          </b>
          <p className="text-[11px] text-slate-400">Tổng tiền từ các buổi đã học xong chưa thu.</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>TỔNG DOANH THU DỰ KIẾN</span>
            <TrendingUp className="size-5 text-emerald-500" />
          </div>
          <b className="text-3xl font-black text-slate-900 block">
            {(data.totalPaidRevenue + data.totalUnpaidRevenue).toLocaleString('vi-VN')}đ
          </b>
          <p className="text-[11px] text-slate-400">Tất cả các buổi học đã hoàn thành.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh sách Học phí Sinh viên</h2>
            <p className="text-xs text-slate-400">Theo dõi số tiền nợ/chưa đóng của từng học viên sau mỗi buổi học.</p>
          </div>

          {data.studentSummaries.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer px-2 py-1"
              >
                {selectedStudentIds.length === data.studentSummaries.length ? (
                  <CheckSquare className="size-4 text-blue-600" />
                ) : (
                  <Square className="size-4 text-slate-400" />
                )}
                <span>
                  {selectedStudentIds.length === data.studentSummaries.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </span>
              </button>

              {selectedStudentIds.length > 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => openDeleteModal(selectedStudentIds)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Xóa danh sách ({selectedStudentIds.length}) học viên đã chọn
                </button>
              )}
            </div>
          )}
        </div>

        {data.studentSummaries.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu học viên nào hoàn thành buổi học.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.studentSummaries.map((st) => {
              const isSelected = selectedStudentIds.includes(st.studentId);

              return (
                <div 
                  key={st.studentId}
                  className={`border rounded-2xl p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10' : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(st.studentId)}
                      className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />

                    {st.avatarUrl ? (
                      <img src={st.avatarUrl} alt={st.studentName} className="size-11 rounded-full object-cover ring-2 ring-blue-50" />
                    ) : (
                      <div className="size-11 rounded-full bg-blue-100 text-blue-600 font-bold grid place-items-center text-xs">
                        {st.studentName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{st.studentName}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{capitalizeFirst(st.subject)}</p>
                      {st.phone && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" /> {st.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs flex-1 max-w-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Đã học xong chưa đóng</span>
                      <b className="text-amber-600 font-bold text-sm block">
                        {st.unpaidAmount.toLocaleString('vi-VN')}đ
                      </b>
                      <small className="text-slate-400 font-medium">({st.unpaidLessonsCount} buổi)</small>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Đã thanh toán</span>
                      <b className="text-emerald-600 font-bold text-sm block">
                        {st.paidAmount.toLocaleString('vi-VN')}đ
                      </b>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex items-center gap-2">
                    {st.unpaidAmount > 0 ? (
                      <button
                        disabled={isPending && activeResetId === st.studentId}
                        onClick={() => openResetModal(st)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isPending && activeResetId === st.studentId ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RotateCcw className="size-4" />
                        )}
                        Đã thu tiền
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                        <CheckCircle2 className="size-4" /> Đã hoàn tất học phí
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openDeleteModal([st.studentId])}
                      title="Dọn dẹp danh sách sinh viên nghỉ học"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="size-4 text-blue-600" /> Thống kê theo tháng
        </h2>
        {data.monthlyStats.length === 0 ? (
          <p className="text-xs text-slate-400">Chưa có số liệu thống kê theo tháng.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.monthlyStats.map((m) => (
              <div key={m.monthYear} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Tháng {m.monthYear}</span>
                <b className="text-xl font-extrabold text-slate-900 block">
                  {m.totalAmount.toLocaleString('vi-VN')}đ
                </b>
                <span className="text-[11px] text-blue-600 font-medium">
                  {m.completedLessonsCount} buổi hoàn thành
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

        {confirmingResetStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
                <Wallet className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận đã thu học phí</h3>
                <p className="text-[11px] text-slate-400">Cập nhật trạng thái thanh toán & doanh thu thực nhận</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Xác nhận học viên <b className="text-slate-900">{confirmingResetStudent.studentName}</b> đã thanh toán số tiền:
              </p>
              <div className="text-xl font-black text-emerald-600">
                {confirmingResetStudent.unpaidAmount.toLocaleString('vi-VN')}đ
                <span className="text-xs font-semibold text-slate-500 ml-1.5">
                  ({confirmingResetStudent.unpaidLessonsCount} buổi học)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
                Sau khi xác nhận, số tiền chưa đóng của học viên này sẽ được đặt lại về <b className="text-slate-800">0đ</b> và cộng vào Tổng doanh thu đã thu.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmingResetStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmResetBalance}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Xác nhận đã thu tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingDeleteIds && confirmingDeleteIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmingDeleteIds.length === 1
                    ? 'Dọn dẹp dữ liệu học viên'
                    : `Dọn dẹp ${confirmingDeleteIds.length} học viên đã chọn`}
                </h3>
                <p className="text-[11px] text-slate-400">An toàn tuyệt đối cho dữ liệu doanh thu đã ghi nhận</p>
              </div>
            </div>

            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {confirmingDeleteIds.length === 1
                  ? 'Bạn có chắc chắn muốn ẩn học viên này khỏi danh sách quản lý học phí?'
                  : `Bạn có chắc chắn muốn ẩn ${confirmingDeleteIds.length} học viên đã chọn khỏi danh sách quản lý học phí?`}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-rose-200/50">
                <b className="text-slate-700">Lưu ý:</b> Các buổi đã học xong vẫn được <b className="text-emerald-700">GIỮ NGUYÊN</b> để bảo toàn tổng doanh thu của bạn; chỉ các buổi chưa học được dọn dẹp khỏi giao diện.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmingDeleteIds(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDeleteStudents}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Xác nhận dọn dẹp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}