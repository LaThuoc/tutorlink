'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import { TutorCard } from '@/src/app/components/tutors/TutorCard';
import type { TutorCardData } from '@/src/types/tutor.type';
import { Heart, ArrowLeft, Loader2, BookOpen } from 'lucide-react';

export default function SavedTutorsPage() {
  const supabase = createClient();
  const [savedTutors, setSavedTutors] = useState<TutorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedTutors() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_tutors')
        .select(`
          tutor:tutor_id (
            user_id,
            name:full_name,
            avatar:avatar_url,
            headline,
            subjects,
            grades,
            hourly_rate,
            address:district,
            is_online,
            experience_years,
            rating_avg,
            rating_count
          )
        `)
        .eq('student_id', user.id);

      if (data) {
        const tutors = data
          .map((item) => item.tutor)
          .filter(Boolean) as unknown as TutorCardData[];
        setSavedTutors(tutors);
      }
      setLoading(false);
    }

    fetchSavedTutors();
  }, []);

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