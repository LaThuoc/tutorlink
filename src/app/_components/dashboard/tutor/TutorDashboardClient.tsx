'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  UserCheck,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import TutorDashboardHeader from './TutorDashboardHeader';
import TutorDashboardSidebar from './TutorDashboardSidebar';
import { LearningRequest } from '@/src/types/tutorDashboard';
import { createClient } from '@/src/lib/supabase/client';

export default function TutorDashboardClient() {
  const supabase = createClient();
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [acceptedRequests, setAcceptedRequests] = useState<Record<string, boolean>>({});

  const [tutorName, setTutorName] = useState<string>('Gia sư');
  const [tutorInitials, setTutorInitials] = useState<string>('GS');
  const [subjects, setSubjects] = useState<string>('Chưa cập nhật');

  useEffect(() => {
    async function fetchTutorInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || 'Gia sư';
        setTutorName(fullName);

        const words = fullName.trim().split(/\s+/);
        if (words.length === 1) {
          setTutorInitials(words[0].slice(0, 2).toUpperCase());
        } else {
          setTutorInitials((words[0][0] + words[words.length - 1][0]).toUpperCase());
        }

        const { data: tutorProfile } = await supabase
          .from('tutor_profiles')
          .select('subjects')
          .eq('user_id', user.id)
          .maybeSingle();

        if (tutorProfile?.subjects) {
          setSubjects(Array.isArray(tutorProfile.subjects) ? tutorProfile.subjects.join(', ') : tutorProfile.subjects);
        }
      }
    }
    fetchTutorInfo();
  }, [supabase]);

  const daysList = [
    { label: 'T2', date: 13 },
    { label: 'T3', date: 14 },
    { label: 'T4', date: 15 },
    { label: 'T5', date: 16 },
    { label: 'T6', date: 17 },
    { label: 'T7', date: 18 },
    { label: 'CN', date: 19 },
  ];

  const initialRequests: LearningRequest[] = [
    {
      id: 'req-1',
      studentName: 'Phạm Ngọc Linh',
      avatarText: 'PL',
      timeAgo: '2 phút trước',
      gradeSubject: 'Lớp 10 - Toán',
      scheduleText: 'Muốn học vào T3, T5 (19:00 - 20:30)',
    },
    {
      id: 'req-2',
      studentName: 'Hoàng Tuấn Anh',
      avatarText: 'HA',
      timeAgo: '15 phút trước',
      gradeSubject: 'Lớp 11 - Vật lý',
      scheduleText: 'Muốn học vào T4, T6 (17:00 - 18:30)',
    },
    {
      id: 'req-3',
      studentName: 'Lê Thu Hà',
      avatarText: 'TH',
      timeAgo: '1 giờ trước',
      gradeSubject: 'Lớp 12 - Hóa học',
      scheduleText: 'Muốn học vào T7, CN (14:00 - 16:00)',
    },
  ];

  const handleAcceptRequest = (id: string) => {
    setAcceptedRequests((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        
        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-5">
            
            {/* PROFILE BANNER */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-md shrink-0">
                {tutorInitials}
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-bold text-[11px] px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác minh
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Xin chào, {tutorName}!
                </h1>
                <p className="text-xs font-medium text-slate-400">Bạn đang là gia sư trên GiaSuHub</p>
                
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-100 mt-4">
                  <div>
                    <small className="text-slate-400 block text-[11px]">Môn dạy</small>
                    <b className="text-xs font-bold text-slate-800">{subjects}</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px]">Kinh nghiệm</small>
                    <b className="text-xs font-bold text-slate-800">3 năm</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px]">Tổng số buổi dạy</small>
                    <b className="text-xs font-bold text-slate-800">42 buổi</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px]">Đánh giá</small>
                    <b className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> <span className="text-slate-400 font-normal">(128)</span>
                    </b>
                  </div>
                </div>
              </div>
            </section>

            {/* SCHEDULE & REQUESTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* UPCOMING LESSONS */}
              <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="lich">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" /> Lịch dạy sắp tới
                  </h2>
                  <Link href="#lich" className="text-xs font-bold text-blue-600 hover:underline">
                    Xem đầy đủ →
                  </Link>
                </div>
                
                <div className="grid grid-cols-7 gap-1.5">
                  {daysList.map((d) => {
                    const isSelected = selectedDay === d.date;
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDay(d.date)}
                        className={`rounded-2xl py-2.5 text-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-[11px] opacity-80 font-medium">{d.label}</span>
                        <b className="block text-sm font-bold">{d.date}</b>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  <div className="border border-slate-100 rounded-2xl p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-600 w-24">18:00 - 19:30</div>
                    <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-blue-50 text-blue-600">Toán</span>
                    <div className="flex-1 min-w-[120px]">
                      <div className="font-bold text-xs text-slate-900">Nguyễn Minh Quân</div>
                      <small className="text-slate-400 text-[11px]">Lớp 10</small>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Đã xác nhận</span>
                    <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-white transition-colors">Chi tiết</button>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-600 w-24">19:30 - 21:00</div>
                    <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600">Vật lý</span>
                    <div className="flex-1 min-w-[120px]">
                      <div className="font-bold text-xs text-slate-900">Lê Thảo Vy</div>
                      <small className="text-slate-400 text-[11px]">Lớp 11</small>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Đã xác nhận</span>
                    <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-white transition-colors">Chi tiết</button>
                  </div>
                </div>
              </section>

              {/* NEW LEARNING REQUESTS */}
              <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="yeu-cau">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Yêu cầu học mới 
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  </h2>
                  <Link href="#yeu-cau" className="text-xs font-bold text-blue-600 hover:underline">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="space-y-3">
                  {initialRequests.map((req) => {
                    const isAccepted = acceptedRequests[req.id];
                    return (
                      <div key={req.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                              {req.avatarText}
                            </div>
                            <b className="text-xs text-slate-900">{req.studentName}</b>
                          </div>
                          <small className="text-[11px] text-slate-400 font-medium">{req.timeAgo}</small>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {req.gradeSubject}<br />
                          {req.scheduleText}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-white transition-colors">
                            Chi tiết
                          </button>
                          <button
                            disabled={isAccepted}
                            onClick={() => handleAcceptRequest(req.id)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              isAccepted
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                            }`}
                          >
                            {isAccepted ? 'Đã chấp nhận ✔' : 'Chấp nhận'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* PROFILE MANAGEMENT CARD */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" id="ho-so">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" /> Quản lý hồ sơ gia sư
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Đã duyệt</span>
                </h2>
                <Link href="#ho-so" className="text-xs font-bold text-blue-600 hover:underline">
                  Chỉnh sửa hồ sơ →
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-600 font-extrabold text-lg shrink-0">
                  100%
                </div>
                <div className="min-w-[180px]">
                  <b className="text-sm text-blue-600 font-bold block">Hồ sơ của bạn đã đầy đủ!</b>
                  <span className="text-xs text-slate-400 font-medium">Học sinh có thể dễ dàng tìm thấy bạn hơn.</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-[280px]">
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cá nhân</span>
                    </div>
                    <small className="text-emerald-600 font-bold text-[11px] block">Đầy đủ</small>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kinh nghiệm</span>
                    </div>
                    <small className="text-emerald-600 font-bold text-[11px] block">Đã cập nhật</small>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Học vấn</span>
                    </div>
                    <small className="text-emerald-600 font-bold text-[11px] block">Đã cập nhật</small>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chứng chỉ</span>
                    </div>
                    <small className="text-emerald-600 font-bold text-[11px] block">Đã cập nhật</small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT ASIDE COLUMN */}
          <div className="space-y-5">
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md shadow-blue-600/15 space-y-3">
              <b className="text-sm font-bold block">Bạn đã sẵn sàng nhận lớp?</b>
              <p className="text-xs text-blue-100 leading-relaxed font-normal">Cập nhật lịch dạy và duyệt yêu cầu để bắt đầu giảng dạy ngay!</p>
              <button className="w-full py-2.5 bg-white text-blue-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors">
                Cập nhật lịch dạy
              </button>
            </section>

            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="doanh-thu">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Thông tin nhanh
              </h2>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-1 border border-slate-100">
                <small className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Tổng thu nhập
                </small>
                <b className="text-2xl font-extrabold text-slate-900 block">12.500.000đ</b>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> ↑ 12% so với tháng trước
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Đã dạy</span>
                  <b className="text-xs text-slate-900 font-bold">42 buổi</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Đang xử lý</span>
                  <b className="text-xs text-slate-900 font-bold">3 yêu cầu</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Hoàn thành</span>
                  <b className="text-xs text-slate-900 font-bold">39 buổi</b>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Thống kê theo môn
                </h2>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Chi tiết →</Link>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1.5">
                    <span className="text-slate-900">Toán</span>
                    <span className="text-slate-400 font-medium">18 buổi · 43%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '43%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1.5">
                    <span className="text-slate-900">Vật lý</span>
                    <span className="text-slate-400 font-medium">14 buổi · 33%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1.5">
                    <span className="text-slate-900">Hóa học</span>
                    <span className="text-slate-400 font-medium">10 buổi · 24%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4" id="danh-gia">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Đánh giá gần đây
                </h2>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả →</Link>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">4.9</span>
                <div className="flex items-center text-amber-400 text-lg">★</div>
                <small className="text-xs text-slate-400 font-medium">(128 đánh giá)</small>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                  MQ
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">Nguyễn Minh Quân</div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">★★★★★</span>
                    <small className="text-[10px] text-slate-400 font-medium">12/09/2025</small>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cô dạy rất nhiệt tình, dễ hiểu. Con tiến bộ rõ rệt sau 1 tháng học.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}