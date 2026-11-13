'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { processFirstTimeProfile } from '@/src/modules/auth/actions/admin';
import { createClient } from '@/src/lib/supabase/client';
import { UserCheck, Search, Loader2, AlertCircle, ShieldCheck, XCircle, CheckCircle2, X } from 'lucide-react';
import { TutorDetailModal, TutorProfileData } from '../_components/TutorDetailModal';
import { TutorCard } from '../_components/TutorCard';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<TutorProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfileData | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    tutorId: string;
    tutorName: string;
    action: 'Approve' | 'Reject';
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const supabase = createClient();

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 5000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(''), 5000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`*, profiles (*)`)
        .order('created_at', { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setTutors(data as unknown as TutorProfileData[]);
        }
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);


   const handleReviewTutor = (tutorId: string, action: 'Approve' | 'Reject') => {
    const targetTutor = tutors.find((t) => t.user_id === tutorId);
    const tutorName = targetTutor?.profiles?.full_name || 'gia sư này';

    setErrorMsg('');
    setSuccessMsg('');
    setRejectionReason('');
    setReviewModal({
      tutorId,
      tutorName,
      action,
    });
  };

  const confirmReviewTutor = ()=> {
    
    if (!reviewModal) return;

    const { tutorId, tutorName, action } = reviewModal;
    const finalReason = action === 'Reject' ? (rejectionReason.trim() || 'Hồ sơ chưa đạt yêu cầu') : '';
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(async () => {
      const res = await processFirstTimeProfile(tutorId, action, finalReason);
      if (res?.success) {
        setTutors((prev) =>
          prev.map((t) =>
            t.user_id === tutorId
              ? { 
                  ...t, 
                  verification_status: action === 'Approve' ? 'Approved' : 'Rejected', 
                  status: action === 'Approve' ? 'approved' : 'rejected' 
                }
              : t
          )
        );
        if (selectedTutor?.user_id === tutorId) {
          setSelectedTutor((prev) => 
            prev 
              ? { 
                  ...prev, 
                  verification_status: action === 'Approve' ? 'Approved' : 'Rejected', 
                  status: action === 'Approve' ? 'approved' : 'rejected' 
                } 
              : null
          );
        }
        setReviewModal(null);
        setRejectionReason('');
        setSuccessMsg(
          action === 'Approve'
            ? `Đã phê duyệt hồ sơ của gia sư ${tutorName} thành công.`
            : `Đã từ chối hồ sơ của gia sư ${tutorName}.`
        );
      } else {
        setReviewModal(null);
        setErrorMsg(res?.errors || 'Lỗi khi xử lý hồ sơ');
      }
    });
  };

  const filteredTutors = tutors.filter((tutor) => {
    const fullName = tutor.profiles?.full_name?.toLowerCase() || '';
    const email = tutor.profiles?.email?.toLowerCase() || '';
    const school = tutor.school_name?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          email.includes(searchQuery.toLowerCase()) || 
                          school.includes(searchQuery.toLowerCase());

    const isApproved = tutor.verification_status === 'Approved' || tutor.status === 'approved';
    const isRejected = tutor.verification_status === 'Rejected' || tutor.status === 'rejected';
    const isPendingStatus = !isApproved && !isRejected;

    if (statusFilter === 'APPROVED') return matchesSearch && isApproved;
    if (statusFilter === 'PENDING') return matchesSearch && isPendingStatus;
    if (statusFilter === 'REJECTED') return matchesSearch && isRejected;
    return matchesSearch;
  });

  const totalCount = tutors.length;
  const approvedCount = tutors.filter(t => t.verification_status === 'Approved' || t.status === 'approved').length;
  const pendingCount = tutors.filter(t => t.verification_status !== 'Approved' && t.status !== 'approved' && t.verification_status !== 'Rejected' && t.status !== 'rejected').length;

  return (
    <div className="space-y-6">
      {/* HEADER & THỐNG KÊ NHANH */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="size-6 text-indigo-600" /> Quản lý & Duyệt Gia sư
          </h1>
          <p className="text-xs text-slate-500 mt-1">Kiểm duyệt hồ sơ đăng ký lần đầu và quản lý danh sách gia sư.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold">
            Tổng: <span className="px-2 py-0.5 rounded-lg bg-white text-slate-900 shadow-xs">{totalCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
            Đã duyệt: <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white">{approvedCount}</span>
          </div>
          {pendingCount > 0 && (
            <div className="px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 animate-pulse">
              Chờ duyệt: <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white">{pendingCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* TIM KIEM VÀ TABS LỌC */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên gia sư, email, trường..."
            className="w-full bg-slate-50 text-xs pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition-colors text-slate-800"
          />
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' 
                ? `Tất cả (${totalCount})` 
                : tab === 'PENDING' 
                ? `Chờ duyệt (${pendingCount})` 
                : tab === 'APPROVED' 
                ? `Đã duyệt (${approvedCount})` 
                : 'Bị từ chối'}
            </button>
          ))}
        </div>
      </div>

      {/* THÔNG BÁO LỖI NẾU CÓ */}
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

      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Đang tải danh sách...</span>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
          <UserCheck className="size-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Không tìm thấy gia sư nào</h3>
          <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTutors.map((item) => (
            <TutorCard
              key={item.user_id}
              item={item}
              isPending={isPending}
              onReview={handleReviewTutor}
              onSelect={setSelectedTutor}
            />
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      <TutorDetailModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onApprove={(id) => handleReviewTutor(id, 'Approve')}
        isPending={isPending}
      />
       {reviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {reviewModal.action === 'Approve' ? (
                  <>
                    <ShieldCheck className="size-5 text-emerald-600" />
                    Xác nhận phê duyệt hồ sơ
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-rose-600" />
                    Từ chối hồ sơ gia sư
                  </>
                )}
              </h3>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setReviewModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            {reviewModal.action === 'Approve' ? (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT</strong> hồ sơ của gia sư{' '}
                  <strong className="text-slate-900">{reviewModal.tutorName}</strong>?
                </p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
                  Sau khi phê duyệt, hồ sơ gia sư sẽ được hiển thị công khai và có thể nhận yêu cầu học từ học viên.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vui lòng nhập lý do từ chối hồ sơ của gia sư{' '}
                  <strong className="text-slate-800">{reviewModal.tutorName}</strong> (nếu để trống hệ thống sẽ dùng lý do mặc định):
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Hồ sơ thiếu thông tin bằng cấp, mô tả chưa rõ ràng..."
                  className="w-full h-28 p-3.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-slate-800"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setReviewModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmReviewTutor}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  reviewModal.action === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : reviewModal.action === 'Approve' ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {reviewModal.action === 'Approve' ? 'Xác nhận Phê duyệt' : 'Xác nhận Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}