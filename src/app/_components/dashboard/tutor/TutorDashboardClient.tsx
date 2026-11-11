'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  Calendar as CalendarIcon, 
  UserCheck,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  BookOpen,
  Loader2,
  Clock,
  ChevronRight,
  Wallet
} from 'lucide-react';
import TutorDashboardHeader from './TutorDashboardHeader';
import TutorDashboardSidebar from './TutorDashboardSidebar';
import { DashboardData } from '@/src/modules/tutor/getDashboardTutorData';
import { updateBookingStatus } from '@/src/modules/tutor/getStudentRequest';

interface Props {
  data?: DashboardData;
}

export default function TutorDashboardClient({ data }: Props) {
  const [acceptedRequests, setAcceptedRequests] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const tutorInfo = data?.tutorInfo;
  const upcomingBookings = data?.upcomingBookings || [];
  const pendingRequests = data?.pendingRequests || [];
  const stats = data?.stats;
  const latestReview = data?.latestReview;

  const handleAcceptRequest = (id: string) => {
    startTransition(async () => {
      const res = await updateBookingStatus(id, 'Accepted');
      if (res.success) {
        setAcceptedRequests((prev) => ({ ...prev, [id]: true }));
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        
        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start max-w-7xl mx-auto">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* PROFILE BANNER */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0">
                {tutorInfo?.initials || 'GS'}
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-bold text-[11px] px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {tutorInfo?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Xin chào, {tutorInfo?.fullName || 'Gia sư'}!
                </h1>
                <p className="text-xs font-medium text-slate-400">Bạn đang là gia sư trên TutorHub</p>
                
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-100 mt-4">
                  <div>
                    <small className="text-slate-400 block text-[11px] font-medium">Môn dạy</small>
                    <b className="text-xs font-bold text-slate-800 line-clamp-1">{tutorInfo?.subjects}</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px] font-medium">Kinh nghiệm</small>
                    <b className="text-xs font-bold text-slate-800">{tutorInfo?.experienceYears || 0} năm</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px] font-medium">Tổng buổi dạy</small>
                    <b className="text-xs font-bold text-slate-800">{tutorInfo?.totalLessons || 0} buổi</b>
                  </div>
                  <div>
                    <small className="text-slate-400 block text-[11px] font-medium">Đánh giá</small>
                    <b className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {tutorInfo?.rating || 5.0} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 
                      <span className="text-slate-400 font-normal">({tutorInfo?.reviewCount || 0})</span>
                    </b>
                  </div>
                </div>
              </div>
            </section>

            {/* SCHEDULE & REQUESTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* UPCOMING LESSONS */}
              <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" /> Lịch dạy đã nhận
                    </h2>
                    <Link href="/dashboard/requests" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                      Xem tất cả <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {upcomingBookings.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <p className="text-xs text-slate-400">Chưa có lịch dạy nào được nhận.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4">
                      {upcomingBookings.slice(0, 3).map((item) => (
                        <div key={item.id} className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                          <div className="flex items-center justify-between">
                            <b className="font-bold text-xs text-slate-900 truncate">{item.studentName}</b>
                            <span className="px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-blue-50 text-blue-600 border border-blue-100">
                              {item.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{item.scheduleText}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* NEW LEARNING REQUESTS */}
              <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" /> Yêu cầu học mới 
                      {pendingRequests.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                          {pendingRequests.length}
                        </span>
                      )}
                    </h2>
                    <Link href="/dashboard/requests" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                      Xem tất cả <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <p className="text-xs text-slate-400">Không có yêu cầu học mới nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4">
                      {pendingRequests.slice(0, 2).map((req) => {
                        const isAccepted = acceptedRequests[req.id];
                        return (
                          <div key={req.id} className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                                  {req.avatarText}
                                </div>
                                <b className="text-xs text-slate-900">{req.studentName}</b>
                              </div>
                              <small className="text-[10px] text-slate-400 font-medium">{req.createdAt}</small>
                            </div>
                            
                            <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                              <div className="font-bold text-blue-600">{req.subject}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {req.scheduleText}
                              </div>
                            </div>

                            <button
                              disabled={isAccepted || isPending}
                              onClick={() => handleAcceptRequest(req.id)}
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isAccepted
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                              }`}
                            >
                              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                              {isAccepted ? 'Đã chấp nhận ✔' : 'Chấp nhận'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* PROFILE MANAGEMENT CARD */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" /> Quản lý hồ sơ gia sư
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {tutorInfo?.verificationStatus}
                  </span>
                </h2>
                <Link href="/dashboard/profiletutor" className="text-xs font-bold text-blue-600 hover:underline">
                  Chỉnh sửa hồ sơ →
                </Link>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-600 font-black text-base shrink-0">
                    {tutorInfo?.completionPercentage || 0}%
                  </div>
                  <div>
                    <b className="text-sm text-slate-900 font-bold block">
                      {tutorInfo?.completionPercentage === 100 ? 'Hồ sơ hoàn hảo!' : 'Hoàn thiện hồ sơ'}
                    </b>
                    <span className="text-xs text-slate-400 font-medium">Hồ sơ đầy đủ tăng khả năng nhận lớp.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
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
                    <small className={`font-bold text-[11px] block ${tutorInfo?.hasExperiences ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {tutorInfo?.hasExperiences ? 'Đã cập nhật' : 'Chưa có'}
                    </small>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Học vấn</span>
                    </div>
                    <small className={`font-bold text-[11px] block ${tutorInfo?.hasEducations ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {tutorInfo?.hasEducations ? 'Đã cập nhật' : 'Chưa có'}
                    </small>
                  </div>
                  
                  {/* CỤM CHỨC NĂNG CHỨNG CHỈ NÂNG CẤP TỪ CỘT certificate_data */}
                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chứng chỉ</span>
                    </div>
                    <small className={`font-bold text-[11px] block ${tutorInfo?.hasCertificates ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {tutorInfo?.hasCertificates ? 'Đã cập nhật' : 'Chưa có'}
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT ASIDE COLUMN */}
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md shadow-blue-600/15 space-y-3">
              <b className="text-sm font-bold block">Bạn đã sẵn sàng nhận lớp?</b>
              <p className="text-xs text-blue-100 leading-relaxed font-normal">Cập nhật lịch dạy và duyệt yêu cầu để bắt đầu giảng dạy ngay!</p>
              <Link href="/dashboard/requests" className="block text-center w-full py-2.5 bg-white text-blue-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors">
                Xem yêu cầu nhận lớp
              </Link>
            </section>

            {/* THÔNG TIN NHANH */}
            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Thông tin nhanh
                </h2>
                <Link href="/dashboard/revenue" className="text-xs font-bold text-blue-600 hover:underline">
                  Doanh thu →
                </Link>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-1 border border-slate-100">
                <small className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-blue-600" /> Tổng doanh thu bài dạy
                </small>
                <b className="text-2xl font-extrabold text-blue-600 block">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                </b>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Đã nhận</span>
                  <b className="text-xs text-slate-900 font-bold">{stats?.totalLessons || 0} lớp</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Đang chờ</span>
                  <b className="text-xs text-slate-900 font-bold">{stats?.pendingCount || 0} yêu cầu</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Hoàn thành</span>
                  <b className="text-xs text-slate-900 font-bold">{stats?.completedCount || 0} lớp</b>
                </div>
              </div>
            </section>

            {/* THỐNG KÊ THEO MÔN */}
            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Thống kê theo môn
                </h2>
              </div>
              {stats?.subjectStats && stats.subjectStats.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {stats.subjectStats.map((item) => (
                    <div key={item.subject}>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-900">{item.subject}</span>
                        <span className="text-slate-400 font-medium">{item.count} lớp · {item.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có thống kê môn học.</p>
              )}
            </section>

            {/* ĐÁNH GIÁ GẦN ĐÂY */}
            <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Đánh giá gần đây
                </h2>
                <Link href="/dashboard/reviews" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả →</Link>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">{tutorInfo?.rating || 5.0}</span>
                <div className="flex items-center text-amber-400 text-sm">★</div>
                <small className="text-xs text-slate-400 font-medium">({tutorInfo?.reviewCount || 0} đánh giá)</small>
              </div>

              {latestReview ? (
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {latestReview.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">{latestReview.studentName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-xs">{'★'.repeat(latestReview.rating)}</span>
                      <small className="text-[10px] text-slate-400 font-medium">{latestReview.createdAt}</small>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed italic">
                      {`"${latestReview.comment}"`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 pt-2">Chưa có nhận xét nào.</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}