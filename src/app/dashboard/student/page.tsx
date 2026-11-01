'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import { 
  User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, 
  ArrowLeft, Home, Sparkles, ShieldCheck, Camera, ChevronRight
} from 'lucide-react';

export default function StudentProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'Nam',
    date_of_birth: '',
    province: '',
    district: '',
    address: '',
    hometown: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          gender: data.gender || 'Nam',
          date_of_birth: data.date_of_birth || '',
          province: data.province || '',
          district: data.district || '',
          address: data.address || '',
          hometown: data.hometown || '',
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        province: formData.province,
        district: formData.district,
        address: formData.address,
        hometown: formData.hometown,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: 'Cập nhật thất bại: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'HV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center">
        <div className="relative grid size-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-slate-50 to-slate-100/80 pb-20">
      
      {/* NỘI DUNG CHÍNH */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        
        {/* TOP BREADCRUMB BAR (Đã loại bỏ sticky đè giao diện) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
            <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Home className="size-4" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="text-slate-400">Học viên</span>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="font-semibold text-blue-600">Hồ sơ cá nhân</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Quay về Trang chủ</span>
          </Link>
        </div>

        {/* BANNER LINH VẬT CHÚ CHIM XANH (MASCOT HERO BANNER) */}
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-10 text-white shadow-2xl shadow-blue-600/15">
          <div className="absolute -right-10 -top-10 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 size-60 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-blue-100 border border-white/20">
                <Sparkles className="size-3.5 text-amber-300" /> Tự tin kết nối cùng GiaSuHub
              </div>
              <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Hồ sơ Học viên & Phụ huynh
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-blue-100 leading-relaxed">
                Cập nhật đầy đủ thông tin cá nhân giúp gia sư dễ dàng nắm bắt thông tin và hỗ trợ việc học của bạn hiệu quả nhất!
              </p>
            </div>

            {/* SVG CHÚ CHIM XANH LINH VẬT 3D STYLE */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="relative size-32 sm:size-40 transition-transform duration-500 hover:scale-105">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                  <circle cx="100" cy="105" r="75" fill="white" fillOpacity="0.15" />
                  <ellipse cx="100" cy="115" rx="55" ry="50" fill="#3B82F6" />
                  <ellipse cx="100" cy="120" rx="40" ry="35" fill="#60A5FA" />
                  <circle cx="100" cy="75" r="42" fill="#3B82F6" />
                  <circle cx="83" cy="70" r="11" fill="white" />
                  <circle cx="117" cy="70" r="11" fill="white" />
                  <circle cx="85" cy="70" r="5" fill="#1E3A8A" />
                  <circle cx="115" cy="70" r="5" fill="#1E3A8A" />
                  <circle cx="87" cy="68" r="2" fill="white" />
                  <circle cx="117" cy="68" r="2" fill="white" />
                  <path d="M90 80 Q100 95 110 80 Z" fill="#F59E0B" />
                  <path d="M100 25 L145 42 L100 59 L55 42 Z" fill="#1E293B" />
                  <rect x="90" y="27" width="20" height="12" fill="#334155" rx="2" />
                  <path d="M135 45 L138 68 L134 68" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="134" cy="70" r="3" fill="#F59E0B" />
                  <circle cx="45" cy="55" r="4" fill="#FBBF24" />
                  <circle cx="155" cy="120" r="5" fill="#FBBF24" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG / THẤT BẠI */}
        {message && (
          <div className={`mt-6 flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-emerald-500/5' 
              : 'bg-rose-50 text-rose-800 border border-rose-200/80 shadow-rose-500/5'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <div className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="size-5" />
                </div>
              ) : (
                <div className="grid size-8 place-items-center rounded-xl bg-rose-600 text-white">
                  !
                </div>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* GRID LAYOUT HỒ SƠ 2 CỘT */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          
          {/* CỘT TRÁI: THẺ TỔNG QUAN HỒ SƠ (SIDEBAR CARD) */}
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
              
              <div className="relative pt-6">
                <div className="relative mx-auto size-24 grid place-items-center rounded-full bg-blue-600 text-2xl font-extrabold text-white shadow-xl ring-4 ring-white">
                  {getInitials(formData.full_name)}
                  <button 
                    type="button" 
                    title="Đổi ảnh đại diện"
                    className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-slate-900 text-white shadow-md hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-900">{formData.full_name || 'Chưa cập nhật tên'}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{formData.email}</p>

                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                    <ShieldCheck className="size-3.5 text-blue-600" /> Học viên đã xác minh
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-left text-xs font-medium text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vai trò:</span>
                    <span className="font-bold text-slate-800 uppercase">Học viên</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Khu vực:</span>
                    <span className="font-bold text-slate-800">{formData.province || 'Chưa chọn'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trạng thái hồ sơ:</span>
                    <span className="font-bold text-emerald-600">Hoàn thiện 100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ GỢI Ý MẸO HỌC TẬP */}
            <div className="rounded-[28px] bg-gradient-to-br from-amber-50 to-orange-50/60 p-6 border border-amber-200/60">
              <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
                <Sparkles className="size-4 text-amber-600" /> Mẹo từ GiaSuHub
              </div>
              <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
                Cập nhật chính xác địa chỉ và sdt sẽ giúp gia sư nhanh chóng liên hệ với bạn ngay sau khi bạn gửi yêu cầu học!
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA CHI TIẾT */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* THÔNG TIN CƠ BẢN */}
              <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
                  <div className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
                    <p className="text-xs text-slate-500">Thông tin cơ bản nhận diện tài khoản của bạn</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Họ và tên học viên / Phụ huynh</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ và tên..."
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Địa chỉ Email (Cố định)</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pl-11 text-sm font-semibold text-slate-500 cursor-not-allowed"
                      />
                      <Mail className="absolute left-4 top-4 size-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Số điện thoại liên hệ</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0912345678"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pl-11 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                      <Phone className="absolute left-4 top-4 size-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Ngày sinh</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ĐỊA CHỈ & QUÊ QUÁN */}
              <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
                  <div className="grid size-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Địa chỉ & Khu vực học tập</h2>
                    <p className="text-xs text-slate-500">Giúp hệ thống tìm kiếm gia sư ở gần khu vực của bạn</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      placeholder="VD: Hà Nội"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Quận / Huyện</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="VD: Cầu Giấy"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Địa chỉ chi tiết (Số nhà, Tên đường...)</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="VD: Số 15, Ngõ 120 Trần Duy Hưng..."
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Quê quán</label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleChange}
                      placeholder="VD: Nam Định"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* NÚT ACTION LƯU THAY ĐỔI & QUAY VỀ TRANG CHỦ */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] bg-slate-900 p-5 text-white shadow-xl">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-4" /> Quay về Trang chủ
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                  <span>Lưu thay đổi hồ sơ</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}