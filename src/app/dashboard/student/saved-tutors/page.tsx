'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import { TutorCard } from '@/src/app/_components/tutors/TutorCard';
import type { TutorCardData } from '@/src/types/tutor.type';
import { Heart, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { StudentBreadcrumb } from '@/src/app/_components/layout/returnHome';
import { SavedTutorRow } from '@/src/types/tutor.type';
export default function SavedTutorsPage() {
  const supabase = createClient();
  const [savedTutors, setSavedTutors] = useState<TutorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedTutors() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false)
        return
      };

      const { data, error } = await supabase
        .from('saved_tutors')
        .select(`
          tutor_id,
          tutor_user:profiles!saved_tutors_tutor_id_fkey (
            full_name,
            avatar_url,
            district,
            tutor_profile:tutor_profiles!tutor_profiles_user_id_fkey (
              headline,
              subjects,
              grades,
              hourly_rate,
              address,
              is_online,
              experience_years
            ), 
            reviews: reviews!reviews_tutor_id_fkey(
              rating
            )
          )
        `)
        .eq('student_id', user.id);
      if (error) {
        console.error('Lỗi khi lấy danh sách gia sư đã lưu:', error);
      }

       if (data) {
        const formattedTutors: TutorCardData[] = (data as unknown as SavedTutorRow[])
          .reduce<TutorCardData[]>((acc, item) => {
            const u = item.tutor_user;
            if (!u) return acc;

            const tp = Array.isArray(u.tutor_profile) ? u.tutor_profile[0] : u.tutor_profile;

            const reviews = u.reviews || [];
            const ratingCount = reviews.length;
            const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const ratingAvg = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : 0;

            acc.push({
            user_id: item.tutor_id,
            name: u.full_name || 'Gia sư',
            avatar: u.avatar_url || null,
            headline: tp?.headline || '',
            subjects: tp?.subjects || [],
            grades: tp?.grades || [],
            hourly_rate: Number(tp?.hourly_rate) || 0,
            address: u.district || tp?.address || 'Chưa cập nhật',
            is_online: tp?.is_online ?? true,
            experience_years: tp?.experience_years || 0,
            rating_avg: ratingAvg,
            rating_count: ratingCount,
            });
            return acc;
          }, [])
        setSavedTutors(formattedTutors);
      }
      setLoading(false);
    }

    fetchSavedTutors();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <StudentBreadcrumb current="Gia sư đã lưu"/>
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
              <Heart className="size-4 fill-rose-500 text-rose-500" /> Gia sư quan tâm
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Danh sách Gia sư đã lưu</h1>
          </div>

          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
          >
            <BookOpen className="size-4" /> Tìm thêm gia sư khác
          </Link>
        </div>

        {/* LIST GIA SƯ */}
        {savedTutors.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Heart className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">Chưa lưu gia sư nào</h3>
            <p className="mt-1 text-xs text-slate-500">Hãy nhấn biểu tượng trái tim khi tìm kiếm gia sư để lưu lại danh sách này nhé!</p>
            <Link href="/tutors" className="mt-6 inline-flex h-10 items-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
              Khám phá danh sách gia sư
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedTutors.map((tutor) => (
              <TutorCard key={tutor.user_id} tutor={tutor} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}