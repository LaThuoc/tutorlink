'use client';

import React, { useState, useTransition } from 'react';
import { 
  KeyRound, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { changePasswordAction } from '@/src/modules/tutor/changePassword';

export default function ChangePasswordManager() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '', percent: 0 };
    if (pass.length < 6) return { label: 'Yếu (Tối thiểu 6 ký tự)', color: 'bg-rose-500 text-rose-700', percent: 30 };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: 'Rất mạnh', color: 'bg-emerald-500 text-emerald-700', percent: 100 };
    }
    return { label: 'Trung bình', color: 'bg-amber-500 text-amber-700', percent: 65 };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ các trường thông tin.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới và Nhập lại mật khẩu mới không trùng khớp.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction({ currentPassword, newPassword });
      if (res.success) {
        setSuccessMsg('Đổi mật khẩu thành công! Hãy sử dụng mật khẩu mới cho lần đăng nhập sau.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error || 'Đã có lỗi xảy ra khi đổi mật khẩu.');
      }
    });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="size-6 text-blue-600" />
            Đổi mật khẩu tài khoản
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật mật khẩu định kỳ để bảo vệ tài khoản gia sư của bạn an toàn hơn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Thay đổi mật khẩu</h2>
            <p className="text-xs text-slate-400">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để tiến hành cập nhật.</p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MẬT KHẨU HIỆN TẠI */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu bạn đang sử dụng"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* MẬT KHẨU MỚI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu mới</label>
              {strength.label && (
                <span className="text-[10px] font-bold text-slate-600">
                  Độ mạnh: <b className="text-slate-900">{strength.label}</b>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (Tối thiểu 6 ký tự)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.percent}%` }} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Cập nhật mật khẩu
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="size-4 text-amber-500" />
            Quy tắc mật khẩu an toàn
          </h3>
          <ul className="text-[11px] text-slate-600 space-y-2.5 leading-relaxed list-disc pl-4">
            <li>Độ dài tối thiểu từ <b>6 đến 12 ký tự</b>.</li>
            <li>Nên bao gồm chữ hoa, chữ thường và chữ số để tăng độ an toàn.</li>
            <li>Không sử dụng thông tin cá nhân như ngày sinh hay tên đăng nhập làm mật khẩu.</li>
            <li>Không chia sẻ mật khẩu tài khoản cho bất kỳ ai khác.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}