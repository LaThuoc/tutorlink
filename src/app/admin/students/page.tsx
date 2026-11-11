'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { 
  Users, Search, Filter, Eye, UserX, UserCheck, Loader2, Mail, Phone, MapPin
} from 'lucide-react';
import { StudentDetailModal, StudentProfileData } from '../_components/StudentDetailModal';
import { createClient } from '@/src/lib/supabase/client';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

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
          created_at
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Lỗi từ Supabase:', error.message);
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
    const actionText = nextStatus === 'blocked' ? 'KHÓA' : 'MỞ KHÓA';

    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản học viên này?`)) return;

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
      } else {
        alert(`Lỗi khi ${actionText.toLowerCase()} tài khoản: ` + error.message);
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
    </div>
  );
}