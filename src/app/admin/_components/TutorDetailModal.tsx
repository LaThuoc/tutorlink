'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { 
  X, CheckCircle2, GraduationCap, Award, BookOpen, FileText,
  MapPin, Calendar, Briefcase, Phone, Mail, Clock, ShieldCheck, ExternalLink,
  Sparkles, AlertCircle, Laptop, Trophy, Star, User
} from 'lucide-react';
import { CertificateItem, ExperienceItem, EducationItem, ScheduleSlot} from '@/src/types/tutor.type';



export interface PendingCertificateRequest {
  id: string;
  title: string;
  issued_by?: string;
  issue_year?: string;
  certificate_url: string;
  status: string;
  created_at: string;
}

export interface SubjectDetailItem {
  subject?: string;
  grade?: string;
  grades?: string[];
  tag?: string;
}

export interface TutorProfileData {
  user_id: string;
  bio?: string;
  headline?: string;
  school_name?: string;
  education?: string;
  hourly_rate?: number;
  experience_years?: number;
  subjects?: string[];
  grades?: string[];
  teaching_areas?: string[];
  achievements?: string[];
  skills?: string[];
  teaching_modes?: string[];
  quote?: string;
  address?: string;
  is_online?: boolean;
  total_lessons_taught?: number;
  subject_details?: SubjectDetailItem[] | string;
  experiences?: ExperienceItem[];
  educations?: EducationItem[];
  certificates_data?: CertificateItem[];
  schedules_data?: ScheduleSlot[];
  status: string;
  verification_status: string;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: string;
    hometown?: string;
    province?: string;
    district?: string;
    gender?: string;
  };
}

interface ModalProps {
  tutor: TutorProfileData | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  isPending: boolean;
}

const DAYS_MAP: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ Nhật',
};

// Viết hoa chữ cái đầu tiên (vd: toán -> Toán)
const capitalizeFirst = (str?: string) => {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

// Định dạng ngày sinh
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export function TutorDetailModal({ tutor, onClose, onApprove, isPending }: ModalProps) {
  const [pendingCerts, setPendingCerts] = useState<PendingCertificateRequest[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!tutor) return;

    const currentTutorId = tutor.user_id;
    let isMounted = true;

    async function fetchPendingCerts() {
      const { data, error } = await supabase
        .from('certificate_requests')
        .select('*')
        .eq('tutor_id', currentTutorId)
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setPendingCerts(data as PendingCertificateRequest[]);
        }
      }
    }

    fetchPendingCerts();

    return () => {
      isMounted = false;
    };
  }, [tutor, supabase]);

  if (!tutor) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'GS';
    const words = name.trim().split(' ');
    return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const isApproved = tutor.verification_status === 'Approved' || tutor.status === 'approved';

  let parsedSubjectDetails: SubjectDetailItem[] = [];
  if (tutor.subject_details) {
    if (typeof tutor.subject_details === 'string') {
      try {
        parsedSubjectDetails = JSON.parse(tutor.subject_details) as SubjectDetailItem[];
      } catch {
        parsedSubjectDetails = [];
      }
    } else if (Array.isArray(tutor.subject_details)) {
      parsedSubjectDetails = tutor.subject_details;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-100">
        
        {/* 1. HEADER BLUE THEME */}
        <div className="p-6 bg-blue-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {tutor.profiles?.avatar_url ? (
              <img src={tutor.profiles.avatar_url} alt="" className="size-16 rounded-2xl object-cover ring-2 ring-white/30 shrink-0" />
            ) : (
              <div className="size-16 rounded-2xl bg-white text-blue-600 font-extrabold grid place-items-center text-xl shadow-sm shrink-0 tracking-wider">
                {getInitials(tutor.profiles?.full_name)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-white">{capitalizeFirst(tutor.profiles?.full_name) || 'Chưa cập nhật tên'}</h2>
                {isApproved ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 text-[11px] font-bold flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-300" /> Gia sư đã xác minh
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1">
                    <Clock className="size-3.5 text-amber-300" /> Hồ sơ chờ duyệt
                  </span>
                )}
              </div>
              
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-blue-200" /> {tutor.profiles?.email}</span>
                {tutor.profiles?.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-blue-200" /> {tutor.profiles.phone}</span>}
                {tutor.address && <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-blue-200" /> {capitalizeFirst(tutor.address)}</span>}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="size-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs bg-white">
          
          {(tutor.headline || tutor.quote) && (
            <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1">
              {tutor.headline && <p className="font-bold text-slate-900 text-sm">{tutor.headline}</p>}
              {tutor.quote && <p className="text-slate-500 italic text-xs">{tutor.quote}</p>}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="size-4 text-slate-600" /> Thông tin cá nhân & Học vấn
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ngày sinh</span>
                <p className="font-bold text-slate-900 text-xs truncate">
                  {formatDate(tutor.profiles?.date_of_birth) || 'Chưa cập nhật'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Quê quán</span>
                <p className="font-bold text-slate-900 text-xs truncate">
                  {capitalizeFirst(tutor.profiles?.hometown || tutor.profiles?.province) || 'Chưa cập nhật'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Giới tính</span>
                <p className="font-bold text-slate-900 text-xs truncate">
                  {capitalizeFirst(tutor.profiles?.gender) || 'Chưa cập nhật'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trường đào tạo</span>
                <p className="font-bold text-slate-900 text-xs truncate">{capitalizeFirst(tutor.school_name) || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trình độ học vấn</span>
                <p className="font-bold text-slate-900 text-xs truncate">{capitalizeFirst(tutor.education) || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Mức học phí</span>
                <p className="font-bold text-slate-900 text-xs">
                  {tutor.hourly_rate ? `${Number(tutor.hourly_rate).toLocaleString('vi-VN')} đ/giờ` : 'Thỏa thuận'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Kinh nghiệm dạy</span>
                <p className="font-bold text-slate-900 text-xs">{tutor.experience_years ? `${tutor.experience_years} năm` : 'Mới đi dạy'}</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Số buổi đã dạy</span>
                <p className="font-bold text-slate-900 text-xs">{tutor.total_lessons_taught || 0} buổi</p>
              </div>
            </div>
          </div>

          {tutor.bio && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="size-4 text-slate-600" /> Giới thiệu sơ lược
              </h4>
              <div className="text-slate-700 leading-relaxed p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line">
                {tutor.bio}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="size-4 text-slate-600" /> MÔN HỌC NHẬN DẠY
              </h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-slate-200/80 min-h-[60px]">
                {tutor.subjects && tutor.subjects.length > 0 ? (
                  tutor.subjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                      {capitalizeFirst(sub)}
                    </span>
                  ))
                ) : <span className="text-slate-400">Chưa chọn môn</span>}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <GraduationCap className="size-4 text-slate-600" /> KHỐI LỚP NHẬN DẠY
              </h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-slate-200/80 min-h-[60px]">
                {tutor.grades && tutor.grades.length > 0 ? (
                  tutor.grades.map((gr, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                      {capitalizeFirst(gr)}
                    </span>
                  ))
                ) : <span className="text-slate-400">Chưa chọn khối lớp</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="size-4 text-slate-600" /> KHU VỰC NHẬN DẠY
              </h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-slate-200/80 min-h-[60px]">
                {tutor.teaching_areas && tutor.teaching_areas.length > 0 ? (
                  tutor.teaching_areas.map((area, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-100">
                      {capitalizeFirst(area)}
                    </span>
                  ))
                ) : <span className="text-slate-400">Chưa cập nhật khu vực</span>}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Laptop className="size-4 text-slate-600" /> HÌNH THỨC GIẢNG DẠY
              </h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-slate-200/80 min-h-[60px]">
                {tutor.teaching_modes && tutor.teaching_modes.length > 0 ? (
                  tutor.teaching_modes.map((mode, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                      {capitalizeFirst(mode)}
                    </span>
                  ))
                ) : <span className="text-slate-400">Chưa cập nhật hình thức</span>}
              </div>
            </div>
          </div>

          {parsedSubjectDetails.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="size-4 text-slate-600" /> CHI TIẾT MÔN HỌC & PHƯƠNG PHÁP
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedSubjectDetails.map((det: SubjectDetailItem, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{capitalizeFirst(det.subject) || 'Môn học'}</span>
                      {det.grade && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">{capitalizeFirst(det.grade)}</span>}
                    </div>
                    {det.tag && <p className="text-[11px] text-slate-600 font-medium">🏷️ {capitalizeFirst(det.tag)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tutor.experiences && tutor.experiences.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="size-4 text-slate-600" /> QUÁ TRÌNH KINH NGHIỆM
              </h4>
              <div className="space-y-2">
                {tutor.experiences.map((exp: ExperienceItem, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between bg-white">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{capitalizeFirst(exp.role || exp.company)}</p>
                      {exp.description && <p className="text-[11px] text-slate-500">{exp.description}</p>}
                    </div>
                    {exp.period && <span className="text-[10px] font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-100">{exp.period}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutor.achievements && tutor.achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Trophy className="size-4 text-slate-600" /> Thành tích đạt được
                </h4>
                <div className="space-y-1.5">
                  {tutor.achievements.map((ach, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200/80 flex items-center gap-2 font-medium text-slate-700 bg-white">
                      <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>{capitalizeFirst(ach)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tutor.skills && tutor.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Star className="size-4 text-slate-600" /> Kỹ năng nổi bật
                </h4>
                <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl border border-slate-200/80 bg-white">
                  {tutor.skills.map((sk, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {capitalizeFirst(sk)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {tutor.schedules_data && tutor.schedules_data.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="size-4 text-slate-600" /> KHUNG GIỜ ĐĂNG KÝ DẠY RẢNH
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tutor.schedules_data.map((slot: ScheduleSlot, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between bg-white">
                    <span className="font-bold text-slate-800">{DAYS_MAP[slot.dayOfWeek || 1] || 'Hàng tuần'}</span>
                    <span className="text-[11px] font-semibold text-emerald-600">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Award className="size-4 text-slate-600" /> BẰNG CẤP & CHỨNG CHỈ
              </h4>
              {pendingCerts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  {pendingCerts.length} chứng chỉ chờ xét duyệt
                </span>
              )}
            </div>

            {pendingCerts.length > 0 && (
              <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-3">
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="size-4 text-amber-600" /> Chứng chỉ mới nộp (Đang chờ Admin xét duyệt):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingCerts.map((cert) => (
                    <div key={cert.id} className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        {cert.certificate_url && (
                          <a href={cert.certificate_url} target="_blank" rel="noreferrer" className="shrink-0 group relative">
                            <img src={cert.certificate_url} alt="" className="size-14 rounded-xl object-cover border border-slate-200 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                              <ExternalLink className="size-4 text-white" />
                            </div>
                          </a>
                        )}
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900 text-xs">{cert.title}</p>
                          <p className="text-[10px] text-slate-500">{cert.issued_by || 'Chưa rõ nơi cấp'} • {cert.issue_year || 'N/A'}</p>
                          <span className="inline-block text-[10px] font-bold text-amber-600 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                            Chờ xét duyệt
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tutor.certificates_data && tutor.certificates_data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tutor.certificates_data.map((cert: CertificateItem, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3 bg-white">
                    {cert.imageUrl ? (
                      <a href={cert.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                        <img src={cert.imageUrl} alt="" className="size-12 rounded-xl object-cover border border-slate-100 hover:opacity-80 transition-opacity" />
                      </a>
                    ) : (
                      <div className="size-12 rounded-xl bg-slate-100 text-slate-600 grid place-items-center shrink-0">
                        <Award className="size-6" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900">{cert.title || 'Chứng chỉ gia sư'}</p>
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500">{cert.issuedBy || 'Đã xác minh'} {cert.issuedYear ? `• ${cert.issuedYear}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingCerts.length === 0 && (
              <div className="p-4 border border-slate-200/80 rounded-2xl text-slate-400 text-center bg-white">
                Chưa có dữ liệu bằng cấp.
              </div>
            )}
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end shrink-0 gap-2">
          {!isApproved && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onApprove(tutor.user_id)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" /> Bấm phê duyệt ngay
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}