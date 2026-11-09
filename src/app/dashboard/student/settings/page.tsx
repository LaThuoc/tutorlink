'use client';

import { useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Lock, Bell, Shield, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { StudentBreadcrumb } from '@/src/app/_components/layout/returnHome';

export default function StudentSettingsPage() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotify, setEmailNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);
    if (error) {
      setMessage({ type: 'error', text: 'Đổi mật khẩu thất bại: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <StudentBreadcrumb current='Settings' />
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Cài đặt & Bảo mật</h1>
          <p className="mt-1 text-xs text-slate-500">Quản lý mật khẩu tài khoản và tùy chọn thông báo từ hệ thống.</p>
        </div>

        {message && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' && <CheckCircle2 className="size-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* FORM ĐỔI MẬT KHẨU */}
          <form onSubmit={handlePasswordChange} className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="size-5 text-blue-600" /> Đổi mật khẩu
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Nhập ít nhất 6 ký tự..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                Cập nhật mật khẩu
              </button>
            </div>
          </form>

          {/* CÀI ĐẶT THÔNG BÁO */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="size-5 text-blue-600" /> Tùy chọn thông báo
            </h2>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-slate-900 text-sm">Thông báo qua Email</p>
                <p className="text-xs text-slate-500">Nhận email thông báo ngay khi có gia sư phản hồi yêu cầu học</p>
              </div>

              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}