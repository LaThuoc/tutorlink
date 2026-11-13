'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getPendingCertificates, processNewCertificateRequest } from '@/src/modules/auth/actions/admin'
import { 
  Award, CheckCircle2, XCircle, ExternalLink, Loader2, ShieldCheck, 
  Building2, Calendar, FileText, Eye, AlertCircle, X 
} from 'lucide-react';

export interface CertRequest {
  id: string;
  tutor_id: string;
  certificate_url: string;
  title?: string;
  issued_by?: string;
  issue_year?: string;
  detail?: string;
  status: string;
  created_at: string;
  tutor_profiles?: {
    school_name?: string;
    education?: string;
    profiles?: {
      full_name?: string;
      email?: string;
      phone?: string;
      avatar_url?: string;
    };
  };
}

export default function AdminCertificatesPage() {
  const [requests, setRequests] = useState<CertRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [rejectModalError, setRejectModalError] = useState('');
  const [approvingItem, setApprovingItem] = useState<CertRequest | null>(null);


  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [rejectingItem, setRejectingItem] = useState<CertRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');


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

    const fetchCerts = async () => {
      setLoading(true);
      setErrorMsg('');
      const res = await getPendingCertificates();
      
      if (!isMounted) return;

      if (res.success && res.data) {
        setRequests(res.data as unknown as CertRequest[]);
      } else {
        setErrorMsg(res.error || 'Lỗi khi tải danh sách chứng chỉ');
      }
      setLoading(false);
    };

    fetchCerts();

    return () => {
      isMounted = false;
    };
  }, []);

    const openApproveModal = (item: CertRequest) => {
    setErrorMsg('');
    setSuccessMsg('');
    setApprovingItem(item);
  };

  const confirmApprove = () => {
    if (!approvingItem) return;

    const item = approvingItem;
    const tutorName = item.tutor_profiles?.profiles?.full_name || 'Gia sư';
    const certTitle = item.title || 'bằng cấp';

    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await processNewCertificateRequest(item.id, item.tutor_id, 'Approve');
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== item.id));
        setApprovingItem(null);
        setSuccessMsg(`Đã phê duyệt chứng chỉ "${certTitle}" và cấp tích xanh xác minh cho ${tutorName}.`);
      } else {
        setErrorMsg(res.errors || 'Lỗi khi phê duyệt chứng chỉ');
        setApprovingItem(null);
      }
    });
  };

  const confirmReject = () => {
    if (!rejectingItem) return;

    if (!rejectionReason.trim()) {
      setRejectModalError('Vui lòng nhập lý do từ chối để gia sư biết và cập nhật lại!');
      return;
    }

    const item = rejectingItem;
    setErrorMsg('');
    startTransition(async () => {
      const res = await processNewCertificateRequest(item.id, item.tutor_id, 'Reject', rejectionReason);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== item.id));
        setRejectingItem(null);
        setRejectionReason('');
      } else {
        setErrorMsg(res.errors || 'Lỗi khi từ chối chứng chỉ');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="size-6 text-amber-500" />
            Kiểm duyệt Chứng chỉ & Bằng cấp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối soát ảnh chứng chỉ do Gia sư tải lên để cấp Tích xanh xác minh (Verified Badge).
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
          {requests.length} Yêu cầu chờ duyệt
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

      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-2">
          <Loader2 className="size-7 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Đang tải danh sách chứng chỉ...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Không có chứng chỉ nào chờ duyệt</h3>
          <p className="text-xs text-slate-400">Tất cả chứng chỉ của gia sư đã được kiểm duyệt hoàn tất.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((item) => {
            const tutorInfo = item.tutor_profiles?.profiles;
            const schoolName = item.tutor_profiles?.school_name || 'Chưa cập nhật trường';

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  {tutorInfo?.avatar_url ? (
                    <img src={tutorInfo.avatar_url} alt="" className="size-14 rounded-2xl object-cover shrink-0 border border-slate-100" />
                  ) : (
                    <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-700 font-black grid place-items-center text-base shrink-0 border border-indigo-200">
                      {tutorInfo?.full_name?.slice(0, 2).toUpperCase() || 'GS'}
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{tutorInfo?.full_name || 'Gia sư'}</h3>
                      <p className="text-xs text-slate-500">
                        {schoolName} {item.tutor_profiles?.education ? `• ${item.tutor_profiles.education}` : ''}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <Award className="size-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          {item.title || 'Bằng cấp / Chứng chỉ chưa đặt tên'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="size-3 text-slate-400" />
                          Nơi cấp: <strong className="text-slate-700 font-semibold">{item.issued_by || 'Chưa cập nhật'}</strong>
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-slate-400" />
                          Năm cấp: <strong className="text-slate-700 font-semibold">{item.issue_year || 'N/A'}</strong>
                        </span>
                      </div>

                      {item.detail && (
                        <p className="text-[11px] text-slate-600 flex items-start gap-1 pt-0.5 border-t border-slate-200/40">
                          <FileText className="size-3 text-slate-400 mt-0.5 shrink-0" />
                          <span>Mô tả: {item.detail}</span>
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 block">
                      Gửi lúc: {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 justify-end">
                  <div
                    onClick={() => setPreviewImage(item.certificate_url)}
                    className="relative group size-16 rounded-2xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer bg-slate-100"
                  >
                    <img 
                      src={item.certificate_url} 
                      alt="Cert" 
                      className="size-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="size-4" />
                    </div>
                  </div>

                  {/* Nút Xem tab mới */}
                  <a
                    href={item.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Mở tab mới"
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                  >
                    <ExternalLink className="size-4" />
                  </a>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setRejectingItem(item);
                      setRejectionReason('');
                      setRejectModalError('')
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="size-4" /> Từ chối
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => openApproveModal(item)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Duyệt & Xác minh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 size-9 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full grid place-items-center transition-all cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Certificate Full" 
              className="max-h-[80vh] w-auto object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}
       {approvingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                Xác nhận phê duyệt chứng chỉ
              </h3>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setApprovingItem(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT</strong> chứng chỉ{' '}
                <strong className="text-slate-900">
                  {`"${approvingItem.title || 'Bằng cấp / Chứng chỉ'}"`}
                </strong>{' '}
                của gia sư{' '}
                <strong className="text-slate-900">
                  {approvingItem.tutor_profiles?.profiles?.full_name || 'Gia sư'}
                </strong>?
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
                Sau khi xác nhận, hồ sơ gia sư sẽ được cấp <strong className="text-emerald-700">Tích xanh xác minh (Verified)</strong> trên toàn hệ thống.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setApprovingItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Xác nhận Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <XCircle className="size-5 text-rose-600" />
                Từ chối chứng chỉ
              </h3>
              <button 
                type="button"
                onClick={() => setRejectingItem(null)} 
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng nhập lý do từ chối cho chứng chỉ{" "}
              <strong className="text-slate-800">
                {rejectingItem.title || "Bằng cấp"}
              </strong>{" "}
              của gia sư{" "}
              <strong className="text-slate-800">
                {rejectingItem.tutor_profiles?.profiles?.full_name || 'Gia sư'}
              </strong>:
            </p>
             {rejectModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{rejectModalError}</span>
              </div>
            )}

            <textarea
              value={rejectionReason}
              onChange={(e) => {setRejectionReason(e.target.value);
                if(rejectModalError) setRejectModalError('')
              }}
              placeholder="Ví dụ: Ảnh chứng chỉ bị mờ, không nhìn rõ dấu đỏ hoặc thông tin không khớp..."
              className="w-full h-28 p-3.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none text-slate-800"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}