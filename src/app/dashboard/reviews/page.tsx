import React from 'react';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import { getTutorReviews } from '@/src/modules/reviews/review';
import TutorReviewsManager from './_components/TutorReviewsManager';

export const revalidate = 0;

export default async function TutorReviewsPage() {
  const res = await getTutorReviews();

  const reviews = res.data || [];
  const stats = res.stats || {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl">
          <TutorReviewsManager initialReviews={reviews} stats={stats} />
        </main>
      </div>
    </div>
  );
}