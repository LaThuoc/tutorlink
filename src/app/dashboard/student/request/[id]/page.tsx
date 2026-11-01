'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import { 
  ArrowLeft, CheckCircle2, Clock, XCircle, 
  Phone, Mail, BookOpen, MapPin, User, ShieldCheck, Loader2 
} from 'lucide-react';

type RequestDetail = {
  id: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  created_at: string;
  subject: string;
  message?: string;
  contact_phone: string;
  tutor: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
};

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      const { data } = await supabase
        .from('booking_requests')
        .select(`
          id,
          status,
          created_at,
          subject,
          message,
          contact_phone,
          tutor:tutor_id (
            id,
            full_name,
            avatar_url,
            phone,
            email,
            address
          )
        `)
        .eq('id', id)
        .single();

      if (data) {
        setRequest(data as unknown as RequestDetail);
      }
      setLoading(false);
    }

    fetchDetail();
  }, [id, supabase]);

  const handleStartClass = async () => {
    if (!request) return;
    setUpdating(true);

    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'Completed', updated_at: new Date().toISOString() })
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, status: 'Completed' });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy yêu cầu</h2>
        <Link href="/dashboard/student" className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold">
          <ArrowLeft className="size-4" /> Quay về bảng điều khiển
        </Link>
      </div>
    );
  }

  const isAccepted = request.status === 'Accepted' || request.status === 'Completed';

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </Link>

          <span className="text-xs font-semibold text-slate-500">Mã yêu cầu: #{request.id.slice(0, 8)}</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Chi tiết yêu cầu học</h1>
              <p className="text-xs text-slate-500 mt-1">Gửi ngày {new Date(request.created_at).toLocaleDateString('vi-VN')}</p>
            </div>

            <div>
              {request.status === 'Pending' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
                  <Clock className="size-4" /> Đang chờ gia sư phản hồi
                </span>
              )}
              {request.status === 'Accepted' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-4" /> Gia sư đã chấp nhận
                </span>
              )}
              {request.status === 'Completed' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200">
                  <BookOpen className="size-4" /> Đã hoàn thành khóa học
                </span>
              )}
              {request.status === 'Rejected' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700 border border-rose-200">
                  <XCircle className="size-4" /> Gia sư đã từ chối
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Môn đăng ký</span>
              <p className="mt-1 font-bold text-slate-900">{request.subject}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Số điện thoại để liên hệ</span>
              <p className="mt-1 font-bold text-blue-600">{request.contact_phone}</p>
            </div>
          </div>

          {request.message && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">Lời nhắn: </span> {request.message}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="size-5 text-blue-600" /> Thông tin gia sư
          </h2>

          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="grid size-14 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md">
              {request.tutor.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{request.tutor.full_name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="size-3.5" /> {request.tutor.address || 'Địa chỉ đang cập nhật'}
              </p>
            </div>
          </div>

          {isAccepted ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" /> Đã mở khóa thông tin liên hệ trực tiếp!
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={`tel:${request.tutor.phone}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">SĐT Gia sư</span>
                    <p className="font-bold text-slate-900">{request.tutor.phone || 'Đang cập nhật'}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${request.tutor.email}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Email Gia sư</span>
                    <p className="font-bold text-slate-900 truncate">{request.tutor.email || 'Đang cập nhật'}</p>
                  </div>
                </a>
              </div>

              {request.status === 'Accepted' && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleStartClass}
                    disabled={updating}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    {updating ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                    Đánh dấu đã hoàn thành
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500">
              🔒 Thông tin liên hệ của gia sư sẽ hiển thị khi yêu cầu được chuyển sang trạng thái &quot;Accepted&quot;.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}