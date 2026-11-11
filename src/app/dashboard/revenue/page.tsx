import React from 'react';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import { getTutorRevenueData } from '@/src/modules/tutor/revenue';
import TutorRevenueManager from './_components/TutorRevenueManager';

export const revalidate = 0;

export default async function RevenuePage() {
  const res = await getTutorRevenueData();

  const revenueData = res.data || {
    totalPaidRevenue: 0,
    totalUnpaidRevenue: 0,
    studentSummaries: [],
    monthlyStats: [],
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl">
          <TutorRevenueManager initialData={revenueData} />
        </main>
      </div>
    </div>
  );
}