'use client';

import React, { useState, useEffect, useCallback, useActionState } from 'react';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import TutorProfileWizard, { TutorProfileFullData } from './_components/TutorProfileWizard';
import TutorProfileSubmittedView, { ProfileStatus } from './_components/TutorProfileSubmittedView';
import { updateTutorProfile } from '@/src/modules/tutor/tutor';
import { createClient } from '@/src/lib/supabase/client';

function safeParseArray<T = unknown>(val: unknown): T[] {
  if (!val) return [];
  let parsed = val;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
      try {
        parsed = JSON.parse(parsed[0]);
      } catch {
        return []
      }
    }
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  }
  return [];
}

function toProfileStatus(v: unknown): ProfileStatus {
  const s = String(v ?? '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

const EMPTY_PROFILE: TutorProfileFullData = {
  avatarUrl: '',
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  phone: '',
  province: '',
  district: '',
  address: '',
  headline: '',
  bio: '',
  quote: '',
  schoolName: '',
  education: '',
  hourlyRate: '',
  teachingAreas: [],
  teachingModes: ['Dạy Online', 'Dạy Offline'],
  skills: [],
  achievements: [],
  subjectDetails: [],
  educations: [],
  certificates: [],
  experiences: [],
  isCompleted: false,
};

export default function TutorProfilePage() {
  const [state, formAction, isPending] = useActionState(updateTutorProfile, null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<ProfileStatus>('pending');
  const [profileData, setProfileData] = useState<TutorProfileFullData>(EMPTY_PROFILE);

 
  const fetchProfileData = useCallback(async (forceCompleted = false) => {
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof, error: profErr }, { data: tut, error: tutErr }, { data: pendingReqs }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, avatar_url, gender, date_of_birth, phone, province, district, address')
          .eq('id', user.id)
          .maybeSingle(),
        supabase.from('tutor_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('certificate_requests')
          .select('id, title, issued_by, issue_year, detail, certificate_url')
          .eq('tutor_id', user.id)
          .eq('status', 'Pending'),
      ]);

      if (profErr) console.error('[TutorProfile] Lỗi đọc profiles:', profErr);
      if (tutErr) console.error('[TutorProfile] Lỗi đọc tutor_profiles:', tutErr);

      if (tut) setStatus(toProfileStatus(tut.verification_status));

      const subjectDetails = safeParseArray(tut?.subject_details);
      const isCompleted = Boolean(
        forceCompleted || tut?.is_completed || (tut?.headline && subjectDetails.length > 0),
      );

      if (tut && isCompleted) {
        const savedCerts = safeParseArray<TutorProfileFullData['certificates'][number]>(
          tut.certificates_data ?? tut.certificates,
        );
        const savedUrls = new Set(savedCerts.map((c) => c.imageUrl));
        const pendingCerts = (pendingReqs || [])
          .filter((r) => r.certificate_url && !savedUrls.has(r.certificate_url))
          .map((r) => ({
            id: r.id,
            title: r.title || 'Bằng cấp / Chứng chỉ',
            issuedBy: r.issued_by || '',
            issuedYear: r.issue_year || '',
            detail: r.detail || '',
            imageUrl: r.certificate_url,
            isVerified: false,
          }));
        const mergedCertificates = [...savedCerts, ...pendingCerts];

        const modes = safeParseArray<string>(tut.teaching_modes);
        setProfileData({
          avatarUrl: prof?.avatar_url || '',
          fullName: prof?.full_name || '',
          gender: prof?.gender || 'Nam',
          dateOfBirth: prof?.date_of_birth || '',
          phone: prof?.phone || '',
          province: prof?.province || '',
          district: prof?.district || '',
          address: tut.address || prof?.address || '',
          headline: tut.headline || '',
          bio: tut.bio || '',
          quote: tut.quote || '',
          schoolName: tut.school_name || '',
          education: tut.education || '',
          hourlyRate: tut.hourly_rate || '',
          teachingAreas: safeParseArray<string>(tut.teaching_areas),
          teachingModes: modes.length > 0 ? modes : ['Dạy Online', 'Dạy Offline'],
          skills: safeParseArray<string>(tut.skills),
          achievements: safeParseArray<string>(tut.achievements),
          subjectDetails: subjectDetails as TutorProfileFullData['subjectDetails'],
          educations: safeParseArray(tut.educations),
          certificates: mergedCertificates, // >>> SỬA: dùng danh sách đã gộp
          experiences: safeParseArray(tut.experiences),
          isCompleted: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (state?.success) {
      fetchProfileData(Boolean(state.isCompleted));
    }
  }, [state, fetchProfileData]);

  const isSubmitted = profileData.isCompleted;
  const waitingRefetch = Boolean(state?.success && state?.isCompleted) && !profileData.isCompleted;

  if (loading || waitingRefetch) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-xs font-bold text-slate-500">
        Đang tải dữ liệu hồ sơ gia sư...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
          {!isSubmitted ? (
            <TutorProfileWizard
              data={profileData}
              formAction={formAction}
              isPending={isPending}
              state={state}
            />
          ) : (
            <TutorProfileSubmittedView
              key={profileData.phone || profileData.fullName || 'tutor-view'}
              data={profileData}
              status={status}
              onSaved={() => fetchProfileData()}
            />
          )}
        </main>
      </div>
    </div>
  );
}
