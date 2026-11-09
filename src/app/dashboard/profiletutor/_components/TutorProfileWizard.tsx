'use client';

import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, Camera, User, CheckCircle2, AlertCircle, 
  Plus, Trash2, GraduationCap, Briefcase, Upload, X, Info, Loader2,
  MapPin, Award
} from 'lucide-react';
import { 
  TutorActionState, 
  SubjectDetailItem, 
  EducationItem, 
  CertificateItem, 
  ExperienceItem 
} from '@/src/types/tutor.type';
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

interface Props {
  data: TutorProfileFullData;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  state: TutorActionState | null;
}

const STEPS = [
  "Thông tin cá nhân & Giảng dạy",
  "Học vấn & Chứng chỉ",
  "Kinh nghiệm & Thành tích",
  "Xem lại & Hoàn tất"
];

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all";

function Field({ 
  label, 
  required, 
  hint, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  hint?: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {children}
      {hint && (
        <p className="flex items-center gap-1 text-[11px] text-slate-400 font-normal">
          <Info className="size-3 text-slate-400 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}

export default function TutorProfileWizard({ data, formAction, isPending, state }: Props) {
  const [step, setStep] = useState(0);

  // Đảm bảo Form khởi tạo trống 100% để người dùng tự tay nhập từ đầu
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl || '');
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
  const [teachingModes, setTeachingModes] = useState<string[]>(
    data.teachingModes?.length ? data.teachingModes : ['Dạy Online', 'Dạy Offline']
  );

  const [educations, setEducations] = useState<EducationItem[]>(data.educations || []);
  const [certificates, setCertificates] = useState<CertificateItem[]>(data.certificates || []);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(data.experiences || []);
  const [achievements, setAchievements] = useState<string[]>(data.achievements || []);
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const [uploadingCertIdx, setUploadingCertIdx] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Kích thước ảnh tối đa 5MB");

    const previousUrl = avatarUrl;
    setAvatarUrl(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const publicUrl = await uploadCertificateImage(file, `avatar_${phone || 'new_tutor'}`);
    setUploadingAvatar(false);

    if (publicUrl) {
      setAvatarUrl(publicUrl);
    } else {
      setAvatarUrl(previousUrl);
      alert("Tải ảnh đại diện thất bại. Vui lòng kiểm tra lại Supabase Storage!");
    }
    input.value = '';
  };

  const handlePickCertImage = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert("Kích thước ảnh tối đa 5MB");
    }

    setUploadingCertIdx(idx);
    const publicUrl = await uploadCertificateImage(file, phone || 'new_tutor');
    setUploadingCertIdx(null);

    if (publicUrl) {
      const updated = [...certificates];
      updated[idx].imageUrl = publicUrl;
      setCertificates(updated);
    } else {
      alert("Tải ảnh thất bại. Vui lòng kiểm tra lại Supabase Storage!");
    }
  };

  const handleAddSubjectDetail = () => {
    if (!newSubName.trim()) return alert("Vui lòng nhập tên môn học (VD: Toán, Ngữ văn)");
    const grades = newGradesInput.split(',').map(g => g.trim()).filter(Boolean);
    if (grades.length === 0) return alert("Vui lòng nhập ít nhất 1 khối lớp nhận dạy (VD: Lớp 10, Lớp 11)");
    setSubjectDetails([...subjectDetails, { subject: newSubName.trim(), grades }]);
    setNewSubName('');
    setNewGradesInput('');
  };

  const addTag = (val: string, list: string[], setList: (v: string[]) => void, setInp: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInp('');
    }
  };

  const removeTag = (val: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(item => item !== val));
  };

  const toggleTeachingMode = (mode: string) => {
    if (teachingModes.includes(mode)) {
      if (teachingModes.length > 1) setTeachingModes(teachingModes.filter(m => m !== mode));
    } else {
      setTeachingModes([...teachingModes, mode]);
    }
  };

  const derivedSubjects = Array.from(new Set(subjectDetails.map(sd => sd.subject)));
  const derivedGrades = Array.from(new Set(subjectDetails.flatMap(sd => sd.grades || [])));

  return (
    <div className="space-y-5">
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Khởi tạo hồ sơ gia sư mới</h1>
        <p className="text-xs font-medium text-slate-400 mb-6">
          Hoàn thành lần lượt 4 bước để nộp hồ sơ gửi admin xét duyệt.
        </p>

        {state?.errors && (
          <div className="mb-5 flex items-start gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p>{state.errors}</p>
              {state.fieldErrors && (
                <ul className="mt-1 list-disc pl-4 font-normal text-[11px] space-y-0.5">
                  {Object.entries(state.fieldErrors).map(([key, errs]) => (
                    <li key={key}><b>{key}:</b> {errs?.join(', ')}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <ol className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2.5 last:flex-none">
              <button 
                type="button" 
                onClick={() => setStep(i)} 
                className="flex items-center gap-2 whitespace-nowrap text-xs cursor-pointer"
              >
                <span className={`grid size-8 place-items-center rounded-full border text-xs font-bold transition-all ${
                  i === step 
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "bg-white border-slate-200 text-slate-600"
                }`}>
                  {i + 1}
                </span>
                <span className={i === step ? "font-bold text-blue-600" : "font-medium text-slate-600"}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px min-w-4 flex-1 bg-slate-200" />}
            </li>
          ))}
        </ol>
      </section>

      <form 
        action={formAction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') e.preventDefault();
        }}
        className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6"
      >
        <input type="hidden" name="avatarUrl" value={avatarUrl.startsWith('blob:') ? '' : avatarUrl} />
        <input type="hidden" name="fullName" value={fullName} />
        <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
        <input type="hidden" name="gender" value={gender} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="province" value={province} />
        <input type="hidden" name="district" value={district} />
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="schoolName" value={schoolName} />
        <input type="hidden" name="education" value={education} />
        <input type="hidden" name="hourlyRate" value={hourlyRate} />
        <input type="hidden" name="headline" value={headline} />
        <input type="hidden" name="bio" value={bio} />
        <input type="hidden" name="quote" value={quote} />

        <input type="hidden" name="subjectDetails" value={JSON.stringify(subjectDetails)} />
        <input type="hidden" name="educations" value={JSON.stringify(educations)} />
        <input type="hidden" name="certificates" value={JSON.stringify(certificates)} />
        <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />
        <input type="hidden" name="teachingAreas" value={JSON.stringify(teachingAreas)} />
        <input type="hidden" name="teachingModes" value={JSON.stringify(teachingModes)} />
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        <input type="hidden" name="achievements" value={JSON.stringify(achievements)} />
        <input type="hidden" name="subjects" value={JSON.stringify(derivedSubjects)} />
        <input type="hidden" name="grades" value={JSON.stringify(derivedGrades)} />

        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="size-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Bước 1: Thông tin cá nhân & Giảng dạy</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[160px_1fr]">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex min-h-[140px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 p-3 text-center text-xs text-slate-500 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {avatarUrl ? (
                  <div className="relative">
                    <img src={avatarUrl} alt="Avatar" className="size-28 rounded-full object-cover shadow-sm ring-2 ring-blue-100" />
                    {uploadingAvatar && (
                      <span className="absolute inset-0 grid place-items-center rounded-full bg-white/70">
                        <Loader2 className="size-5 animate-spin text-blue-600" />
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <Camera className="size-6 text-blue-600" />
                    <b className="text-xs text-slate-800">Tải ảnh chân dung</b>
                    <span>Tối đa 5MB (JPG, PNG)</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePickAvatar} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Họ và tên gia sư" required hint="Nhập họ tên thật ghi trên CCCD/Bằng cấp">
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="VD: Nguyễn Văn A" />
                </Field>
                <Field label="Ngày sinh" required hint="Chọn ngày tháng năm sinh">
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Giới tính" required>
                  <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </Field>
                <Field label="Số điện thoại / Zalo" required hint="SĐT di động 10 số (VD: 0987654321)">
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="VD: 0987654321" />
                </Field>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Tỉnh / Thành phố" required hint="Tỉnh/Thành phố hiện tại">
                <input value={province} onChange={e => setProvince(e.target.value)} className={inputCls} placeholder="VD: Hà Nội" />
              </Field>
              <Field label="Quận / Huyện" required hint="Quận/Huyện đang cư trú">
                <input value={district} onChange={e => setDistrict(e.target.value)} className={inputCls} placeholder="VD: Thanh Xuân" />
              </Field>
              <Field label="Địa chỉ cụ thể" hint="Tùy chọn: Đường, số nhà, phường/xã">
                <input value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="VD: Số 12, ngõ 34 Nguyễn Trãi" />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Trường / Đơn vị công tác" required hint="Trường ĐH đã/đang học hoặc nơi làm việc">
                <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputCls} placeholder="VD: ĐH Sư phạm Hà Nội" />
              </Field>
              <Field label="Trình độ / Bằng cấp" required hint="VD: Cử nhân, Sinh viên năm 3">
                <input value={education} onChange={e => setEducation(e.target.value)} className={inputCls} placeholder="VD: Cử nhân Sư phạm Toán" />
              </Field>
              <Field label="Học phí (VNĐ / buổi)" required hint="Giá trị trong khoảng 10.000 – 5.000.000 VNĐ">
                <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls} placeholder="VD: 200000" />
              </Field>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <b className="text-xs font-bold text-slate-800 block">Môn dạy & Các khối lớp nhận dạy tương ứng *</b>
              
              <div className="p-4 border border-blue-100 bg-blue-50/40 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Tên môn học" hint="VD: Toán, Ngữ văn">
                    <input type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Nhập tên môn học..." className={inputCls} />
                  </Field>
                  <Field label="Các khối lớp nhận dạy" hint="Phân cách bằng dấu phẩy (VD: Lớp 10, Lớp 11)">
                    <input type="text" value={newGradesInput} onChange={e => setNewGradesInput(e.target.value)} placeholder="VD: Lớp 10, Lớp 11" className={inputCls} />
                  </Field>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddSubjectDetail} 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Plus className="size-4" /> Thêm môn học & Lớp dạy
                </button>
              </div>

              <div className="space-y-2">
                {subjectDetails.length === 0 && (
                  <p className="text-xs text-rose-500 italic flex items-center gap-1">
                    <AlertCircle className="size-3.5" /> {"Chưa có môn học nào. Bạn phải bấm \"Thêm môn học & Lớp dạy\" ở trên."}
                  </p>
                )}
                {subjectDetails.map((sd, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-white shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-blue-600 block">{sd.subject}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(sd.grades || []).map(g => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">{g}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSubjectDetails(subjectDetails.filter((_, i) => i !== idx))}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" /> Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <Field label="Khu vực nhận dạy (Quận / Huyện / Địa bàn)" hint="Nhập tên khu vực và nhấn nút Thêm hoặc phím Enter">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={areaInput} 
                    onChange={e => setAreaInput(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(areaInput, teachingAreas, setTeachingAreas, setAreaInput); } }} 
                    placeholder="VD: Thanh Xuân, Cầu Giấy..." 
                    className={inputCls} 
                  />
                  <button 
                    type="button" 
                    onClick={() => addTag(areaInput, teachingAreas, setTeachingAreas, setAreaInput)} 
                    className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                  >
                    Thêm khu vực
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap gap-2 pt-1">
                {teachingAreas.map(area => (
                  <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    <MapPin className="size-3 text-emerald-600" /> {area}
                    <button type="button" onClick={() => removeTag(area, teachingAreas, setTeachingAreas)} className="text-emerald-500 hover:text-rose-600 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800">Hình thức giảng dạy *</label>
              <div className="flex items-center gap-6">
                {['Dạy Online', 'Dạy Offline'].map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={teachingModes.includes(mode)} onChange={() => toggleTeachingMode(mode)} className="size-4 rounded text-blue-600" />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <Field label="Tiêu đề hồ sơ (Headline)" hint="VD: Gia sư Toán 3 năm kinh nghiệm">
                <input value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} placeholder="VD: Gia sư Toán – Lý tận tâm, 3 năm kinh nghiệm" />
              </Field>
              <Field label="Lời giới thiệu chi tiết (Bio)" hint="Mô tả kỹ năng, phương pháp giảng dạy">
                <textarea value={bio} onChange={e => setBio(e.target.value)} className={`${inputCls} h-28 resize-none`} placeholder="Giới thiệu kinh nghiệm, phương pháp giảng dạy..." />
              </Field>
              <Field label="Trích dẫn châm ngôn (Quote)" hint="Châm ngôn giảng dạy yêu thích">
                <input value={quote} onChange={e => setQuote(e.target.value)} className={inputCls} placeholder="VD: Dạy học là thắp sáng ngọn lửa..." />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="size-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Bước 2: Học vấn & Bằng cấp / Chứng chỉ</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-slate-800">Quá trình học tập (Educations)</b>
                <button 
                  type="button" 
                  onClick={() => setEducations([...educations, { id: Date.now().toString(), period: '', schoolName: '', major: '', status: '', description: '' }])}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  <Plus className="size-3.5" /> Thêm quá trình học
                </button>
              </div>

              {educations.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có thông tin học vấn.</p>}

              {educations.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-blue-600">Học vấn #{idx + 1}</span>
                    <button type="button" onClick={() => setEducations(educations.filter((_, i) => i !== idx))} className="text-rose-600 font-bold text-xs"><Trash2 className="size-3.5 inline" /> Xóa</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={inputCls} placeholder="Thời gian (VD: 2021 – 2025)" value={edu.period} onChange={e => { const u = [...educations]; u[idx].period = e.target.value; setEducations(u); }} />
                    <input className={inputCls} placeholder="Tên trường học" value={edu.schoolName} onChange={e => { const u = [...educations]; u[idx].schoolName = e.target.value; setEducations(u); }} />
                    <input className={inputCls} placeholder="Chuyên ngành" value={edu.major} onChange={e => { const u = [...educations]; u[idx].major = e.target.value; setEducations(u); }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-slate-800">Bằng cấp & Chứng chỉ (Certificates)</b>
                <button 
                  type="button" 
                  onClick={() => setCertificates([...certificates, { id: Date.now().toString(), title: '', issuedBy: '', issuedYear: '', imageUrl: '', isVerified: false }])}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  <Plus className="size-3.5" /> Thêm chứng chỉ
                </button>
              </div>

              {certificates.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có chứng chỉ nào. Cần ít nhất 1 chứng chỉ kèm ảnh minh chứng để nộp hồ sơ.</p>}

              {certificates.map((cert, idx) => (
                <div key={cert.id || idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-blue-600">Chứng chỉ #{idx + 1}</span>
                    <button type="button" onClick={() => setCertificates(certificates.filter((_, i) => i !== idx))} className="text-rose-600 font-bold text-xs"><Trash2 className="size-3.5 inline" /> Xóa</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={inputCls} placeholder="Tên chứng chỉ (VD: IELTS 7.0)" value={cert.title} onChange={e => { const u = [...certificates]; u[idx].title = e.target.value; setCertificates(u); }} />
                    <input className={inputCls} placeholder="Nơi cấp (VD: British Council)" value={cert.issuedBy} onChange={e => { const u = [...certificates]; u[idx].issuedBy = e.target.value; setCertificates(u); }} />
                    <input className={inputCls} placeholder="Năm cấp (VD: 2024)" value={cert.issuedYear} onChange={e => { const u = [...certificates]; u[idx].issuedYear = e.target.value; setCertificates(u); }} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Ảnh minh chứng bằng cấp / chứng chỉ</label>
                    <div className="flex items-center gap-4">
                      {cert.imageUrl ? (
                        <div className="relative size-20 rounded-xl overflow-hidden border border-slate-200">
                          <img src={cert.imageUrl} alt={cert.title} className="size-full object-cover" />
                          <button type="button" onClick={() => { const u = [...certificates]; u[idx].imageUrl = ''; setCertificates(u); }} className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5">
                            <X className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-blue-300 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer">
                          {uploadingCertIdx === idx ? (
                            <><Loader2 className="size-4 animate-spin" /> Đang tải...</>
                          ) : (
                            <><Upload className="size-4" /> Tải ảnh chứng chỉ</>
                          )}
                          <input type="file" accept="image/*" hidden disabled={uploadingCertIdx === idx} onChange={e => handlePickCertImage(idx, e)} />
                        </label>
                      )}
                      <input type="text" className={inputCls} placeholder="Hoặc dán URL đường dẫn ảnh..." value={cert.imageUrl} onChange={e => { const u = [...certificates]; u[idx].imageUrl = e.target.value; setCertificates(u); }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="size-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Bước 3: Kinh nghiệm giảng dạy & Thành tích nổi bật</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-slate-800">Kinh nghiệm giảng dạy (Experiences)</b>
                <button type="button" onClick={() => setExperiences([...experiences, { id: Date.now().toString(), period: '', role: '', company: '', description: '' }])} className="text-xs font-bold text-blue-600 hover:underline">+ Thêm kinh nghiệm</button>
              </div>

              {experiences.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có thông tin kinh nghiệm.</p>}

              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-blue-600">Kinh nghiệm #{idx + 1}</span>
                    <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="text-rose-600 font-bold text-xs"><Trash2 className="size-3.5 inline" /> Xóa</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={inputCls} placeholder="Thời gian (VD: 2022 – 2024)" value={exp.period} onChange={e => { const u = [...experiences]; u[idx].period = e.target.value; setExperiences(u); }} />
                    <input className={inputCls} placeholder="Vị trí (VD: Gia sư Ngữ văn)" value={exp.role} onChange={e => { const u = [...experiences]; u[idx].role = e.target.value; setExperiences(u); }} />
                    <input className={inputCls} placeholder="Nơi làm việc (VD: Gia sư tự do)" value={exp.company} onChange={e => { const u = [...experiences]; u[idx].company = e.target.value; setExperiences(u); }} />
                  </div>
                  <textarea className={`${inputCls} h-16 resize-none`} placeholder="Mô tả công việc giảng dạy..." value={exp.description} onChange={e => { const u = [...experiences]; u[idx].description = e.target.value; setExperiences(u); }} />
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <Field label="Thành tích & Giải thưởng nổi bật (Achievements)" hint="Nhập tên giải thưởng và nhấn Thêm">
                <div className="flex gap-2">
                  <input type="text" value={achievementInput} onChange={e => setAchievementInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(achievementInput, achievements, setAchievements, setAchievementInput); } }} placeholder="Nhập giải thưởng..." className={inputCls} />
                  <button type="button" onClick={() => addTag(achievementInput, achievements, setAchievements, setAchievementInput)} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer">Thêm</button>
                </div>
              </Field>
              <div className="flex flex-wrap gap-2 pt-1">
                {achievements.map(ac => (
                  <span key={ac} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                    <Award className="size-3 text-amber-600" /> {ac} 
                    <button type="button" onClick={() => removeTag(ac, achievements, setAchievements)} className="text-amber-600 hover:text-rose-600 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <Field label="Kỹ năng nổi bật (Skills)" hint="Nhập kỹ năng và nhấn Thêm">
                <div className="flex gap-2">
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(skillInput, skills, setSkills, setSkillInput); } }} placeholder="Nhập kỹ năng..." className={inputCls} />
                  <button type="button" onClick={() => addTag(skillInput, skills, setSkills, setSkillInput)} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer">Thêm</button>
                </div>
              </Field>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map(sk => (
                  <span key={sk} className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                    {sk} <button type="button" onClick={() => removeTag(sk, skills, setSkills)} className="text-emerald-500 hover:text-rose-600 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Bước 4: Xác nhận thông tin & Nộp hồ sơ</h2>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-xs leading-relaxed text-slate-700">
              <p><b>Họ và tên:</b> {fullName || '(Chưa nhập)'}</p>
              <p><b>Trường / Trình độ:</b> {schoolName || '(Chưa nhập)'} - {education || '(Chưa chọn)'}</p>
              <p><b>Môn học & Lớp dạy:</b> {subjectDetails.length > 0 ? subjectDetails.map(sd => `${sd.subject} (${(sd.grades || []).join(', ')})`).join('; ') : '(Chưa thêm môn nào)'}</p>
              <p><b>Khu vực nhận dạy:</b> {teachingAreas.length > 0 ? teachingAreas.join(', ') : '(Chưa chọn)'}</p>
              <p><b>Học phí công khai:</b> {hourlyRate ? `${Number(hourlyRate).toLocaleString('vi-VN')} VNĐ / buổi` : '(Chưa nhập)'}</p>
              <p><b>Số lượng chứng chỉ:</b> {certificates.length} chứng chỉ</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <ArrowLeft className="size-4" /> Bước trước
            </button>
          ) : <span />}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer">
              Tiếp theo <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="submit" disabled={isPending || uploadingAvatar} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer">
              {isPending ? 'Đang lưu...' : uploadingAvatar ? 'Đang tải ảnh...' : 'Nộp hồ sơ ngay'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}