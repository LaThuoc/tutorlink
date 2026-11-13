'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle2, Edit3, Save, Plus, Trash2, MapPin, Award, Lightbulb, Check,
  User, GraduationCap, Briefcase, AlertCircle, XCircle, Loader2, type LucideIcon, ExternalLink,
} from 'lucide-react';
import {
  SubjectDetailItem,
  EducationItem,
  CertificateItem,
  ExperienceItem,
} from '@/src/types/tutor.type';

import {
  updateTutorEducations,
  updateTutorCertificates,
  removeCertificates, 
  updateTutorExperienceAndSkills,
  updateTutorPersonalInfo,
} from '@/src/modules/tutor/tutor';
import { uploadCertificateImage } from '@/src/lib/supabase/upload';

export interface TutorProfileFullData {
  avatarUrl: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  headline: string;
  bio: string;
  quote: string;
  schoolName: string;
  education: string;
  hourlyRate: number | '';
  teachingAreas: string[];
  teachingModes: string[];
  skills: string[];
  achievements: string[];
  subjectDetails: SubjectDetailItem[];
  educations: EducationItem[];
  certificates: CertificateItem[];
  experiences: ExperienceItem[];
  isCompleted: boolean;
}

export type ProfileStatus = 'pending' | 'approved' | 'rejected';

interface Props {
  data: TutorProfileFullData;
  status?: ProfileStatus;
  onSaved?: () => void;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15';
const cardCls = 'rounded-2xl bg-white shadow-sm ring-1 ring-slate-100';
const btnPrimary =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60';
const btnGhost =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50';

const STATUS_META: Record<ProfileStatus, { label: string; pill: string; icon: LucideIcon; hint: string }> = {
  pending: {
    label: 'Đang chờ admin duyệt',
    pill: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock,
    hint: 'Admin sẽ xem xét trong 1–2 ngày làm việc. Bạn sẽ nhận thông báo khi hồ sơ được duyệt hoặc cần bổ sung.',
  },
  approved: {
    label: 'Hồ sơ đã được duyệt',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: CheckCircle2,
    hint: 'Hồ sơ của bạn đang hiển thị công khai cho học viên.',
  },
  rejected: {
    label: 'Cần bổ sung hồ sơ',
    pill: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: XCircle,
    hint: 'Admin đề nghị bạn chỉnh sửa hồ sơ. Hãy cập nhật các mục cần thiết rồi lưu lại để được xét duyệt lần nữa.',
  },
};

const isFilled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '');

function Section({
  step, title, subtitle, icon: Icon, editing, onEdit, children,
}: {
  step: number | string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  editing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`${cardCls} p-6 transition-all ${editing ? 'ring-2 ring-blue-600 shadow-lg shadow-blue-600/10' : ''}`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="relative grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="size-5" aria-hidden="true" />
            <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
              {step}
            </span>
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {editing ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">Đang chỉnh sửa</span>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:border-blue-600 hover:bg-blue-50"
          >
            <Edit3 className="size-3.5" aria-hidden="true" /> Cập nhật
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, wide = false }: { label: string; value?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-slate-50/70 px-4 py-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{value || <span className="font-normal text-slate-400">Chưa cập nhật</span>}</dd>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2.5 text-sm font-bold text-slate-900">{children}</h3>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs italic text-slate-500">{children}</p>;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EditActions({ onCancel, onSave, isPending }: { onCancel: () => void; onSave: () => void; isPending: boolean }) {
  return (
    <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
      <button type="button" onClick={onCancel} disabled={isPending} className={btnGhost}>Hủy</button>
      <button type="button" onClick={onSave} disabled={isPending} className={btnPrimary}>
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}

function TagInput({
  label, placeholder, value, onChange, onAdd, tags, onRemove, tone,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  tags: string[];
  onRemove: (t: string) => void;
  tone: 'blue' | 'emerald' | 'amber';
}) {
  const toneCls = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  }[tone];
  return (
    <div className="space-y-2.5">
      <span className="block text-xs font-bold text-slate-700">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button type="button" onClick={onAdd} className={`${btnPrimary} shrink-0 px-4`}>Thêm</button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneCls}`}>
              {t}
              <button type="button" onClick={() => onRemove(t)} className="cursor-pointer text-current opacity-60 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TutorProfileSubmittedView({ data, status = 'pending', onSaved }: Props) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [fullName, setFullName] = useState(data.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth || '');
  const [gender, setGender] = useState(data.gender || 'Nam');
  const [phone, setPhone] = useState(data.phone || '');
  const [province, setProvince] = useState(data.province || '');
  const [district, setDistrict] = useState(data.district || '');
  const [address, setAddress] = useState(data.address || '');
  const [schoolName, setSchoolName] = useState(data.schoolName || '');
  const [education, setEducation] = useState(data.education || '');
  const [hourlyRate, setHourlyRate] = useState<number | ''>(data.hourlyRate || '');

  const [headline, setHeadline] = useState(data.headline || '');
  const [bio, setBio] = useState(data.bio || '');
  const [quote, setQuote] = useState(data.quote || '');

  const [subjectDetails, setSubjectDetails] = useState<SubjectDetailItem[]>(data.subjectDetails || []);
  const [newSubName, setNewSubName] = useState('');
  const [newGradesInput, setNewGradesInput] = useState('');

  const [teachingAreas, setTeachingAreas] = useState<string[]>(data.teachingAreas || []);
  const [areaInput, setAreaInput] = useState('');
  const [teachingModes] = useState<string[]>(
    data.teachingModes?.length ? data.teachingModes : ['Dạy Online', 'Dạy Offline'],
  );

  const [educations, setEducations] = useState<EducationItem[]>(data.educations || []);
  const [certificates, setCertificates] = useState<CertificateItem[]>(data.certificates || []);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null); // >>> SỬA: id chứng chỉ đang xóa
  const [experiences, setExperiences] = useState<ExperienceItem[]>(data.experiences || []);
  const [achievements, setAchievements] = useState<string[]>(data.achievements || []);
  const [skills, setSkills] = useState<string[]>(data.skills || []);

  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const [prevData, setPrevData] = useState(data);

  if (data !== prevData) {
    setPrevData(data);
    setFullName(data.fullName || '');
    setDateOfBirth(data.dateOfBirth || '');
    setGender(data.gender || 'Nam');
    setPhone(data.phone || '');
    setProvince(data.province || '');
    setDistrict(data.district || '');
    setAddress(data.address || '');
    setSchoolName(data.schoolName || '');
    setEducation(data.education || '');
    setHourlyRate(data.hourlyRate || '');
    setHeadline(data.headline || '');
    setBio(data.bio || '');
    setQuote(data.quote || '');
    setSubjectDetails(data.subjectDetails || []);
    setTeachingAreas(data.teachingAreas || []);
    setEducations(data.educations || []);
    setCertificates(data.certificates || []);
    setExperiences(data.experiences || []);
    setAchievements(data.achievements || []);
    setSkills(data.skills || []);
  }

  const handleAddSubjectDetail = () => {
    if (!newSubName.trim()) return setFormError('Vui lòng nhập tên môn học.');
    const grades = newGradesInput.split(',').map((g) => g.trim()).filter(Boolean);
    if (grades.length === 0) return setFormError('Vui lòng nhập ít nhất 1 khối lớp.');
    setFormError('');
    setSubjectDetails([...subjectDetails, { subject: newSubName.trim(), grades }]);
    setNewSubName('');
    setNewGradesInput('');
  };

  const addTag = (val: string, list: string[], setList: (v: string[]) => void, setInp: (v: string) => void) => {
    const t = val.trim();
    if (t && !list.includes(t)) { setList([...list, t]); setInp(''); }
  };
  const removeTag = (val: string, list: string[], setList: (v: string[]) => void) => setList(list.filter((i) => i !== val));

  const patch = <T,>(list: T[], setList: (v: T[]) => void, idx: number, changes: Partial<T>) =>
    setList(list.map((item, i) => (i === idx ? { ...item, ...changes } : item)));

  const closeEditor = () => { setEditingSection(null); setFormError(''); };

  const handleSavePersonalInfo = () => {
    setFormError('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await updateTutorPersonalInfo({
        fullName, dateOfBirth, gender, phone, province, district, address,
        schoolName, education, hourlyRate, headline, bio, quote,
        subjectDetails, teachingAreas, teachingModes
      });
      if (res.success) {
        setSuccessMsg(res.message || 'Cập nhật thông tin cá nhân thành công!');
        closeEditor();
        onSaved?.();
      } else {
        setFormError(res.errors || 'Lỗi khi cập nhật thông tin cá nhân.');
      }
    });
  };

  const handleSaveEducations = () => {
    setFormError('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await updateTutorEducations(educations);
      if (res.success) {
        setSuccessMsg(res.message || 'Cập nhật quá trình học tập thành công!');
        closeEditor();
        onSaved?.();
      } else {
        setFormError(res.errors || 'Lỗi khi cập nhật học vấn.');
      }
    });
  };

  const handleSaveCertificates = () => {
    setFormError('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await updateTutorCertificates(certificates);
      if (res.success) {
        setSuccessMsg(res.message || 'Gửi yêu cầu xét duyệt chứng chỉ thành công!');
        closeEditor();
        onSaved?.(); 
      } else {
        setFormError(res.errors || 'Lỗi khi gửi chứng chỉ xét duyệt.');
      }
    });
  };


  const handleDeleteCertificate = (c: CertificateItem, idx: number) => {
    const isSavedInProfile = (data.certificates || []).some((x) => x.id === c.id);

    if (!isSavedInProfile) {
      setCertificates((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    const ok = window.confirm(
      `Bạn có chắc muốn xóa chứng chỉ "${c.title || 'chưa đặt tên'}"? Hành động này không thể hoàn tác.`,
    );
    if (!ok) return;

    setFormError('');
    setSuccessMsg('');
    setDeletingCertId(c.id);
    startTransition(async () => {
      const res = await removeCertificates([c.id]);
      setDeletingCertId(null);
      if (res.success) {
        setCertificates((prev) => prev.filter((x) => x.id !== c.id));
        setSuccessMsg(res.message || 'Đã xóa chứng chỉ thành công!');
      } else {
        setFormError(res.errors || 'Lỗi khi xóa chứng chỉ.');
      }
    });
  };


  const handleSaveExperienceAndSkills = () => {
    setFormError('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await updateTutorExperienceAndSkills({
        experiences,
        achievements,
        skills,
      });
      if (res.success) {
        setSuccessMsg(res.message || 'Cập nhật kinh nghiệm & thành tích thành công!');
        closeEditor();
        onSaved?.();
      } else {
        setFormError(res.errors || 'Lỗi khi cập nhật kinh nghiệm & thành tích.');
      }
    });
  };

  const groups = [
    { label: 'Thông tin cá nhân & giảng dạy', fields: [fullName, dateOfBirth, gender, phone, province, district, address, schoolName, education, hourlyRate, headline, bio, subjectDetails, teachingAreas] },
    { label: 'Học vấn & chứng chỉ', fields: [educations, certificates] },
    { label: 'Kinh nghiệm & thành tích', fields: [experiences, achievements, skills] },
  ].map((g) => {
    const done = g.fields.filter(isFilled).length;
    return { ...g, done, total: g.fields.length, missing: g.fields.length - done };
  });
  const totalDone = groups.reduce((s, g) => s + g.done, 0);
  const totalAll = groups.reduce((s, g) => s + g.total, 0);
  const percent = Math.round((totalDone / totalAll) * 100);
  const RING = 2 * Math.PI * 40;

  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  const steps = [
    { title: 'Đã gửi hồ sơ', note: 'Hoàn tất', tone: 'done' as const },
    {
      title: status === 'pending' ? 'Admin đang xét duyệt' : 'Admin đã xét duyệt',
      note: status === 'pending' ? 'Dự kiến 1–2 ngày làm việc' : 'Hoàn tất',
      tone: status === 'pending' ? ('current' as const) : ('done' as const),
    },
    {
      title: status === 'rejected' ? 'Cần bổ sung hồ sơ' : 'Hồ sơ được duyệt',
      note: status === 'approved' ? 'Đang hiển thị công khai' : status === 'rejected' ? 'Cập nhật rồi gửi lại' : 'Hiển thị công khai cho học viên',
      tone: status === 'approved' ? ('done' as const) : status === 'rejected' ? ('error' as const) : ('todo' as const),
    },
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="relative">
            <Link href="/dashboard/tutor" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Quay lại tổng quan
            </Link>

            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">Hồ sơ gia sư của bạn</h1>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Kiểm tra lại toàn bộ thông tin đã nhập. Bấm “Cập nhật” ở từng mục để chỉnh sửa riêng mục đó.
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ${meta.pill}`}>
                <StatusIcon className="size-4" aria-hidden="true" /> {meta.label}
              </span>
            </div>

            {successMsg && (
              <div role="status" className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" /> {successMsg}
              </div>
            )}
            {formError && (
              <div role="alert" className="mt-4 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
                <AlertCircle className="size-5 shrink-0" aria-hidden="true" /> {formError}
              </div>
            )}

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/80 p-4 text-sm text-slate-700 ring-1 ring-slate-100 backdrop-blur">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <b className="block text-slate-900">Gửi hồ sơ thành công!</b>
                <span className="text-slate-600">{meta.hint}</span>
              </div>
            </div>
          </div>
        </section>

        {/* MỤC 1 */}
        <Section
          step={1}
          icon={User}
          title="Thông tin cá nhân & Giảng dạy"
          subtitle="Thông tin liên hệ, đơn vị công tác và thông tin lớp học"
          editing={editingSection === 's1'}
          onEdit={() => setEditingSection('s1')}
        >
          {editingSection !== 's1' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-transparent p-4">
                {data.avatarUrl ? (
                  <img src={data.avatarUrl} alt="Ảnh đại diện" className="size-[72px] rounded-full object-cover ring-4 ring-white shadow-sm" />
                ) : (
                  <div className="grid size-[72px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-bold text-white ring-4 ring-white shadow-sm">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : 'GS'}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-900">{fullName || 'Chưa cập nhật'}</h3>
                  <p className="text-sm text-slate-600">{headline || 'Chưa có tiêu đề hồ sơ'}</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Họ và tên gia sư" value={fullName} />
                <Info label="Ngày sinh" value={dateOfBirth} />
                <Info label="Giới tính" value={gender} />
                <Info label="Số điện thoại / Zalo" value={phone} />
                <Info label="Tỉnh / Thành phố" value={province} />
                <Info label="Quận / Huyện" value={district} />
                <Info label="Địa chỉ cụ thể" value={address} wide />
                <Info label="Trường / Đơn vị công tác" value={schoolName} />
                <Info label="Trình độ / Bằng cấp" value={education} />
                <Info label="Học phí" value={hourlyRate ? `${Number(hourlyRate).toLocaleString('vi-VN')}đ / buổi` : ''} />
              </dl>

              <div>
                <SubTitle>Môn dạy &amp; các khối lớp tương ứng</SubTitle>
                {subjectDetails.length === 0 ? <Empty>Chưa thêm môn dạy nào.</Empty> : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {subjectDetails.map((sd, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                        <b className="block text-sm text-slate-900">{sd.subject}</b>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(sd.grades || []).map((g) => (
                            <span key={g} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{g}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <SubTitle>Khu vực nhận dạy</SubTitle>
                  {teachingAreas.length === 0 ? <Empty>Chưa thêm khu vực.</Empty> : (
                    <div className="flex flex-wrap gap-2">
                      {teachingAreas.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          <MapPin className="size-3.5" aria-hidden="true" /> {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <SubTitle>Hình thức giảng dạy</SubTitle>
                  <div className="flex flex-wrap gap-2">
                    {teachingModes.map((m) => (
                      <span key={m} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5">
                <SubTitle>Giới thiệu</SubTitle>
                <p className="text-sm leading-relaxed text-slate-700">{bio || <span className="italic text-slate-400">Chưa có lời giới thiệu.</span>}</p>
                {quote && (
                  <blockquote className="rounded-xl bg-blue-50/70 px-4 py-3 text-sm italic text-blue-900 ring-1 ring-blue-100">“{quote}”</blockquote>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Họ và tên gia sư"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} /></Field>
                <Field label="Ngày sinh"><input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputCls} /></Field>
                <Field label="Giới tính">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                    <option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                  </select>
                </Field>
                <Field label="Số điện thoại / Zalo"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
                <Field label="Tỉnh / Thành phố"><input value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls} /></Field>
                <Field label="Quận / Huyện"><input value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls} /></Field>
                <Field label="Địa chỉ cụ thể" wide><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} /></Field>
                <Field label="Trường công tác"><input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={inputCls} /></Field>
                <Field label="Trình độ / Bằng cấp"><input value={education} onChange={(e) => setEducation(e.target.value)} className={inputCls} /></Field>
                <Field label="Học phí (VNĐ / buổi)">
                  <input type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls} />
                </Field>
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50/70 p-4">
                <SubTitle>Môn dạy &amp; lớp dạy</SubTitle>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1.4fr_auto]">
                  <input placeholder="Tên môn học" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className={inputCls} />
                  <input placeholder="Lớp nhận dạy (VD: Lớp 10, Lớp 11)" value={newGradesInput} onChange={(e) => setNewGradesInput(e.target.value)} className={inputCls} />
                  <button type="button" onClick={handleAddSubjectDetail} className={btnPrimary}><Plus className="size-4" aria-hidden="true" /> Thêm</button>
                </div>
                {subjectDetails.map((sd, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-slate-100">
                    <div>
                      <b className="block text-sm text-blue-600">{sd.subject}</b>
                      <span className="text-xs text-slate-600">{(sd.grades || []).join(', ')}</span>
                    </div>
                    <button type="button" onClick={() => setSubjectDetails(subjectDetails.filter((_, idx) => idx !== i))} className="grid size-8 cursor-pointer place-items-center rounded-lg text-rose-600 hover:bg-rose-50">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <TagInput
                label="Khu vực nhận dạy" placeholder="Nhập khu vực rồi nhấn Enter..." tone="emerald"
                value={areaInput} onChange={setAreaInput}
                onAdd={() => addTag(areaInput, teachingAreas, setTeachingAreas, setAreaInput)}
                tags={teachingAreas} onRemove={(t) => removeTag(t, teachingAreas, setTeachingAreas)}
              />

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <Field label="Tiêu đề hồ sơ (Headline)"><input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} /></Field>
                <Field label="Lời giới thiệu (Bio)"><textarea value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputCls} h-28 resize-none`} /></Field>
                <Field label="Châm ngôn (Quote)"><input value={quote} onChange={(e) => setQuote(e.target.value)} className={inputCls} /></Field>
              </div>

              <EditActions onCancel={closeEditor} onSave={handleSavePersonalInfo} isPending={isPending} />
            </div>
          )}
        </Section>

        <Section
          step="2A"
          icon={GraduationCap}
          title="Quá trình học tập (Educations)"
          subtitle="Thông tin về trường, chuyên ngành và quá trình học"
          editing={editingSection === 'educations'}
          onEdit={() => setEditingSection('educations')}
        >
          {editingSection !== 'educations' ? (
            <div>
              {educations.length === 0 ? <Empty>Chưa có thông tin học vấn.</Empty> : (
                <ol className="relative ml-2 space-y-3 border-l-2 border-blue-100 pl-6">
                  {educations.map((edu, i) => (
                    <li key={i} className="relative rounded-xl bg-slate-50/70 p-4">
                      <span className="absolute -left-[31px] top-5 size-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-200" />
                      <div className="flex flex-wrap items-center gap-2">
                         <p className="text-xs font-semibold text-blue-600">{edu.period || 'Chưa rõ thời gian'}</p>
                         {edu.status && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200/80">
                            {edu.status}
                          </span>
                        )}

                      </div>
                      <b className="mt-0.5 block text-sm text-slate-900">{edu.schoolName}</b>
                      {edu.major && <p className="text-xs font-semibold text-slate-700">Chuyên ngành: {edu.major}</p>}
                      {edu.gpa && <p className="text-xs font-semibold text-slate-700">Điểm GPA: {edu.gpa}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SubTitle>Danh sách quá trình học tập</SubTitle>
                <button
                  type="button"
                  onClick={() => setEducations([...educations, { id: Date.now().toString(), schoolName: '', major: '', period: '', status: '', description: '' }])}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <Plus className="size-3.5" aria-hidden="true" /> Thêm học vấn
                </button>
              </div>
              {educations.map((edu, idx) => (
                <div key={idx} className="space-y-2.5 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">Học vấn #{idx + 1}</span>
                    <button type="button" onClick={() => setEducations(educations.filter((_, i) => i !== idx))} className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-rose-600 hover:underline">
                      <Trash2 className="size-3.5" aria-hidden="true" /> Xóa
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <input placeholder="Thời gian (VD: 2021 – 2025)" value={edu.period} onChange={(e) => patch(educations, setEducations, idx, { period: e.target.value })} className={inputCls} />
                    <input placeholder="Tên trường" value={edu.schoolName} onChange={(e) => patch(educations, setEducations, idx, { schoolName: e.target.value })} className={inputCls} />
                    <input placeholder="Chuyên ngành" value={edu.major} onChange={(e) => patch(educations, setEducations, idx, { major: e.target.value })} className={inputCls} />
                  </div>
                </div>
              ))}
              <EditActions onCancel={closeEditor} onSave={handleSaveEducations} isPending={isPending} />
            </div>
          )}
        </Section>

        {/* MỤC 2B */}
        <Section
          step="2B"
          icon={Award}
          title="Bằng cấp & Chứng chỉ (Certificates)"
          subtitle="Chứng chỉ ngoại ngữ, bằng tốt nghiệp hoặc chứng chỉ sư phạm"
          editing={editingSection === 'certificates'}
          onEdit={() => setEditingSection('certificates')}
        >
          {editingSection !== 'certificates' ? (
            <div>
              {certificates.length === 0 ? <Empty>Chưa có chứng chỉ nào.</Empty> : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {certificates.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      {c.imageUrl ? (
                        <a href={c.imageUrl} target="_blank" rel="noreferrer" className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 group">
                          <img
                            src={c.imageUrl}
                            alt={c.title}
                            className="size-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <ExternalLink className="size-4" />
                          </span>
                        </a>
                      ) : (
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                          <Award className="size-5" aria-hidden="true" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <b className="block text-sm text-slate-900">{c.title || 'Chưa đặt tên'}</b>
                        <p className="text-xs text-slate-600">{c.issuedBy}{c.issuedYear ? ` · ${c.issuedYear}` : ''}</p>
                        {c.detail && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.detail}</p>}
                        
                        {c.isVerified ? (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                            <Check className="size-3" aria-hidden="true" /> Đã được Admin duyệt &amp; xác thực
                          </span>
                        ) : c.imageUrl ? (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                            <Clock className="size-3" aria-hidden="true" /> Đang chờ Admin xét duyệt
                          </span>
                        ) : (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            ⚠️ Chưa có ảnh minh chứng
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <SubTitle>Cập nhật bằng cấp &amp; chứng chỉ mới</SubTitle>
                  <p className="text-xs text-slate-500">Các chứng chỉ mới kèm ảnh minh chứng sẽ được gửi cho Admin phê duyệt trước khi hiển thị công khai.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCertificates([...certificates, { id: Date.now().toString(), title: '', issuedBy: '', issuedYear: '', detail: '', imageUrl: '', isVerified: false } as unknown as CertificateItem])}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <Plus className="size-3.5" aria-hidden="true" /> Thêm chứng chỉ
                </button>
              </div>

              {certificates.map((c, idx) => (
                <div key={idx} className="space-y-3 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">
                      Chứng chỉ #{idx + 1} {c.isVerified && <span className="text-emerald-600 font-normal">(Đã duyệt)</span>}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteCertificate(c, idx)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCertId === c.id ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      )}
                      {deletingCertId === c.id ? 'Đang xóa...' : 'Xóa chứng chỉ'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <input
                      placeholder="Tên chứng chỉ (VD: IELTS 7.0)"
                      value={c.title}
                      onChange={(e) => patch(certificates, setCertificates, idx, { title: e.target.value } as Partial<CertificateItem>)}
                      className={inputCls}
                    />
                    <input
                      placeholder="Đơn vị cấp (VD: British Council)"
                      value={c.issuedBy}
                      onChange={(e) => patch(certificates, setCertificates, idx, { issuedBy: e.target.value } as Partial<CertificateItem>)}
                      className={inputCls}
                    />
                    <input
                      placeholder="Năm cấp (VD: 2024)"
                      value={c.issuedYear}
                      onChange={(e) => patch(certificates, setCertificates, idx, { issuedYear: e.target.value } as Partial<CertificateItem>)}
                      className={inputCls}
                    />
                  </div>

                  <input
                    placeholder="Mô tả / Chi tiết thêm (không bắt buộc)"
                    value={c.detail || ''}
                    onChange={(e) => patch(certificates, setCertificates, idx, { detail: e.target.value } as Partial<CertificateItem>)}
                    className={inputCls}
                  />

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">Ảnh minh chứng (Tải ảnh lên hoặc dán URL)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {c.imageUrl ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <img src={c.imageUrl} alt="Minh chứng" className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => patch(certificates, setCertificates, idx, { imageUrl: '' } as Partial<CertificateItem>)}
                            className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-rose-600 text-white shadow text-xs font-bold cursor-pointer"
                            title="Xóa ảnh"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                          {uploadingIdx === idx ? (
                            <span className="flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" /> Đang tải lên...</span>
                          ) : (
                            <span>+ Tải ảnh từ máy</span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingIdx === idx}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (file.size > 5 * 1024 * 1024) {
                                alert('Kích thước ảnh tối đa 5MB');
                                return;
                              }

                              setUploadingIdx(idx);
                              const publicUrl = await uploadCertificateImage(file, data.phone || 'tutor');
                              setUploadingIdx(null);

                              if (publicUrl) {
                                patch(certificates, setCertificates, idx, { imageUrl: publicUrl } as Partial<CertificateItem>);
                              } else {
                                alert('Lỗi upload ảnh! Vui lòng thử lại.');
                              }
                            }}
                          />
                        </label>
                      )}

                      <input
                        placeholder="Hoặc dán URL đường dẫn ảnh tại đây..."
                        value={c.imageUrl || ''}
                        onChange={(e) => patch(certificates, setCertificates, idx, { imageUrl: e.target.value } as Partial<CertificateItem>)}
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <EditActions onCancel={closeEditor} onSave={handleSaveCertificates} isPending={isPending} />
            </div>
          )}
        </Section>

        {/* MỤC 3 */}
        <Section
          step={3}
          icon={Briefcase}
          title="Kinh nghiệm giảng dạy & Thành tích nổi bật"
          subtitle="Quá trình giảng dạy, giải thưởng và kỹ năng chuyên môn"
          editing={editingSection === 's3'}
          onEdit={() => setEditingSection('s3')}
        >
          {editingSection !== 's3' ? (
            <div className="space-y-6">
              <div>
                <SubTitle>Kinh nghiệm giảng dạy</SubTitle>
                {experiences.length === 0 ? <Empty>Chưa có thông tin kinh nghiệm.</Empty> : (
                  <ol className="relative ml-2 space-y-3 border-l-2 border-blue-100 pl-6">
                    {experiences.map((exp, i) => (
                      <li key={i} className="relative rounded-xl bg-slate-50/70 p-4">
                        <span className="absolute -left-[31px] top-5 size-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-200" />
                        <p className="text-xs font-semibold text-blue-600">{exp.period}</p>
                        <b className="mt-0.5 block text-sm text-slate-900">{exp.role}{exp.company ? ` - ${exp.company}` : ''}</b>
                        {exp.description && <p className="mt-1 text-xs leading-relaxed text-slate-600">{exp.description}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <SubTitle>Thành tích &amp; giải thưởng nổi bật</SubTitle>
                {achievements.length === 0 ? <Empty>Chưa có thành tích nào.</Empty> : (
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((ac, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                        <Award className="size-3.5 text-amber-600" aria-hidden="true" /> {ac}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <SubTitle>Kỹ năng nổi bật</SubTitle>
                {skills.length === 0 ? <Empty>Chưa có kỹ năng nào.</Empty> : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((sk, i) => <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{sk}</span>)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SubTitle>Kinh nghiệm giảng dạy</SubTitle>
                  <button type="button" onClick={() => setExperiences([...experiences, { id: Date.now().toString(), role: '', company: '', period: '', description: '' } as unknown as ExperienceItem])} className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                    <Plus className="size-3.5" aria-hidden="true" /> Thêm kinh nghiệm
                  </button>
                </div>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="space-y-2.5 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600">Kinh nghiệm #{idx + 1}</span>
                      <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-rose-600 hover:underline">
                        <Trash2 className="size-3.5" aria-hidden="true" /> Xóa
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      <input placeholder="Vị trí (VD: Gia sư Toán)" value={exp.role} onChange={(e) => patch(experiences, setExperiences, idx, { role: e.target.value } as Partial<ExperienceItem>)} className={inputCls} />
                      <input placeholder="Nơi làm việc" value={exp.company} onChange={(e) => patch(experiences, setExperiences, idx, { company: e.target.value } as Partial<ExperienceItem>)} className={inputCls} />
                      <input placeholder="Thời gian" value={exp.period} onChange={(e) => patch(experiences, setExperiences, idx, { period: e.target.value } as Partial<ExperienceItem>)} className={inputCls} />
                    </div>
                    <textarea placeholder="Mô tả ngắn công việc" value={exp.description} onChange={(e) => patch(experiences, setExperiences, idx, { description: e.target.value } as Partial<ExperienceItem>)} className={`${inputCls} h-20 resize-none`} />
                  </div>
                ))}
              </div>

              <div className="space-y-5 border-t border-slate-100 pt-5">
                <TagInput
                  label="Kỹ năng nổi bật" placeholder="Nhập kỹ năng rồi nhấn Enter..." tone="blue"
                  value={skillInput} onChange={setSkillInput}
                  onAdd={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                  tags={skills} onRemove={(t) => removeTag(t, skills, setSkills)}
                />
                <TagInput
                  label="Thành tích nổi bật" placeholder="Nhập thành tích rồi nhấn Enter..." tone="amber"
                  value={achievementInput} onChange={setAchievementInput}
                  onAdd={() => addTag(achievementInput, achievements, setAchievements, setAchievementInput)}
                  tags={achievements} onRemove={(t) => removeTag(t, achievements, setAchievements)}
                />
              </div>

              <EditActions onCancel={closeEditor} onSave={handleSaveExperienceAndSkills} isPending={isPending} />
            </div>
          )}
        </Section>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-5 xl:sticky xl:top-20">
        <section className={`${cardCls} p-5`}>
          <h3 className="mb-4 text-sm font-bold text-slate-900">Trạng thái hồ sơ</h3>
          <ol>
            {steps.map((s, i) => {
              const dot =
                s.tone === 'done' ? 'bg-emerald-600 text-white'
                : s.tone === 'current' ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                : s.tone === 'error' ? 'bg-rose-500 text-white ring-4 ring-rose-100'
                : 'bg-slate-200 text-slate-600';
              return (
                <li key={s.title} className="relative flex gap-3.5 pb-6 last:pb-0">
                  {i < steps.length - 1 && (
                    <span aria-hidden="true" className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${s.tone === 'done' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  )}
                  <span className={`relative grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${dot}`}>
                    {s.tone === 'done' ? <Check className="size-4" aria-hidden="true" /> : s.tone === 'error' ? '!' : i + 1}
                  </span>
                  <div className={s.tone === 'todo' ? 'opacity-60' : ''}>
                    <b className="block text-sm text-slate-900">{s.title}</b>
                    <span className="text-xs text-slate-500">{s.note}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={`${cardCls} p-5`}>
          <h3 className="mb-4 text-sm font-bold text-slate-900">Mức độ hoàn thiện</h3>
          <div className="flex items-center gap-4">
            <div className="relative size-24 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-slate-100" />
                <circle
                  cx="50" cy="50" r="40" fill="none" strokeWidth="10" strokeLinecap="round"
                  className={percent === 100 ? 'stroke-emerald-500' : 'stroke-blue-600'}
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - percent / 100)}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-lg font-extrabold text-slate-900">{percent}%</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {percent === 100 ? 'Hồ sơ của bạn đã đầy đủ. Học viên sẽ dễ tìm thấy bạn hơn!' : 'Bổ sung thêm thông tin để hồ sơ nổi bật hơn.'}
            </p>
          </div>
          <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
            {groups.map((g) => (
              <li key={g.label} className="flex items-center justify-between gap-3">
                <span className="text-slate-600">{g.label}</span>
                {g.missing === 0 ? (
                  <span className="shrink-0 font-bold text-emerald-600">Đầy đủ</span>
                ) : (
                  <span className="shrink-0 font-bold text-amber-600">Thiếu {g.missing} mục</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-blue-50/70 p-4 ring-1 ring-blue-100">
          <b className="flex items-center gap-1.5 text-sm text-blue-900">
            <Lightbulb className="size-4 shrink-0 text-blue-600" aria-hidden="true" /> Lưu ý
          </b>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Khi cập nhật chứng chỉ mới, Admin sẽ kiểm tra và đối chiếu minh chứng trước khi công khai lên trang cá nhân và hiển thị cho sinh viên/học viên.
          </p>
        </section>
      </aside>
    </div>
  );
}