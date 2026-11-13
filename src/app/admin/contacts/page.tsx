import React from 'react';
import { createClient } from '@/src/lib/supabase/server';
import { Mail, UserCheck, UserX, Clock, CheckCircle2 } from 'lucide-react';
import { ContactActionButtons } from '../_components/ContactActionButtons';

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
  const supabase = await createClient();

  // Truy vấn danh sách tin nhắn kèm thông tin profile nếu người gửi đã đăng nhập
  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-rose-600 font-semibold">
        Lỗi tải danh sách liên hệ: {error.message}
      </div>
    );
  }

  const statusBadge = {
    pending: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    processing: { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    resolved: { label: 'Đã phản hồi', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: 'Lưu trữ', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Hộp thư liên hệ & Hỗ trợ</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý và phản hồi yêu cầu từ học viên, gia sư và khách truy cập.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-5">Người gửi</th>
                <th className="py-4 px-5">Chủ đề & Nội dung</th>
                <th className="py-4 px-5">Trạng thái</th>
                <th className="py-4 px-5">Thời gian</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {messages?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    Chưa có tin nhắn liên hệ nào.
                  </td>
                </tr>
              ) : (
                messages?.map((msg) => {
                  const badge = statusBadge[msg.status as keyof typeof statusBadge] || statusBadge.pending;
                  const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;

                  return (
                    <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors align-top">
                      {/* Cột 1: Định danh người gửi */}
                      <td className="py-4 px-5 min-w-[220px]">
                        <div className="font-bold text-slate-900">{msg.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{msg.email}</div>

                        {/* Hiển thị nhãn định danh tài khoản hệ thống */}
                        {profile ? (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                            <UserCheck className="size-3.5" />
                            <span>
                              Tài khoản: {profile.full_name} ({profile.role === 'tutor' ? 'Gia sư' : 'Học viên'})
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            <UserX className="size-3.5" />
                            <span>Khách vãng lai</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 2: Chủ đề & Nội dung */}
                      <td className="py-4 px-5 max-w-md">
                        <div className="font-bold text-slate-800">{msg.subject}</div>
                        <p className="text-slate-600 text-xs mt-1 whitespace-pre-line leading-relaxed">
                          {msg.message}
                        </p>
                      </td>

                      {/* Cột 3: Trạng thái */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Cột 4: Thời gian */}
                      <td className="py-4 px-5 whitespace-nowrap text-xs text-slate-500">
                        {new Date(msg.created_at).toLocaleString('vi-VN')}
                      </td>

                      {/* Cột 5: Nút phản hồi qua Email & Đổi trạng thái */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <ContactActionButtons 
                          id={msg.id} 
                          email={msg.email} 
                          subject={msg.subject} 
                          currentStatus={msg.status} 
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}