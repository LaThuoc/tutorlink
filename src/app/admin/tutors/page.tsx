'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { processFirstTimeProfile } from '@/src/modules/auth/actions/admin';
import { createClient } from '@/src/lib/supabase/client';
import { UserCheck, Search, Loader2, AlertCircle } from 'lucide-react';
import { TutorDetailModal, TutorProfileData } from '../_components/TutorDetailModal';
import { TutorCard } from '../_components/TutorCard';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<TutorProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfileData | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const supabase = createClient();

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
    let reason = '';
    if (action === 'Reject') {
      const input = prompt('Nhập lý do từ chối hồ sơ gia sư này:');
      if (input === null) return;
      reason = input || 'Hồ sơ chưa đạt yêu cầu';
    } else {
      if (!confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT hồ sơ gia sư này không?`)) return;
    }

    setErrorMsg('');
    startTransition(async () => {
      const res = await processFirstTimeProfile(tutorId, action, reason);
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
      } else {
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

      {/* DANH SÁCH GIA SƯ */}
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
    </div>
  );
}