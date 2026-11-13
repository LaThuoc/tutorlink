'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { 
  Users, Search, Filter, Eye, UserX, UserCheck, Loader2, Mail, Phone, MapPin,
  CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { StudentDetailModal, StudentProfileData } from '../_components/StudentDetailModal';
import { createClient } from '@/src/lib/supabase/client';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmingBlockAction, setConfirmingBlockAction] = useState<{
    studentId: string;
    studentName: string;
    nextStatus: 'active' | 'blocked';
  } | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);
  const [isPending, startTransition] = useTransition();

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

    const loadStudents = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          address,
          province,
          district,
          date_of_birth,
          gender,
          status,
          created_at
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Lỗi từ Supabase:', error.message);
      }

      if (isMounted) {
        if (!error && data) {
          const formattedData = data.map((item) => ({
            ...item,
            user_id: item.id,
            status: 'active' as const
          })) as unknown as StudentProfileData[];
          setStudents(formattedData);
        }
        setLoading(false);
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleBlockStatus = (studentId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const foundStudent = students.find((s) => s.user_id === studentId);
    const studentName = foundStudent?.full_name || 'học viên này';

    setErrorMsg('');
    setSuccessMsg('');
    setConfirmingBlockAction({
      studentId,
      studentName,
      nextStatus,
    });
    
  };
   const confirmToggleBlockStatus = () => {
    if (!confirmingBlockAction) return;

    const { studentId, studentName, nextStatus } = confirmingBlockAction;
    const actionLabel = nextStatus === 'blocked' ? 'khóa' : 'mở khóa';

    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: nextStatus })
        .eq('id', studentId);

      if (!error) {
        setStudents((prev) => 
          prev.map((item) => item.user_id === studentId ? { ...item, status: nextStatus } : item)
        );
        if (selectedStudent && selectedStudent.user_id === studentId) {
          setSelectedStudent((prev) => prev ? { ...prev, status: nextStatus } : null);
        }
        setConfirmingBlockAction(null);
        setSuccessMsg(`Đã ${actionLabel} tài khoản của ${studentName} thành công.`);
      } else {
        setConfirmingBlockAction(null);
        setErrorMsg(`Lỗi khi ${actionLabel} tài khoản: ` + error.message);
      }
    });
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));

    const matchesStatus = 
      statusFilter === 'all' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status !== 'blocked').length;
  const blockedStudents = students.filter(s => s.status === 'blocked').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="size-6 text-blue-600" />
            Quản lý Học viên & Phụ huynh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách tất cả tài khoản Học viên / Phụ huynh đăng ký trên nền tảng GiaSuHub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Tổng số Học viên</span>
          <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Hoạt động bình thường</span>
          <p className="text-2xl font-black text-emerald-600">{activeStudents}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Tài khoản bị khóa</span>
          <p className="text-2xl font-black text-rose-600">{blockedStudents}</p>
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


      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="size-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center gap-2">
            <Loader2 className="size-7 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Đang tải danh sách học viên...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users className="size-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy học viên nào</h3>
            <p className="text-xs text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Học viên / Phụ huynh</th>
                  <th className="p-4">Email / Số điện thoại</th>
                  <th className="p-4">Khu vực</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((item) => {
                  const isBlocked = item.status === 'blocked';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt="" className="size-10 rounded-xl object-cover border border-slate-100" />
                          ) : (
                            <div className="size-10 rounded-xl bg-blue-100 text-blue-700 font-black grid place-items-center text-xs">
                              {item.full_name?.slice(0, 2).toUpperCase() || 'HV'}
                            </div>
                          )}
                          <span className="font-bold text-slate-900">{item.full_name || 'Chưa đặt tên'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5 font-medium text-slate-600">
                          <p className="flex items-center gap-1.5"><Mail className="size-3 text-slate-400" /> {item.email}</p>
                          {item.phone && <p className="flex items-center gap-1.5"><Phone className="size-3 text-slate-400" /> {item.phone}</p>}
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {item.province ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-slate-400" />
                            {item.district ? `${item.district}, ${item.province}` : item.province}
                          </span>
                        ) : <span className="text-slate-400">Chưa cập nhật</span>}
                      </td>

                      <td className="p-4">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            Bị khóa
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="size-4" />
                          </button>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleBlockStatus(item.user_id, item.status)}
                            className={`p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                              isBlocked 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title={isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {isBlocked ? <UserCheck className="size-4" /> : <UserX className="size-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL XEM CHI TIẾT HỌC VIÊN */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onToggleBlockStatus={handleToggleBlockStatus}
        isPending={isPending}
      />
       {confirmingBlockAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {confirmingBlockAction.nextStatus === 'blocked' ? (
                  <>
                    <UserX className="size-5 text-rose-600" />
                    Xác nhận khóa tài khoản
                  </>
                ) : (
                  <>
                    <UserCheck className="size-5 text-emerald-600" />
                    Xác nhận mở khóa tài khoản
                  </>
                )}
              </h3>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmingBlockAction(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              className={`rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed border ${
                confirmingBlockAction.nextStatus === 'blocked'
                  ? 'bg-rose-50/40 border-rose-100'
                  : 'bg-emerald-50/40 border-emerald-100'
              }`}
            >
              <p>
                Bạn có chắc chắn muốn{' '}
                <strong
                  className={
                    confirmingBlockAction.nextStatus === 'blocked'
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }
                >
                  {confirmingBlockAction.nextStatus === 'blocked' ? 'KHÓA' : 'MỞ KHÓA'}
                </strong>{' '}
                tài khoản của học viên{' '}
                <strong className="text-slate-900">{confirmingBlockAction.studentName}</strong>?
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                {confirmingBlockAction.nextStatus === 'blocked'
                  ? 'Học viên này sẽ không thể đăng nhập hoặc đặt lịch học mới cho đến khi được mở khóa lại.'
                  : 'Học viên này sẽ có thể đăng nhập và sử dụng lại đầy đủ tính năng trên hệ thống.'}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmingBlockAction(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmToggleBlockStatus}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  confirmingBlockAction.nextStatus === 'blocked'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : confirmingBlockAction.nextStatus === 'blocked' ? (
                  <UserX className="size-4" />
                ) : (
                  <UserCheck className="size-4" />
                )}
                {confirmingBlockAction.nextStatus === 'blocked'
                  ? 'Xác nhận Khóa'
                  : 'Xác nhận Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}