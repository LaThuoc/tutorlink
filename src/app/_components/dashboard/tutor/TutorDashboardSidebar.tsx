'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserCheck, 
  Calendar, 
  BookOpen,
  FileText, 
  MessageSquare, 
  Wallet, 
  Star, 
  Settings, 
  LogOut,
  Headphones, 
  PhoneCall,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import { logout } from '@/src/modules/auth/actions/auth';
import { createClient } from '@/src/lib/supabase/client';
const baseLink = 'flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors';
const activeLink = 'bg-blue-50 text-blue-600 font-bold';
const idleLink = 'text-slate-600 hover:bg-slate-50 hover:text-blue-600';
const HOTLINE_DISPLAY = '1900 0000';
const HOTLINE_TEL = '19006868';
export default function TutorDashboardSidebar() {
  const pathname = usePathname();
  const linkCls = (href: string) => `${baseLink} ${pathname === href ? activeLink : idleLink}`;
  const supabase = createClient()

  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);



   const [userProfile, setUserProfile] = useState<{ id: string; name: string; email: string } | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [copiedHotline, setCopiedHotline] = useState(false);

  useEffect(() => {
    if (!isMessageModalOpen) return;

    let isMounted = true;
    async function loadCurrentUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', user.id)
        .single();

      if (isMounted) {
        setUserProfile({
          id: user.id,
          name: profile?.full_name || user.user_metadata?.full_name || 'Gia sư GiaSuHub',
          email: profile?.email || user.email || '',
        });
      }
    }

    loadCurrentUserProfile();
    return () => {
      isMounted = false;
    };
  }, [isMessageModalOpen, supabase]);

  useEffect(() => {
    if (!submitSuccess) return;
    const timer = setTimeout(() => {
      setSubmitSuccess(false);
      setIsMessageModalOpen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitSuccess]);

  useEffect(() => {
    if (!submitError) return;
    const timer = setTimeout(() => setSubmitError(''), 5000);
    return () => clearTimeout(timer);
  }, [submitError]);

  const handleCopyHotline = () => {
    navigator.clipboard.writeText(HOTLINE_TEL);
    setCopiedHotline(true);
    setTimeout(() => setCopiedHotline(false), 2500);
  };

  const handleSendContactMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setSubmitError('Vui lòng nhập đầy đủ tiêu đề và nội dung cần hỗ trợ.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      let currentUser = userProfile;
      if (!currentUser) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSubmitError('Phiên đăng nhập hết hạn. Vui lòng tải lại trang.');
          setSubmitting(false);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', user.id)
          .single();

        currentUser = {
          id: user.id,
          name: profile?.full_name || 'Gia sư GiaSuHub',
          email: profile?.email || user.email || '',
        };
      }

      const { error } = await supabase.from('contact_messages').insert({
        user_id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        subject: subject.trim(),
        message: message.trim(),
        status: 'pending',
      });

      if (error) {
        setSubmitError('Gửi tin nhắn thất bại: ' + error.message);
      } else {
        setSubmitSuccess(true);
        setSubject('');
        setMessage('');
      }
    } catch {
      setSubmitError('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-64px)] bg-white border-r border-slate-100 p-4 gap-2 shrink-0">
        
        {/* 1. TỔNG QUAN */}
        <Link href="/dashboard/tutor" className={linkCls('/dashboard/tutor')}>
          <span className="flex items-center gap-3">
            <LayoutDashboard className="size-5" />
            <span>Tổng quan</span>
          </span>
        </Link>

        {/* 2. HỒ SƠ GIA SƯ */}
        <Link href="/dashboard/profiletutor" className={linkCls('/dashboard/profiletutor')}>
          <span className="flex items-center gap-3">
            <UserCheck className="size-5 text-slate-500" />
            <span>Hồ sơ gia sư</span>
          </span>
        </Link>

        {/* 3. LỊCH DẠY */}
        <Link href="/dashboard/schedule" className={linkCls('/dashboard/schedule')}>
          <span className="flex items-center gap-3">
            <Calendar className="size-5 text-slate-500" />
            <span>Lịch dạy</span>
          </span>
        </Link>
        <Link href="/dashboard/lesson" className={linkCls('/dashboard/lesson')}>
          <span className="flex items-center gap-3">
            <BookOpen className="size-5" />
            <span>Buổi học</span>
          </span>
        </Link>

        {/* 4. YÊU CẦU HỌC */}
        <Link href="/dashboard/requests" className={linkCls('/dashboard/requests')}>
          <span className="flex items-center gap-3">
            <FileText className="size-5 text-slate-500" />
            <span>Yêu cầu học</span>
          </span>
        </Link>

        

        {/* 6. DOANH THU */}
        <Link href="/dashboard/revenue" className={linkCls('/dashboard/revenue')}>
          <span className="flex items-center gap-3">
            <Wallet className="size-5 text-slate-500" />
            <span>Doanh thu</span>
          </span>
        </Link>

        {/* 7. ĐÁNH GIÁ */}
        <Link href="/dashboard/reviews" className={linkCls('/dashboard/reviews')}>
          <span className="flex items-center gap-3">
            <Star className="size-5 text-slate-500" />
            <span>Đánh giá</span>
          </span>
        </Link>
        

        {/* 8. CÀI ĐẶT */}
        <Link href="/dashboard/settings" className={linkCls('/dashboard/settings')}>
          <span className="flex items-center gap-3">
            <Settings className="size-5 text-slate-500" />
            <span>Cài đặt</span>
          </span>
        </Link>

        {/* 9. NÚT ĐĂNG XUẤT */}
        <form action={logout} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut className="size-5 text-rose-500" />
            <span>Đăng xuất</span>
          </button>
        </form>

        {/* KHU VỰC HỖ TRỢ */}
        <div className="mt-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/70 text-sm text-slate-500 space-y-2">
          <b className="text-slate-800 font-bold block text-sm">Cần hỗ trợ?</b>
          <p className="text-xs text-slate-500 leading-relaxed">
            Đội ngũ GiaSuHub luôn sẵn sàng hỗ trợ bạn!
          </p>
          <button 
            type="button"
            onClick={() => setIsSupportMenuOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer"
          >
            <Headphones className="size-4" />
            <span>Liên hệ ngay</span>
          </button>
        </div>

      </aside>
       {isSupportMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSupportMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center">
                  <Headphones className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Trung tâm Hỗ trợ GiaSuHub</h3>
                  <p className="text-[11px] text-slate-400">Chọn hình thức liên hệ phù hợp với bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportMenuOpen(false)}
                className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 grid place-items-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Lựa chọn 1: Mở Modal gửi tin nhắn tới Admin */}
              <button
                type="button"
                onClick={() => {
                  setIsSupportMenuOpen(false);
                  setSubmitSuccess(false);
                  setSubmitError('');
                  setIsMessageModalOpen(true);
                }}
                className="w-full text-left p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center gap-4 group cursor-pointer"
              >
                <div className="size-12 rounded-2xl bg-blue-600 text-white grid place-items-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <MessageSquare className="size-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Gửi tin nhắn cho Admin
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Gửi yêu cầu hỗ trợ duyệt hồ sơ, khiếu nại hoặc góp ý trực tiếp đến quản trị viên.
                  </p>
                </div>
              </button>

              {/* Lựa chọn 2: Hiển thị số Hotline GiaSuHub */}
              {/* 🟢 [ĐÃ SỬA]: Giữ nguyên dòng tiêu đề "Hotline hỗ trợ trực tiếp (8h00 - 21h00)", chỉ hiện số điện thoại + 1 nút Sao chép số */}
              <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-xs">
                      <PhoneCall className="size-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Hotline hỗ trợ trực tiếp (8h00 - 21h00)
                      </span>
                      <span className="text-xl font-black text-slate-900 tracking-tight select-all block mt-0.5">
                        {HOTLINE_DISPLAY}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHotline}
                    className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {copiedHotline ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-slate-400" /> Sao chép số
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !submitting && setIsMessageModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setIsMessageModalOpen(false);
                    setIsSupportMenuOpen(true);
                  }}
                  title="Quay lại chọn phương thức"
                  className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 grid place-items-center transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-slate-900">Gửi tin nhắn cho Admin</h3>
                  <p className="text-[11px] text-slate-400">
                    {userProfile ? `Người gửi: ${userProfile.name} (${userProfile.email})` : 'Đội ngũ quản trị sẽ phản hồi sớm nhất'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsMessageModalOpen(false)}
                className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 grid place-items-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p>Gửi tin nhắn hỗ trợ thành công!</p>
                  <p className="font-normal text-emerald-700 mt-0.5">
                    Admin đã nhận được yêu cầu của bạn và sẽ xử lý trong thời gian sớm nhất.
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSendContactMessage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Tiêu đề hỗ trợ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="VD: Hỗ trợ duyệt hồ sơ gia sư, Cập nhật chứng chỉ..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Nội dung chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{message.length}/1000</span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải để Admin hỗ trợ nhanh nhất..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-800 leading-relaxed outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" /> Gửi cho Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
    
  );
}